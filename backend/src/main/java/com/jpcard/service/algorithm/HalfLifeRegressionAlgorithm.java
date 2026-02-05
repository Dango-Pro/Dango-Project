package com.jpcard.service.algorithm;

import com.jpcard.domain.study.StudyStatus;
import com.jpcard.domain.study.UserCardProgress;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Half-Life Regression Algorithm Implementation.
 * Based on Duolingo's approach to spaced repetition.
 * Models memory decay using half-life (time until 50% recall probability).
 */
@Component
public class HalfLifeRegressionAlgorithm implements SpacedRepetitionAlgorithm {

    private static final int[] LEARNING_STEPS = { 1, 10 }; // minutes
    private static final double INITIAL_HALF_LIFE = 0.25; // 6 hours in days
    private static final double MIN_HALF_LIFE = 0.0417; // 1 hour in days
    private static final double MAX_HALF_LIFE = 365.0; // 1 year in days

    @Override
    public void processReview(UserCardProgress p, String rating, LocalDateTime now) {
        // Initialize half-life if first review
        if (p.getHalfLife() == null) {
            p.setHalfLife(INITIAL_HALF_LIFE);
        }

        switch (rating.toUpperCase()) {
            case "FAIL":
                handleFail(p, now);
                break;
            case "HARD":
                handleHard(p, now);
                break;
            case "GOOD":
                handleGood(p, now);
                break;
            case "EASY":
                handleEasy(p, now);
                break;
        }
    }

    private void handleFail(UserCardProgress p, LocalDateTime now) {
        // Reset to learning
        p.setStatus(StudyStatus.LEARNING);
        p.setLearningStep(0);
        p.setIntervalMinutes(LEARNING_STEPS[0]);
        p.setNextReview(now.plusMinutes(LEARNING_STEPS[0]));

        // Significantly reduce half-life
        double newHalfLife = Math.max(MIN_HALF_LIFE, p.getHalfLife() * 0.5);
        p.setHalfLife(newHalfLife);
        p.setRepetitions(0);
    }

    private void handleHard(UserCardProgress p, LocalDateTime now) {
        if (p.getStatus() == StudyStatus.NEW || p.getStatus() == StudyStatus.LEARNING) {
            // Stay in current learning step
            int currentStep = p.getLearningStep();
            p.setIntervalMinutes(LEARNING_STEPS[Math.min(currentStep, LEARNING_STEPS.length - 1)]);
            p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
            p.setStatus(StudyStatus.LEARNING);
        } else {
            // Modest increase in half-life
            double newHalfLife = Math.min(MAX_HALF_LIFE, p.getHalfLife() * 1.2);
            p.setHalfLife(newHalfLife);

            // Schedule next review at 50% recall probability (1 half-life)
            int intervalMinutes = (int) (newHalfLife * 1440);
            p.setIntervalMinutes(Math.max(1440, intervalMinutes));
            p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
        }
    }

    private void handleGood(UserCardProgress p, LocalDateTime now) {
        if (p.getStatus() == StudyStatus.NEW || p.getStatus() == StudyStatus.LEARNING) {
            // Advance in learning
            int nextStep = p.getLearningStep() + 1;
            if (nextStep < LEARNING_STEPS.length) {
                p.setLearningStep(nextStep);
                p.setIntervalMinutes(LEARNING_STEPS[nextStep]);
                p.setStatus(StudyStatus.LEARNING);
                p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
            } else {
                // Graduate
                p.setStatus(StudyStatus.REVIEW);
                p.setLearningStep(0);

                // Set initial half-life for graduated card
                double initialHalfLife = 1.0; // 1 day
                p.setHalfLife(initialHalfLife);

                int intervalMinutes = (int) (initialHalfLife * 1440);
                p.setIntervalMinutes(intervalMinutes);
                p.setNextReview(now.plusMinutes(intervalMinutes));
                p.setRepetitions(1);
            }
        } else {
            // Review phase - increase half-life based on performance
            double retrievability = calculateRetrievability(p, now);

            // Update half-life using regression model
            // If reviewed early (high retrievability), increase less
            // If reviewed late (low retrievability), increase more
            double multiplier = 1.5 + (1.0 - retrievability) * 0.5; // 1.5 to 2.0
            double newHalfLife = Math.min(MAX_HALF_LIFE, p.getHalfLife() * multiplier);
            p.setHalfLife(newHalfLife);

            // Schedule next review at 50% recall probability
            int intervalMinutes = (int) (newHalfLife * 1440);
            p.setIntervalMinutes(Math.max(1440, intervalMinutes));
            p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
            p.setRepetitions(p.getRepetitions() + 1);
        }
    }

    private void handleEasy(UserCardProgress p, LocalDateTime now) {
        if (p.getStatus() == StudyStatus.NEW || p.getStatus() == StudyStatus.LEARNING) {
            // Immediate graduation with bonus
            p.setStatus(StudyStatus.REVIEW);
            p.setLearningStep(0);

            double initialHalfLife = 2.0; // 2 days (bonus)
            p.setHalfLife(initialHalfLife);

            int intervalMinutes = (int) (initialHalfLife * 1440);
            p.setIntervalMinutes(intervalMinutes);
            p.setNextReview(now.plusMinutes(intervalMinutes));
            p.setRepetitions(1);
        } else {
            // Review phase with easy bonus
            double retrievability = calculateRetrievability(p, now);

            // Larger multiplier for easy
            double multiplier = 2.0 + (1.0 - retrievability) * 0.5; // 2.0 to 2.5
            double newHalfLife = Math.min(MAX_HALF_LIFE, p.getHalfLife() * multiplier);
            p.setHalfLife(newHalfLife);

            int intervalMinutes = (int) (newHalfLife * 1440);
            p.setIntervalMinutes(Math.max(1440, intervalMinutes));
            p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
            p.setRepetitions(p.getRepetitions() + 1);
        }
    }

    /**
     * Calculate retrievability (probability of recall) based on time elapsed.
     * Uses exponential decay: R(t) = 2^(-t/h) where h is half-life.
     */
    private double calculateRetrievability(UserCardProgress p, LocalDateTime now) {
        if (p.getNextReview() == null || p.getHalfLife() == null || p.getHalfLife() == 0) {
            return 0.9; // Default high retrievability
        }

        long minutesElapsed = java.time.Duration.between(p.getNextReview(), now).toMinutes();
        if (minutesElapsed <= 0) {
            return 0.9; // Reviewed early
        }

        double daysElapsed = minutesElapsed / 1440.0;
        return Math.pow(2, -daysElapsed / p.getHalfLife());
    }

    @Override
    public String getAlgorithmName() {
        return "Half-Life Regression";
    }
}
