package com.jpcard.service;

import com.jpcard.domain.card.Card;
import com.jpcard.domain.study.StudyLog;
import com.jpcard.domain.study.StudyStatus;
import com.jpcard.domain.study.UserCardProgress;
import com.jpcard.domain.user.User;
import com.jpcard.repository.CardRepository;
import com.jpcard.repository.StudyLogRepository;
import com.jpcard.repository.UserCardProgressRepository;
import com.jpcard.repository.UserRepository;
import com.jpcard.util.ResourceNotFoundException;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyService {

    private final UserCardProgressRepository progressRepository;
    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final StudyLogRepository studyLogRepository;
    private final PlatformTransactionManager transactionManager;
    private final com.jpcard.service.algorithm.AlgorithmFactory algorithmFactory;

    // Leech detection threshold
    private static final int LEECH_THRESHOLD = 8; // Fail count to suspend

    @Transactional(readOnly = true)
    public StudySessionResult getDueCards(Long userId, Long deckId, boolean studyMore) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

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
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
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
        LocalDateTime now = LocalDateTime.now();

        // Get the algorithm from the deck
        com.jpcard.domain.study.AlgorithmType algorithmType = p.getCard().getDeck().getAlgorithmType();

        // Get the appropriate algorithm implementation
        com.jpcard.service.algorithm.SpacedRepetitionAlgorithm algorithm = algorithmFactory.getAlgorithm(algorithmType);

        // Delegate to the algorithm
        algorithm.processReview(p, rating, now);
    }

    // Sibling Burying
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
