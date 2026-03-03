package com.jpcard.service;

import com.jpcard.domain.card.Card;
import com.jpcard.domain.deck.Deck;
import com.jpcard.domain.study.StudyStatus;
import com.jpcard.domain.study.UserCardProgress;
import com.jpcard.domain.user.User;
import com.jpcard.repository.CardRepository;
import com.jpcard.repository.StudyLogRepository;
import com.jpcard.repository.UserCardProgressRepository;
import com.jpcard.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlgorithmTest {

    @Mock
    private UserCardProgressRepository progressRepository;
    @Mock
    private CardRepository cardRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private StudyLogRepository studyLogRepository;
    @Mock
    private com.jpcard.repository.DeckRepository deckRepository;
    @Mock
    private com.jpcard.service.algorithm.AlgorithmFactory algorithmFactory;
    @Mock
    private PlatformTransactionManager transactionManager;

    @InjectMocks
    private StudyService studyService;

    private User user;
    private Card card;
    private Deck deck;

    @BeforeEach
    void setup() {
        user = new User();
        user.setId(1L);
        deck = new Deck();
        deck.setLearningSteps("1,10");
        card = new Card();
        card.setId(100L);
        card.setDeck(deck);

        lenient().when(transactionManager.getTransaction(any())).thenReturn(mock(TransactionStatus.class));
        lenient().when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        lenient().when(cardRepository.findById(100L)).thenReturn(Optional.of(card));
        lenient().when(algorithmFactory.getAlgorithm(any()))
                .thenReturn(new com.jpcard.service.algorithm.SM2Algorithm());
    }

    @Test
    void testGood_ReviewMode_Fuzzing() {
        // Setup a card in REVIEW mode with interval 10 days (14400 mins)
        // 10 days > 2 days, so fuzzing should apply.
        UserCardProgress progress = new UserCardProgress();
        progress.setId(1L);
        progress.setUser(user);
        progress.setCard(card);
        progress.setStatus(StudyStatus.REVIEW);
        progress.setIntervalMinutes(14400); // 10 days
        progress.setEase(2.5);
        progress.setRepetitions(5);

        when(progressRepository.findByUserIdAndCardId(1L, 100L)).thenReturn(Optional.of(progress));

        studyService.processReview(1L, 100L, "GOOD");

        ArgumentCaptor<UserCardProgress> captor = ArgumentCaptor.forClass(UserCardProgress.class);
        verify(progressRepository).save(captor.capture());
        UserCardProgress saved = captor.getValue();

        // Expected interval without fuzz: 14400 * 2.5 = 36000
        // Fuzzing factor: 1.0 to 1.05
        // Range: 36000 to 37800
        assertTrue(saved.getIntervalMinutes() >= 36000,
                "Interval " + saved.getIntervalMinutes() + " should be >= 36000");
        assertTrue(saved.getIntervalMinutes() <= 37800,
                "Interval " + saved.getIntervalMinutes() + " should be <= 37800");
    }

    @Test
    void testEasy_ReviewMode_Bonus() {
        // EASY gives 1.3 bonus and increases ease by 0.15
        UserCardProgress progress = new UserCardProgress();
        progress.setId(1L);
        progress.setUser(user);
        progress.setCard(card);
        progress.setStatus(StudyStatus.REVIEW);
        progress.setIntervalMinutes(1000);
        progress.setEase(2.5);
        progress.setRepetitions(5);

        when(progressRepository.findByUserIdAndCardId(1L, 100L)).thenReturn(Optional.of(progress));

        studyService.processReview(1L, 100L, "EASY");

        ArgumentCaptor<UserCardProgress> captor = ArgumentCaptor.forClass(UserCardProgress.class);
        verify(progressRepository).save(captor.capture());
        UserCardProgress saved = captor.getValue();

        assertEquals(2.65, saved.getEase(), 0.001); // 2.5 + 0.15

        // Base: 1000 * 2.5 * 1.3 = 3250
        // Fuzzing applies (3250 > 2880) -> range [3250, 3412]
        // But EASY_INTERVAL minimum is 4 days (5760 mins).
        // So Math.max(5760, fuzzed) should return 5760.

        assertEquals(5760, saved.getIntervalMinutes());
    }

    @Test
    void testBurySiblings() {
        card.setNoteId(999L);

        UserCardProgress sibling = new UserCardProgress();
        sibling.setId(2L);
        Card siblingCard = new Card();
        siblingCard.setId(101L);
        siblingCard.setNoteId(999L);
        sibling.setCard(siblingCard);

        // Sibling due NOW
        sibling.setNextReview(LocalDateTime.now().minusHours(1));

        when(progressRepository.findByUserIdAndCardId(1L, 100L)).thenReturn(Optional.empty()); // New card
        when(progressRepository.findByUserIdAndCardNoteId(1L, 999L)).thenReturn(List.of(sibling));

        studyService.processReview(1L, 100L, "GOOD");

        ArgumentCaptor<UserCardProgress> captor = ArgumentCaptor.forClass(UserCardProgress.class);
        // We expect save for current card AND sibling
        verify(progressRepository, times(2)).save(captor.capture());

        List<UserCardProgress> savedList = captor.getAllValues();
        UserCardProgress savedSibling = savedList.stream()
                .filter(p -> p.getId() != null && p.getId().equals(2L))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Sibling not saved"));

        LocalDateTime tomorrow = LocalDate.now().plusDays(1).atStartOfDay().plusHours(4);

        assertEquals(tomorrow.getDayOfMonth(), savedSibling.getNextReview().getDayOfMonth());
        assertEquals(4, savedSibling.getNextReview().getHour());
    }
}
