package com.jpcard.domain.study;

/**
 * Enum representing different spaced repetition algorithms.
 * Each deck can use a different algorithm for scheduling card reviews.
 */
public enum AlgorithmType {
    /**
     * SuperMemo 2 algorithm - Classic spaced repetition with ease factor.
     * Balanced approach suitable for most learning scenarios.
     */
    SM2,

    /**
     * Free Spaced Repetition Scheduler (FSRS) - Modern ML-based algorithm.
     * Uses stability and difficulty parameters for optimized scheduling.
     */
    FSRS,

    /**
     * Half-Life Regression - Duolingo-style algorithm.
     * Models memory decay using half-life regression.
     */
    HALF_LIFE_REGRESSION,

    /**
     * Leitner System - Classic box-based method.
     * Cards move between boxes (1-5) based on performance.
     */
    LEITNER_SYSTEM,

    /**
     * Sprint - Short-term intensive learning algorithm.
     * Optimized for cramming with very short intervals (minutes to hours).
     */
    SPRINT
}
