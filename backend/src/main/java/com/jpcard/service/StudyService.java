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
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyService {

    private final UserCardProgressRepository progressRepository;
    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final StudyLogRepository studyLogRepository;
    private final PlatformTransactionManager transactionManager;
    private final Random random = new Random();

    // Default Fallback. Now we use deck-specific steps.
    private static final int[] DEFAULT_LEARNING_STEPS = {1, 10};
    private static final int GRADUATING_INTERVAL = 1440; // 1 day in minutes
    private static final int EASY_INTERVAL = 4 * 1440;   // 4 days
    private static final int LEECH_THRESHOLD = 8; // Fail count to suspend

    private int[] parseLearningSteps(String steps) {
        if (steps == null || steps.isEmpty()) return DEFAULT_LEARNING_STEPS;
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
                     PageRequest.of(0, fetchLimit)
                 );
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

        // "limitReached" generally implies either limit is hit preventing further study.
        // We can combine them or return separate flags.
        // For frontend compatibility (StudySessionResult), let's say limitReached if BOTH are reached?
        // Or if the one relevant to current potential cards is reached.
        // If we have 0 cards returned, and it's because of limits, limitReached = true.

        boolean isLimitReached = (allCards.isEmpty() && (newLimitReached || reviewLimitReached));

        return new StudySessionResult(
            allCards,
            isLimitReached,
            newCardsStudiedToday,
            dailyLimit,
            newCards.size(),
            dueCards.size()
        );
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
        LocalDateTime now = LocalDateTime.now();
        int[] learningSteps = parseLearningSteps(p.getCard().getDeck().getLearningSteps());

        switch (rating.toUpperCase()) {
            case "FAIL": // Again
                // Reset to first step
                p.setStatus(StudyStatus.LEARNING);
                p.setLearningStep(0);
                p.setIntervalMinutes(learningSteps[0]); // First step
                p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));

                // Penalty
                p.setEase(Math.max(1.3, p.getEase() - 0.2));
                // Do not reset repetitions completely if it was mature?
                // SM-2 says reset reps to 0 on lapse.
                p.setRepetitions(0);
                break;

            case "HARD":
                // 2. Improved Hard Logic
                if (p.getStatus() == StudyStatus.REVIEW) {
                    // 1.2x multiplier (smaller than Good's ease)
                    int newInterval = (int) (p.getIntervalMinutes() * 1.2);
                    p.setIntervalMinutes(Math.max(1, newInterval)); // Ensure at least 1 min increase? No, keep logic simple.
                    p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
                    p.setEase(Math.max(1.3, p.getEase() - 0.15));
                    // Do not reset repetitions
                } else {
                    // In learning, Hard means "repeat current step" or avg
                    // We just keep current step interval
                    int currentStepInterval = (p.getLearningStep() < learningSteps.length)
                            ? learningSteps[p.getLearningStep()]
                            : GRADUATING_INTERVAL;
                    p.setIntervalMinutes(currentStepInterval);
                    p.setNextReview(now.plusMinutes(currentStepInterval));
                }
                break;

            case "GOOD":
                if (p.getStatus() == StudyStatus.NEW || p.getStatus() == StudyStatus.LEARNING) {
                    // 3. Multi-step Learning
                    if (p.getLearningStep() < learningSteps.length - 1) {
                        // Advance to next learning step
                        p.setLearningStep(p.getLearningStep() + 1);
                        p.setIntervalMinutes(learningSteps[p.getLearningStep()]);
                        p.setStatus(StudyStatus.LEARNING);
                    } else {
                        // Graduate
                        p.setStatus(StudyStatus.REVIEW);
                        p.setLearningStep(0); // Reset for future lapses
                        p.setIntervalMinutes(GRADUATING_INTERVAL); // 1 day
                        p.setRepetitions(1);
                    }
                } else {
                    // Review mode
                    int goodInterval = 1440; // fallback
                    if (p.getRepetitions() > 0) {
                        goodInterval = (int) (p.getIntervalMinutes() * p.getEase());
                    }
                    // 1. Fuzzing
                    goodInterval = applyFuzz(goodInterval);

                    p.setIntervalMinutes(Math.max(1440, goodInterval));
                    p.setRepetitions(p.getRepetitions() + 1);
                    p.setStatus(StudyStatus.REVIEW);
                }
                p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
                break;

            case "EASY":
                // Immediate graduation or bonus
                if (p.getStatus() == StudyStatus.NEW || p.getStatus() == StudyStatus.LEARNING) {
                    p.setStatus(StudyStatus.REVIEW);
                    p.setIntervalMinutes(EASY_INTERVAL); // 4 days
                    p.setRepetitions(1);
                } else {
                    int easyInterval = (int) (p.getIntervalMinutes() * p.getEase() * 1.3); // Bonus multiplier

                    // 1. Fuzzing
                    easyInterval = applyFuzz(easyInterval);

                    p.setIntervalMinutes(Math.max(EASY_INTERVAL, easyInterval));
                    p.setRepetitions(p.getRepetitions() + 1);
                    p.setEase(p.getEase() + 0.15);
                }
                p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
                break;
        }
    }

    // 1. Fuzzing: +0-5% variation for intervals > 2 days (Prevents "too soon" regressions)
    private int applyFuzz(int intervalMinutes) {
        if (intervalMinutes < 2 * 1440) return intervalMinutes; // No fuzz for < 2 days

        // Only extend the interval (1.0 ~ 1.05) to avoid showing cards sooner than algorithm intended
        double fuzzFactor = 1.0 + (random.nextDouble() * 0.05);
        return (int) (intervalMinutes * fuzzFactor);
    }

    // 4. Sibling Burying
    private void burySiblings(Long userId, Card currentCard) {
        if (currentCard.getNoteId() == null) return;

        List<UserCardProgress> siblings = progressRepository.findByUserIdAndCardNoteId(userId, currentCard.getNoteId());
        LocalDateTime tomorrow = LocalDate.now().plusDays(1).atStartOfDay();

        for (UserCardProgress sibling : siblings) {
            // Skip current card
            if (sibling.getCard().getId().equals(currentCard.getId())) continue;

            // Only bury if it was due today or earlier
            if (sibling.getNextReview().isBefore(tomorrow)) {
                sibling.setNextReview(tomorrow.plusHours(4)); // Push to tomorrow + 4h (start of day buffer)
                // Note: We don't change interval or ease, just the scheduling.
                progressRepository.save(sibling);
            }
        }
    }
}
