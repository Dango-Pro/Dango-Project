package com.jpcard.service.algorithm;

import com.jpcard.domain.study.StudyStatus;
import com.jpcard.domain.study.UserCardProgress;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Random;

/**
 * SM-2 (SuperMemo 2) Algorithm Implementation.
 * Classic spaced repetition algorithm with ease factor.
 * This is the current default algorithm.
 */
@Component
public class SM2Algorithm implements SpacedRepetitionAlgorithm {

    private static final int[] DEFAULT_LEARNING_STEPS = { 1, 10 };
    private static final int GRADUATING_INTERVAL = 1440; // 1 day in minutes
    private static final int EASY_INTERVAL = 4 * 1440; // 4 days
    private final Random random = new Random();

    @Override
    public void processReview(UserCardProgress p, String rating, LocalDateTime now) {
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
                p.setRepetitions(0);
                break;

            case "HARD":
                if (p.getStatus() == StudyStatus.REVIEW) {
                    // 1.2x multiplier (smaller than Good's ease)
                    int newInterval = (int) (p.getIntervalMinutes() * 1.2);
                    p.setIntervalMinutes(Math.max(1, newInterval));
                    p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
                    p.setEase(Math.max(1.3, p.getEase() - 0.15));
                } else {
                    // In learning, Hard means "repeat current step"
                    int currentStepInterval = (p.getLearningStep() < learningSteps.length)
                            ? learningSteps[p.getLearningStep()]
                            : GRADUATING_INTERVAL;
                    p.setIntervalMinutes(currentStepInterval);
                    p.setNextReview(now.plusMinutes(currentStepInterval));
                }
                break;

            case "GOOD":
                if (p.getStatus() == StudyStatus.NEW || p.getStatus() == StudyStatus.LEARNING) {
                    // Multi-step Learning
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
                    // Fuzzing
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

                    // Fuzzing
                    easyInterval = applyFuzz(easyInterval);

                    p.setIntervalMinutes(Math.max(EASY_INTERVAL, easyInterval));
                    p.setRepetitions(p.getRepetitions() + 1);
                    p.setEase(p.getEase() + 0.15);
                }
                p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
                break;
        }
    }

    @Override
    public String getAlgorithmName() {
        return "SM-2";
    }

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

    // Fuzzing: +0-5% variation for intervals > 2 days
    private int applyFuzz(int intervalMinutes) {
        if (intervalMinutes < 2 * 1440)
            return intervalMinutes; // No fuzz for < 2 days

        // Only extend the interval (1.0 ~ 1.05)
        double fuzzFactor = 1.0 + (random.nextDouble() * 0.05);
        return (int) (intervalMinutes * fuzzFactor);
    }
}
