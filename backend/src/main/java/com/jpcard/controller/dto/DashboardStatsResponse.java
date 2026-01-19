package com.jpcard.controller.dto;

public record DashboardStatsResponse(
    long totalCards,
    long memorizedCards,
    long totalDecks,
    long totalPosts,
    long totalLikes,
    long dueCards
) {}
