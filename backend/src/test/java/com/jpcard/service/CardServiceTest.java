package com.jpcard.service;

import com.jpcard.domain.card.Card;
import com.jpcard.repository.CardRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class CardServiceTest {

    @Mock
    private CardRepository cardRepository;

    @InjectMocks
    private CardService cardService;

    @Test
    void createCard() {
        Card card = new Card();
        card.setId(1L);
        card.setTerm("Test");
        card.setMeaning("Meaning");

        when(cardRepository.save(any(Card.class))).thenReturn(card);

        Card created = cardService.create("Test", "Meaning");

        assertNotNull(created);
        assertEquals("Test", created.getTerm());
        verify(cardRepository).save(any(Card.class));
    }

    @Test
    void updateCard() {
        Card card = new Card();
        card.setId(1L);
        card.setTerm("Old");
        card.setMeaning("Old Meaning");

        when(cardRepository.findById(1L)).thenReturn(Optional.of(card));

        Card updated = cardService.update(1L, "New", "New Meaning");

        assertEquals("New", updated.getTerm());
        assertEquals("New Meaning", updated.getMeaning());
        // Service just updates the entity object and returns it (transactional handles save)
        // But verifying findById was called
        verify(cardRepository).findById(1L);
    }

    @Test
    void deleteCard() {
        doNothing().when(cardRepository).deleteById(1L);

        cardService.delete(1L);

        verify(cardRepository).deleteById(1L);
    }

    @Test
    void toggleMemorized() {
        Card card = new Card();
        card.setId(1L);
        card.setMemorized(false);

        when(cardRepository.findById(1L)).thenReturn(Optional.of(card));

        Card updated = cardService.changeMemorizedStatus(1L, true);

        assertTrue(updated.isMemorized());
        verify(cardRepository).findById(1L);
    }
}
