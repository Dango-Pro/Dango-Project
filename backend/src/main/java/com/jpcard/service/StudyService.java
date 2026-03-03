package com.jpcard.service;

import com.jpcard.controller.dto.IntervalPreviewResponse;
import com.jpcard.domain.card.Card;
import com.jpcard.domain.study.StudyLog;
import com.jpcard.domain.study.StudyStatus;
import com.jpcard.domain.study.UserCardProgress;
import com.jpcard.domain.user.User;
import com.jpcard.repository.CardRepository;
import com.jpcard.repository.StudyLogRepository;
import com.jpcard.repository.UserCardProgressRepository;
import com.jpcard.repository.DeckRepository;
import com.jpcard.repository.UserRepository;
import com.jpcard.util.ResourceNotFoundException;
import com.jpcard.service.algorithm.AlgorithmFactory;
import com.jpcard.service.algorithm.SpacedRepetitionAlgorithm;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyService {

    private final UserCardProgressRepository progressRepository;
    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final StudyLogRepository studyLogRepository;
    private final DeckRepository deckRepository;
    private final AlgorithmFactory algorithmFactory;
    private final PlatformTransactionManager transactionManager;
    private final Random random = new Random();

    // Default Fallback. Now we use deck-specific steps.
    private static final int[] DEFAULT_LEARNING_STEPS = { 1, 10 };
    private static final int GRADUATING_INTERVAL = 1440; // 1 day in minutes
    private static final int EASY_INTERVAL = 4 * 1440; // 4 days
    private static final int LEECH_THRESHOLD = 8; // Fail count to suspend

    private int[] parseLearningSteps(String steps) {
        if (steps == null || steps.isEmpty())
            return DEFAULT_LEARNING_STEPS;
        try {
            String[] parts = steps.split(",");
            int[] result = new int[parts.length];
            for (int i = 0; i < parts.length; i++) {
                result[i] = Integer.parseInt(parts[i].trim());
            }
            return result;
        } catch (NumberFormatException e) {
            return DEFAULT_LEARNING_STEPS;
        }
    }

    @Transactional(readOnly = true)
    public StudySessionResult getDueCards(Long userId, Long deckId, boolean studyMore) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("해당 유저를 찾을 수 없습니다."));

        // 1. Timezone Setup
        String userZone = user.getTimezone() != null ? user.getTimezone() : "UTC";
        ZoneId zoneId = ZoneId.of(userZone);

        ZonedDateTime nowZoned = ZonedDateTime.now(zoneId);
        ZonedDateTime userStartOfDay = nowZoned.toLocalDate().atStartOfDay(zoneId);
        ZonedDateTime userEndOfDay = nowZoned.toLocalDate().atTime(23, 59, 59).atZone(zoneId);

        LocalDateTime startParam = userStartOfDay.withZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();
        LocalDateTime endParam = userEndOfDay.withZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();

        // 2. Check Review Limit (For DUE cards)
        int reviewLimit = user.getReviewLimit();
        long reviewsToday = studyLogRepository.countReviewsToday(userId, deckId, startParam, endParam);

        boolean reviewLimitReached = false;
        int remainingReviews = reviewLimit - (int) reviewsToday;
        if (remainingReviews <= 0 && !studyMore) {
            reviewLimitReached = true;
        }

        List<Card> dueCards = Collections.emptyList();
        if (!reviewLimitReached || studyMore) {
            int fetchLimit = 100; // Default safety cap
            if (!studyMore && remainingReviews > 0) {
                fetchLimit = Math.min(remainingReviews, 100);
            } else if (!studyMore && remainingReviews <= 0) {
                fetchLimit = 0;
            }

            if (fetchLimit > 0) {
                List<UserCardProgress> dueProgress = progressRepository.findDueCardsWithLimit(
                        userId,
                        deckId,
                        LocalDateTime.now(),
                        PageRequest.of(0, fetchLimit));
                dueCards = dueProgress.stream().map(UserCardProgress::getCard).collect(Collectors.toList());
            }
        }

        // 3. Get NEW cards with limits
        int dailyLimit = user.getDailyLimit();
        if (deckId != null) {
            dailyLimit = deckRepository.findById(deckId).map(com.jpcard.domain.deck.Deck::getDailyNewCardLimit)
                    .orElse(dailyLimit);
        }

        long newCardsStudiedToday = progressRepository.countNewCardsStudiedToday(userId, deckId, startParam, endParam);

        int remainingNewLimit = dailyLimit - (int) newCardsStudiedToday;
        boolean newLimitReached = false;

        if (remainingNewLimit <= 0 && !studyMore) {
            newLimitReached = true;
        }

        int fetchCount = 0;
        if (!newLimitReached) {
            if (studyMore) {
                fetchCount = (remainingNewLimit > 0) ? remainingNewLimit : 10;
            } else {
                fetchCount = remainingNewLimit;
            }
        }

        List<Card> newCards = Collections.emptyList();
        if (fetchCount > 0) {
            // Apply Pagination Limit (e.g., 50)
            int safetyLimit = Math.min(fetchCount, 50);
            newCards = cardRepository.findNewCards(deckId, userId, PageRequest.of(0, safetyLimit));
        }

        List<Card> allCards = new ArrayList<>(dueCards);
        allCards.addAll(newCards);

        // Safety cap for total session size (Memory Protection)
        if (allCards.size() > 100) {
            allCards = allCards.subList(0, 100);
        }

        // "limitReached" generally implies either limit is hit preventing further
        // study.
        // We can combine them or return separate flags.
        // For frontend compatibility (StudySessionResult), let's say limitReached if
        // BOTH are reached?
        // Or if the one relevant to current potential cards is reached.
        // If we have 0 cards returned, and it's because of limits, limitReached = true.

        boolean isLimitReached = (allCards.isEmpty() && (newLimitReached || reviewLimitReached));

        return new StudySessionResult(
                allCards,
                isLimitReached,
                newCardsStudiedToday,
                dailyLimit,
                newCards.size(),
                dueCards.size());
    }

    /**
     * Preview the next interval (in minutes) for each rating option WITHOUT saving
     * to DB.
     * Used by the frontend to display Anki-style interval labels on study buttons.
     */
    @Transactional(readOnly = true)
    public IntervalPreviewResponse previewIntervals(Long userId, Long cardId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));

        UserCardProgress base = progressRepository.findByUserIdAndCardId(userId, cardId)
                .orElse(null);

        return new IntervalPreviewResponse(
                simulateInterval(base, card, "FAIL"),
                simulateInterval(base, card, "HARD"),
                simulateInterval(base, card, "GOOD"),
                simulateInterval(base, card, "EASY"));
    }

    /**
     * Simulate the algorithm on a throw-away copy and return the resulting
     * intervalMinutes.
     */
    private int simulateInterval(UserCardProgress base, Card card, String rating) {
        // Build a transient copy – never persisted
        UserCardProgress sim = new UserCardProgress();
        sim.setCard(card);
        if (base != null) {
            sim.setStatus(base.getStatus());
            sim.setIntervalMinutes(base.getIntervalMinutes());
            sim.setEase(base.getEase());
            sim.setRepetitions(base.getRepetitions());
            sim.setLearningStep(base.getLearningStep());
            sim.setLapses(base.getLapses());
            sim.setDifficulty(base.getDifficulty());
            sim.setStability(base.getStability());
        } else {
            // Brand-new card defaults
            sim.setStatus(StudyStatus.NEW);
            sim.setIntervalMinutes(0);
            sim.setEase(2.5);
            sim.setRepetitions(0);
            sim.setLearningStep(0);
            sim.setLapses(0);
        }

        SpacedRepetitionAlgorithm algo = algorithmFactory.getAlgorithm(card.getDeck().getAlgorithmType());
        algo.processReview(sim, rating, LocalDateTime.now());
        return sim.getIntervalMinutes();
    }

    public void processReview(Long userId, Long cardId, String rating) {
        TransactionTemplate tmpl = new TransactionTemplate(transactionManager);
        int maxRetries = 3;

        for (int i = 0; i < maxRetries; i++) {
            try {
                tmpl.execute(status -> {
                    processReviewLogic(userId, cardId, rating);
                    return null;
                });
                return; // Success
            } catch (DataIntegrityViolationException | ObjectOptimisticLockingFailureException e) {
                if (i == maxRetries - 1) {
                    throw e; // Rethrow on last attempt
                }
                try {
                    Thread.sleep(50);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }
    }

    private void processReviewLogic(Long userId, Long cardId, String rating) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("해당 유저를 찾을 수 없습니다."));
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));

        UserCardProgress progress = progressRepository.findByUserIdAndCardId(userId, cardId)
                .orElse(new UserCardProgress());

        if (progress.getId() == null) {
            progress.setUser(user);
            progress.setCard(card);
            progress.setStatus(StudyStatus.NEW);
            progress.setLearningStep(0); // Initialize step
        }

        if (progress.getFirstStudiedAt() == null) {
            progress.setFirstStudiedAt(LocalDateTime.now());
        }

        // Save History Log
        StudyLog log = new StudyLog();
        log.setUser(user);
        log.setCard(card);
        log.setRating(rating);
        log.setStudiedAt(LocalDateTime.now());
        studyLogRepository.save(log);

        applyAlgorithm(progress, rating);

        // Leech Check
        if ("FAIL".equalsIgnoreCase(rating)) {
            progress.setLapses(progress.getLapses() + 1);
            if (progress.getLapses() >= LEECH_THRESHOLD) {
                progress.setStatus(StudyStatus.SUSPENDED);
            }
        }

        progressRepository.save(progress);

        // 4. Sibling Burying
        burySiblings(user.getId(), card);
    }

    private void applyAlgorithm(UserCardProgress p, String rating) {
        SpacedRepetitionAlgorithm algo = algorithmFactory.getAlgorithm(p.getCard().getDeck().getAlgorithmType());
        algo.processReview(p, rating, LocalDateTime.now());
    }

    // 4. Sibling Burying
    private void burySiblings(Long userId, Card currentCard) {
        if (currentCard.getNoteId() == null)
            return;

        List<UserCardProgress> siblings = progressRepository.findByUserIdAndCardNoteId(userId, currentCard.getNoteId());
        LocalDateTime tomorrow = LocalDate.now().plusDays(1).atStartOfDay();

        for (UserCardProgress sibling : siblings) {
            // Skip current card
            if (sibling.getCard().getId().equals(currentCard.getId()))
                continue;

            // Only bury if it was due today or earlier
            if (sibling.getNextReview().isBefore(tomorrow)) {
                sibling.setNextReview(tomorrow.plusHours(4)); // Push to tomorrow + 4h (start of day buffer)
                // Note: We don't change interval or ease, just the scheduling.
                progressRepository.save(sibling);
            }
        }
    }
}
