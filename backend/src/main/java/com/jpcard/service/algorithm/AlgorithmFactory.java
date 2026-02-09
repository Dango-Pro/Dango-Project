package com.jpcard.service.algorithm;

import com.jpcard.domain.study.AlgorithmType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Factory for creating spaced repetition algorithm instances.
 * Maps AlgorithmType enum to concrete algorithm implementations.
 */
@Component
@RequiredArgsConstructor
public class AlgorithmFactory {

    private final SM2Algorithm sm2Algorithm;
    private final FSRSAlgorithm fsrsAlgorithm;
    private final HalfLifeRegressionAlgorithm halfLifeRegressionAlgorithm;
    private final LeitnerSystemAlgorithm leitnerSystemAlgorithm;
    private final SprintAlgorithm sprintAlgorithm;

    /**
     * Get the appropriate algorithm implementation for the given type.
     * 
     * @param algorithmType The algorithm type
     * @return The algorithm implementation
     * @throws IllegalArgumentException if algorithm type is unknown
     */
    public SpacedRepetitionAlgorithm getAlgorithm(AlgorithmType algorithmType) {
        if (algorithmType == null) {
            return sm2Algorithm; // Default to SM-2
        }

        return switch (algorithmType) {
            case SM2 -> sm2Algorithm;
            case FSRS -> fsrsAlgorithm;
            case HALF_LIFE_REGRESSION -> halfLifeRegressionAlgorithm;
            case LEITNER_SYSTEM -> leitnerSystemAlgorithm;
            case SPRINT -> sprintAlgorithm;
        };
    }
}
