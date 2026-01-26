package com.jpcard.service;

import com.jpcard.domain.deck.Deck;
import com.jpcard.repository.CardTemplateRepository;
import com.jpcard.repository.DeckRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeckServiceTest {

    @Mock
    private DeckRepository deckRepository;

    @Mock
    private CardTemplateRepository cardTemplateRepository;

    @InjectMocks
    private DeckService deckService;

    @Test
    void create_ShouldSaveDeck() {
        Deck deck = new Deck();
        deck.setId(1L);
        deck.setName("Test Deck");

        when(deckRepository.save(any(Deck.class))).thenReturn(deck);

        Deck created = deckService.create("Test Deck", "Description", null);

        assertNotNull(created);
        assertEquals("Test Deck", created.getName());
        verify(deckRepository).save(any(Deck.class));
    }
}
