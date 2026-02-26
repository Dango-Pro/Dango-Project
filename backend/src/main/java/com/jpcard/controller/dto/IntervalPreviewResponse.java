package com.jpcard.controller.dto;

/**
 * Response containing the predicted next-review interval (in minutes) for each
 * rating option.
 * Used by the frontend to show Anki-style interval labels on study buttons.
 */
public record IntervalPreviewResponse(
        int failMinutes,
        int hardMinutes,
        int goodMinutes,
        int easyMinutes) {
}
