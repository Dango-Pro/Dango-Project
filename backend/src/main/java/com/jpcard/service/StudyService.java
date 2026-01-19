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


        int dailyLimit = user.getDailyLimit();


        }

        int fetchCount = 0;
            if (studyMore) {
            } else {
            }
        }

        List<Card> newCards = Collections.emptyList();
        if (fetchCount > 0) {
        }

        List<Card> allCards = new ArrayList<>(dueCards);
        allCards.addAll(newCards);

        return new StudySessionResult(
            allCards,
            newCardsStudiedToday,
            dailyLimit,
            newCards.size(),
            dueCards.size()
        );
    }

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
                p.setRepetitions(0);
                break;

            case "HARD":
                p.setEase(Math.max(1.3, p.getEase() - 0.15));
                break;

            case "GOOD":
                p.setStatus(StudyStatus.REVIEW);
                if (p.getRepetitions() > 0) {
                    goodInterval = (int) (p.getIntervalMinutes() * p.getEase());
                }
                p.setRepetitions(p.getRepetitions() + 1);
                break;

            case "EASY":
                p.setStatus(StudyStatus.REVIEW);
                p.setRepetitions(p.getRepetitions() + 1);
                p.setEase(p.getEase() + 0.15);
                break;
        }
    }
}
