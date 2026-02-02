package com.jpcard.service;

import com.jpcard.domain.card.Card;
import com.jpcard.domain.study.StudyStatus;
import com.jpcard.domain.study.UserCardProgress;
import com.jpcard.domain.user.User;
import com.jpcard.repository.CardRepository;
import com.jpcard.repository.StudyLogRepository;
import com.jpcard.repository.UserCardProgressRepository;
import com.jpcard.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;

import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class StudyServiceTest {

    @Mock private UserCardProgressRepository progressRepository;
    @Mock private CardRepository cardRepository;
    @Mock private UserRepository userRepository;
    @Mock private StudyLogRepository studyLogRepository;
    @Mock private PlatformTransactionManager transactionManager;

    @InjectMocks private StudyService studyService;

    @Test
    void processReview_NewFail() {
        User user = new User(); user.setId(1L);
        Card card = new Card(); card.setId(1L);
        // Fix: Mock deck for learningSteps
        com.jpcard.domain.deck.Deck deck = new com.jpcard.domain.deck.Deck();
        deck.setLearningSteps("1,10");
        card.setDeck(deck);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cardRepository.findById(1L)).thenReturn(Optional.of(card));
        when(progressRepository.findByUserIdAndCardId(1L, 1L)).thenReturn(Optional.empty());
        when(transactionManager.getTransaction(any())).thenReturn(mock(TransactionStatus.class));

        studyService.processReview(1L, 1L, "FAIL");

        verify(progressRepository).save(argThat(p ->
            p.getStatus() == StudyStatus.LEARNING &&
            p.getIntervalMinutes() == 1 &&
            p.getRepetitions() == 0 &&
            p.getFirstStudiedAt() != null
        ));
    }

    @Test
    void processReview_Concurrency_Retry() {
        // Simulates a scenario where save() throws DataIntegrityViolationException initially,
        // triggering the retry logic.
        User user = new User(); user.setId(1L);
        Card card = new Card(); card.setId(1L);
        com.jpcard.domain.deck.Deck deck = new com.jpcard.domain.deck.Deck();
        deck.setLearningSteps("1,10");
        card.setDeck(deck);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cardRepository.findById(1L)).thenReturn(Optional.of(card));
        when(transactionManager.getTransaction(any())).thenReturn(mock(TransactionStatus.class));

        UserCardProgress p = new UserCardProgress();
        p.setUser(user);
        p.setCard(card);

        when(progressRepository.findByUserIdAndCardId(1L, 1L))
                .thenReturn(Optional.empty());

        // Save throws exception twice, then succeeds
        when(progressRepository.save(any(UserCardProgress.class)))
                .thenThrow(new DataIntegrityViolationException("Conflict"))
                .thenThrow(new DataIntegrityViolationException("Conflict"))
                .thenReturn(p);

        // Act
        studyService.processReview(1L, 1L, "FAIL");

        // Verify that it was called 3 times (2 failures + 1 success)
        verify(progressRepository, times(3)).save(any(UserCardProgress.class));
    }


    @Test
    void getDueCards_LimitReached_WithTimezone() {
        User user = new User();
        user.setId(1L);
        user.setDailyLimit(20);
        user.setTimezone("Asia/Tokyo"); // UTC+9

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        // Update: use findDueCardsWithLimit
        when(progressRepository.findDueCardsWithLimit(anyLong(), anyLong(), any(LocalDateTime.class), any(Pageable.class))).thenReturn(Collections.emptyList());

        when(progressRepository.countNewCardsStudiedToday(anyLong(), anyLong(), any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(20L);

        StudySessionResult result = studyService.getDueCards(1L, 1L, false);

        assertTrue(result.cards().isEmpty());
        assertTrue(result.limitReached());
        verify(cardRepository, never()).findNewCards(anyLong(), anyLong(), any(Pageable.class));
    }

    @Test
    void getDueCards_StudyMore() {
        User user = new User();
        user.setId(1L);
        user.setDailyLimit(20);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        // Update: use findDueCardsWithLimit
        when(progressRepository.findDueCardsWithLimit(anyLong(), anyLong(), any(LocalDateTime.class), any(Pageable.class))).thenReturn(Collections.emptyList());
        when(progressRepository.countNewCardsStudiedToday(anyLong(), anyLong(), any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(20L);
        when(cardRepository.findNewCards(anyLong(), anyLong(), any(Pageable.class))).thenReturn(List.of(new Card()));

        StudySessionResult result = studyService.getDueCards(1L, 1L, true);

        assertFalse(result.cards().isEmpty());
        assertFalse(result.limitReached());
        verify(cardRepository).findNewCards(anyLong(), anyLong(), any(Pageable.class));
    }
}
