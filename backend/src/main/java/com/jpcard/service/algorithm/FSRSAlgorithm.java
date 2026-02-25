package com.jpcard.service.algorithm;

import com.jpcard.domain.study.StudyStatus;
import com.jpcard.domain.study.UserCardProgress;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * FSRS (Free Spaced Repetition Scheduler) Algorithm Implementation.
 * Modern ML-based algorithm using stability and difficulty parameters.
 * Based on FSRS v4 specification.
 */
@Component
public class FSRSAlgorithm implements SpacedRepetitionAlgorithm {

    // FSRS default parameters
    private static final double[] W = {
            0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61
    };

    private static final int[] LEARNING_STEPS = { 1, 10 }; // minutes
    private static final int GRADUATING_INTERVAL = 1440; // 1 day in minutes

    @Override
    public void processReview(UserCardProgress p, String rating, LocalDateTime now) {
        // Initialize FSRS parameters if first review
        if (p.getStability() == null) {
            p.setStability(0.0);
            p.setDifficulty(5.0); // Default difficulty (1-10 scale)
        }

        switch (rating.toUpperCase()) {
            case "FAIL": // Again
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

        // Update difficulty (make it harder)
        double newDifficulty = Math.min(10.0, p.getDifficulty() + 1.0);
        p.setDifficulty(newDifficulty);

        // Reset stability
        p.setStability(W[0]);
        p.setRepetitions(0);
    }

    private void handleHard(UserCardProgress p, LocalDateTime now) {
        if (p.getStatus() == StudyStatus.NEW || p.getStatus() == StudyStatus.LEARNING) {
            // In learning phase
            int currentStep = p.getLearningStep();
            p.setIntervalMinutes(LEARNING_STEPS[Math.min(currentStep, LEARNING_STEPS.length - 1)]);
            p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
            p.setStatus(StudyStatus.LEARNING);
        } else {
            // In review phase
            double newStability = p.getStability() * W[15]; // Hard multiplier
            int intervalMinutes = (int) (newStability * 1440); // Convert days to minutes

            p.setStability(newStability);
            p.setIntervalMinutes(Math.max(1440, intervalMinutes));
            p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));

            // Increase difficulty slightly
            p.setDifficulty(Math.min(10.0, p.getDifficulty() + 0.5));
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
            } else {
                // Graduate
                p.setStatus(StudyStatus.REVIEW);
                p.setLearningStep(0);

                // Calculate initial stability based on difficulty
                double initialStability = W[2] + (10.0 - p.getDifficulty()) * W[3];
                p.setStability(initialStability);

                int intervalMinutes = (int) (initialStability * 1440);
                p.setIntervalMinutes(Math.max(GRADUATING_INTERVAL, intervalMinutes));
                p.setRepetitions(1);
            }
            p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
        } else {
            // Review phase - calculate new stability
            double retrievability = calculateRetrievability(p, now);
            double newStability = p.getStability() * (1 + Math.exp(W[8]) *
                    (11 - p.getDifficulty()) * Math.pow(p.getStability(), -W[9]) *
                    (Math.exp((1 - retrievability) * W[10]) - 1));

            int intervalMinutes = (int) (newStability * 1440);

            p.setStability(newStability);
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

            double initialStability = W[2] + (10.0 - p.getDifficulty()) * W[3] * 1.5; // Bonus
            p.setStability(initialStability);

            int intervalMinutes = (int) (initialStability * 1440);
            p.setIntervalMinutes(Math.max(GRADUATING_INTERVAL * 2, intervalMinutes));
            p.setRepetitions(1);
        } else {
            // Review phase with easy bonus
            double retrievability = calculateRetrievability(p, now);
            double newStability = p.getStability() * (1 + Math.exp(W[8]) *
                    (11 - p.getDifficulty()) * Math.pow(p.getStability(), -W[9]) *
                    (Math.exp((1 - retrievability) * W[10]) - 1)) * W[16]; // Easy bonus

            int intervalMinutes = (int) (newStability * 1440);

            p.setStability(newStability);
            p.setIntervalMinutes(Math.max(1440, intervalMinutes));
            p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
            p.setRepetitions(p.getRepetitions() + 1);

            // Decrease difficulty (card is easier)
            p.setDifficulty(Math.max(1.0, p.getDifficulty() - 0.5));
        }
        p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
    }

    /**
     * Calculate retrievability (probability of recall) based on time elapsed.
     */
    private double calculateRetrievability(UserCardProgress p, LocalDateTime now) {
        if (p.getNextReview() == null || p.getStability() == null || p.getStability() == 0) {
            return 0.9; // Default high retrievability
        }

        long minutesElapsed = java.time.Duration.between(p.getNextReview(), now).toMinutes();
        if (minutesElapsed <= 0) {
            return 0.9; // Reviewed early
        }

        double daysElapsed = minutesElapsed / 1440.0;
        return Math.pow(1 + daysElapsed / (9 * p.getStability()), -1);
    }

    @Override
    public String getAlgorithmName() {
        return "FSRS";
    }
}
