package com.jpcard.service.algorithm;

import com.jpcard.domain.study.StudyStatus;
import com.jpcard.domain.study.UserCardProgress;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Sprint Algorithm Implementation.
 * Designed for short-term intensive learning with maximum exposure frequency.
 * Optimized for cramming and exam preparation with very short intervals.
 */
@Component
public class SprintAlgorithm implements SpacedRepetitionAlgorithm {

    // Aggressive learning steps: 5min -> 15min -> 30min -> 1hr
    private static final int[] LEARNING_STEPS = { 5, 15, 30, 60 };

    // Review intervals are kept very short (2-6 hours max)
    private static final int MIN_REVIEW_INTERVAL = 120; // 2 hours
    private static final int MAX_REVIEW_INTERVAL = 360; // 6 hours
    private static final int GRADUATING_INTERVAL = 120; // 2 hours

    @Override
    public void processReview(UserCardProgress p, String rating, LocalDateTime now) {
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
        // Reset to first learning step
        p.setStatus(StudyStatus.LEARNING);
        p.setLearningStep(0);
        p.setIntervalMinutes(LEARNING_STEPS[0]); // 5 minutes
        p.setNextReview(now.plusMinutes(LEARNING_STEPS[0]));
        p.setRepetitions(0);
    }

    private void handleHard(UserCardProgress p, LocalDateTime now) {
        if (p.getStatus() == StudyStatus.NEW || p.getStatus() == StudyStatus.LEARNING) {
            // Repeat current step
            int currentStep = p.getLearningStep();
            p.setIntervalMinutes(LEARNING_STEPS[Math.min(currentStep, LEARNING_STEPS.length - 1)]);
            p.setStatus(StudyStatus.LEARNING);
        } else {
            // In review: minimal increase (1.1x multiplier)
            int newInterval = (int) (p.getIntervalMinutes() * 1.1);
            newInterval = Math.min(MAX_REVIEW_INTERVAL, Math.max(MIN_REVIEW_INTERVAL, newInterval));
            p.setIntervalMinutes(newInterval);
        }

        p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
    }

    private void handleGood(UserCardProgress p, LocalDateTime now) {
        if (p.getStatus() == StudyStatus.NEW || p.getStatus() == StudyStatus.LEARNING) {
            // Advance through learning steps
            int nextStep = p.getLearningStep() + 1;
            if (nextStep < LEARNING_STEPS.length) {
                p.setLearningStep(nextStep);
                p.setIntervalMinutes(LEARNING_STEPS[nextStep]);
                p.setStatus(StudyStatus.LEARNING);
            } else {
                // Graduate to review mode
                p.setStatus(StudyStatus.REVIEW);
                p.setLearningStep(0);
                p.setIntervalMinutes(GRADUATING_INTERVAL); // 2 hours
                p.setRepetitions(1);
            }
        } else {
            // In review: moderate increase (1.3x multiplier)
            int newInterval = (int) (p.getIntervalMinutes() * 1.3);
            newInterval = Math.min(MAX_REVIEW_INTERVAL, Math.max(MIN_REVIEW_INTERVAL, newInterval));
            p.setIntervalMinutes(newInterval);
            p.setRepetitions(p.getRepetitions() + 1);
        }

        p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
    }

    private void handleEasy(UserCardProgress p, LocalDateTime now) {
        if (p.getStatus() == StudyStatus.NEW || p.getStatus() == StudyStatus.LEARNING) {
            // Skip to last learning step or graduate
            p.setStatus(StudyStatus.LEARNING);
            p.setLearningStep(LEARNING_STEPS.length - 1);
            p.setIntervalMinutes(LEARNING_STEPS[LEARNING_STEPS.length - 1]); // 1 hour
        } else {
            // In review: larger increase (1.5x multiplier) but still capped
            int newInterval = (int) (p.getIntervalMinutes() * 1.5);
            newInterval = Math.min(MAX_REVIEW_INTERVAL, Math.max(MIN_REVIEW_INTERVAL, newInterval));
            p.setIntervalMinutes(newInterval);
            p.setRepetitions(p.getRepetitions() + 1);
        }

        p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
    }

    @Override
    public String getAlgorithmName() {
        return "Sprint";
    }
}
