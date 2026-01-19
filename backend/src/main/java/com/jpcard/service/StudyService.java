package com.jpcard.service;

import com.jpcard.domain.card.Card;
import com.jpcard.domain.study.StudyStatus;
import com.jpcard.domain.study.UserCardProgress;
import com.jpcard.domain.user.User;
import com.jpcard.repository.CardRepository;
import com.jpcard.repository.UserCardProgressRepository;
import com.jpcard.repository.UserRepository;
import com.jpcard.util.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyService {

    private final UserCardProgressRepository progressRepository;
    private final CardRepository cardRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public StudySessionResult getDueCards(Long userId, Long deckId, boolean studyMore) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 1. Get existing progress that is due
        List<UserCardProgress> dueProgress = progressRepository.findDueCards(userId, deckId, LocalDateTime.now());
        List<Card> dueCards = dueProgress.stream().map(UserCardProgress::getCard).collect(Collectors.toList());

        // 2. Get NEW cards with limits
        int dailyLimit = user.getDailyLimit();

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);
        long newCardsStudiedToday = progressRepository.countNewCardsStudiedToday(userId, deckId, startOfDay, endOfDay);

        int remainingLimit = dailyLimit - (int) newCardsStudiedToday;
        boolean limitReached = false;

        if (remainingLimit <= 0 && !studyMore) {
            limitReached = true;
        }

        int fetchCount = 0;
        if (!limitReached) {
            if (studyMore) {
                // If study more, fetch a batch regardless of limit (or remaining if positive?)
                // "fetch additional new cards (e.g., +10)"
                fetchCount = (remainingLimit > 0) ? remainingLimit : 10;
            } else {
                fetchCount = remainingLimit;
            }
        }

        List<Card> newCards = Collections.emptyList();
        if (fetchCount > 0) {
            newCards = cardRepository.findNewCards(deckId, userId, PageRequest.of(0, fetchCount));
        }

        List<Card> allCards = new ArrayList<>(dueCards);
        allCards.addAll(newCards);

        return new StudySessionResult(
            allCards,
            limitReached,
            newCardsStudiedToday,
            dailyLimit,
            newCards.size(),
            dueCards.size()
        );
    }

    @Transactional
    public void processReview(Long userId, Long cardId, String rating) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));

        UserCardProgress progress = progressRepository.findByUserIdAndCardId(userId, cardId)
                .orElse(new UserCardProgress());

        if (progress.getId() == null) {
            progress.setUser(user);
            progress.setCard(card);
            progress.setStatus(StudyStatus.NEW);
        }

        if (progress.getFirstStudiedAt() == null) {
            progress.setFirstStudiedAt(LocalDateTime.now());
        }

        applyAlgorithm(progress, rating);
        progressRepository.save(progress);
    }

    private void applyAlgorithm(UserCardProgress p, String rating) {
        LocalDateTime now = LocalDateTime.now();

        switch (rating.toUpperCase()) {
            case "FAIL": // Again
                p.setStatus(StudyStatus.LEARNING);
                p.setIntervalMinutes(1);
                p.setNextReview(now.plusMinutes(1));
                p.setRepetitions(0);
                p.setEase(Math.max(1.3, p.getEase() - 0.2));
                break;

            case "HARD":
                p.setStatus(StudyStatus.LEARNING);
                p.setIntervalMinutes(12 * 60);
                p.setNextReview(now.plusHours(12));
                p.setRepetitions(0);
                p.setEase(Math.max(1.3, p.getEase() - 0.15));
                break;

            case "GOOD":
                p.setStatus(StudyStatus.REVIEW);
                int goodInterval = 1 * 24 * 60; // 1 day
                if (p.getRepetitions() > 0) {
                    goodInterval = (int) (p.getIntervalMinutes() * p.getEase());
                }
                p.setIntervalMinutes(Math.max(24 * 60, goodInterval));
                p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
                p.setRepetitions(p.getRepetitions() + 1);
                break;

            case "EASY":
                p.setStatus(StudyStatus.REVIEW);
                int easyInterval = 4 * 24 * 60;
                if (p.getRepetitions() > 0) {
                    easyInterval = (int) (p.getIntervalMinutes() * p.getEase() * 1.5);
                }
                p.setIntervalMinutes(Math.max(4 * 24 * 60, easyInterval));
                p.setNextReview(now.plusMinutes(p.getIntervalMinutes()));
                p.setRepetitions(p.getRepetitions() + 1);
                p.setEase(p.getEase() + 0.15);
                break;
        }
    }
}
