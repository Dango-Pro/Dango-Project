package com.jpcard.service;

import com.jpcard.domain.card.Card;
import com.jpcard.domain.deck.Deck;
import com.jpcard.repository.CardRepository;
import com.jpcard.repository.DeckRepository;
import com.jpcard.util.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepository cardRepository;
    private final DeckRepository deckRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<Card> search(Long deckId, Boolean memorized, String keyword) {
    }

    @Transactional(readOnly = true)
    public List<Card> findAll() {
        return cardRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Card> findByDeckId(Long deckId) {
        return cardRepository.search(deckId, null, null);
    }

    @Transactional
        Card card = new Card();
        card.setTerm(term);
        card.setMeaning(meaning);
        if (deckId != null) {
            Deck deck = deckRepository.findById(deckId)
                    .orElseThrow(() -> new ResourceNotFoundException("Deck not found with id: " + deckId));
            card.setDeck(deck);
        }
        if (content != null) {
            try {
                card.setContentJson(objectMapper.writeValueAsString(content));
            } catch (Exception e) {
                throw new RuntimeException("Failed to serialize content", e);
            }
        }
    }

    @Transactional

    }

    @Transactional(readOnly = true)
    public Card findById(Long id) {
        return cardRepository.findById(id)
                .orElseThrow(() -> new com.jpcard.util.ResourceNotFoundException("Card not found with id: " + id));
    }

    @Transactional
        Card card = findById(id);
        card.setTerm(term);
        card.setMeaning(meaning);
        if (deckId != null) {
            Deck deck = deckRepository.findById(deckId)
                    .orElseThrow(() -> new ResourceNotFoundException("Deck not found with id: " + deckId));
            card.setDeck(deck);
        } else {
        }
        return card;
    }

    @Transactional
        Card card = findById(id);
    }
        cardRepository.deleteById(id);
    }

    @Transactional
        Card card = findById(id);
        card.setMemorized(isMemorized);
        return card;
    }
}
