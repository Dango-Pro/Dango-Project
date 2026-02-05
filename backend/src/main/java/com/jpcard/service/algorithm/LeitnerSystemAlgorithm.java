package com.jpcard.service.algorithm;

import com.jpcard.domain.study.StudyStatus;
import com.jpcard.domain.study.UserCardProgress;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Leitner System Algorithm Implementation.
 * Classic box-based spaced repetition method.
 * Cards move between 5 boxes with exponentially increasing intervals.
 */
@Component
public class LeitnerSystemAlgorithm implements SpacedRepetitionAlgorithm {

    // Box intervals in minutes: Box 1 = 1 day, Box 2 = 3 days, Box 3 = 7 days, Box
    // 4 = 14 days, Box 5 = 30 days
    private static final int[] BOX_INTERVALS = {
            1440, // Box 1: 1 day
            4320, // Box 2: 3 days
            10080, // Box 3: 7 days
            20160, // Box 4: 14 days
            43200 // Box 5: 30 days
    };

    private static final int[] LEARNING_STEPS = { 1, 10 }; // minutes for new cards

    @Override
    public void processReview(UserCardProgress p, String rating, LocalDateTime now) {
        // Initialize Leitner box if first review
        if (p.getLeitnerBox() == null) {
            p.setLeitnerBox(0); // Start in learning (box 0)
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
        // Move back to Box 1 (or stay in learning)
        if (p.getStatus() == StudyStatus.NEW || p.getStatus() == StudyStatus.LEARNING) {
            // Reset learning
            p.setStatus(StudyStatus.LEARNING);
            p.setLearningStep(0);
            p.setLeitnerBox(0);
            p.setIntervalMinutes(LEARNING_STEPS[0]);
        } else {
            // Move back to Box 1
            p.setLeitnerBox(1);
            p.setStatus(StudyStatus.REVIEW);
            p.setIntervalMinutes(BOX_INTERVALS[0]);
        }

        p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
        p.setRepetitions(0);
    }

    private void handleHard(UserCardProgress p, LocalDateTime now) {
        if (p.getStatus() == StudyStatus.NEW || p.getStatus() == StudyStatus.LEARNING) {
            // Stay in current learning step
            int currentStep = p.getLearningStep();
            p.setIntervalMinutes(LEARNING_STEPS[Math.min(currentStep, LEARNING_STEPS.length - 1)]);
            p.setStatus(StudyStatus.LEARNING);
        } else {
            // Stay in current box (don't advance)
            int currentBox = p.getLeitnerBox();
            currentBox = Math.max(1, Math.min(5, currentBox)); // Ensure valid box
            p.setLeitnerBox(currentBox);
            p.setIntervalMinutes(BOX_INTERVALS[currentBox - 1]);
        }

        p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
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
                // Graduate to Box 1
                p.setStatus(StudyStatus.REVIEW);
                p.setLearningStep(0);
                p.setLeitnerBox(1);
                p.setIntervalMinutes(BOX_INTERVALS[0]);
                p.setRepetitions(1);
            }
        } else {
            // Move to next box
            int currentBox = p.getLeitnerBox();
            int nextBox = Math.min(5, currentBox + 1);
            p.setLeitnerBox(nextBox);
            p.setIntervalMinutes(BOX_INTERVALS[nextBox - 1]);
            p.setRepetitions(p.getRepetitions() + 1);
        }

        p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
    }

    private void handleEasy(UserCardProgress p, LocalDateTime now) {
        if (p.getStatus() == StudyStatus.NEW || p.getStatus() == StudyStatus.LEARNING) {
            // Immediate graduation to Box 2 (bonus)
            p.setStatus(StudyStatus.REVIEW);
            p.setLearningStep(0);
            p.setLeitnerBox(2);
            p.setIntervalMinutes(BOX_INTERVALS[1]);
            p.setRepetitions(1);
        } else {
            // Move forward 2 boxes (or to max)
            int currentBox = p.getLeitnerBox();
            int nextBox = Math.min(5, currentBox + 2);
            p.setLeitnerBox(nextBox);
            p.setIntervalMinutes(BOX_INTERVALS[nextBox - 1]);
            p.setRepetitions(p.getRepetitions() + 1);
        }

        p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
    }

    @Override
    public String getAlgorithmName() {
        return "Leitner System";
    }
}
