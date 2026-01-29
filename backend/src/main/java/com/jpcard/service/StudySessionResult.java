package com.jpcard.service;

import com.jpcard.domain.card.Card;
import java.util.List;

public record StudySessionResult(
    List<Card> cards,
    boolean limitReached,
    long newCardsStudiedToday,
    int dailyLimit,
    int newCardsInBatch,
    int dueCardsInBatch
) {}
