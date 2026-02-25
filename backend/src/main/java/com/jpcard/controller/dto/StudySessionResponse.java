package com.jpcard.controller.dto;

import java.util.List;

public record StudySessionResponse(
    List<CardResponse> cards,
    boolean limitReached,
    int newCardsCount,
    int dueCardsCount,
    long newCardsStudiedToday,
    int dailyLimit
) {}
