package com.jpcard.controller.dto;

import java.util.List;
import java.util.Map;

public record DashboardExtendedResponse(
        // Today's summary
        long reviewsToday,
        double accuracyPercent,
        int streakDays,

        // Deck progress
        List<DeckProgressItem> deckProgress,

        // Weekly trend (last 7 days)
        List<Map<String, Object>> weeklyTrend) {
    public record DeckProgressItem(
            Long deckId,
            String deckName,
            long totalCards,
            long newCards,
            long learningCards,
            long reviewCards,
            long suspendedCards) {
    }
}
