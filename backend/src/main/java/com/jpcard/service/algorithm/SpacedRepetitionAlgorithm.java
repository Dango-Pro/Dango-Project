package com.jpcard.service.algorithm;

import com.jpcard.domain.study.UserCardProgress;
import java.time.LocalDateTime;

/**
 * Interface for spaced repetition algorithms.
 * Each algorithm implements its own scheduling logic for card reviews.
 */
public interface SpacedRepetitionAlgorithm {

    /**
     * Process a review and update the card's progress.
     * 
     * @param progress The user's progress for this card
     * @param rating   The rating given (FAIL, HARD, GOOD, EASY)
     * @param now      Current timestamp
     */
    void processReview(UserCardProgress progress, String rating, LocalDateTime now);

    /**
     * Get the algorithm's display name.
     * 
     * @return Algorithm name
     */
    String getAlgorithmName();
}
