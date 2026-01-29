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
        return cardRepository.search(deckId, memorized, keyword);
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
    public Card create(String term, String meaning, Long deckId, Map<String, String> content) {
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
        return cardRepository.save(card);
    }

    @Transactional
    public Card create(String term, String meaning, Long deckId) {
        return create(term, meaning, deckId, null);
    }

    // Overload for backward compatibility if needed, or just replace usage
    @Transactional
    public Card create(String term, String meaning) {
        return create(term, meaning, null);
    }

    @Transactional(readOnly = true)
    public Card findById(Long id) {
        return cardRepository.findById(id)
                .orElseThrow(() -> new com.jpcard.util.ResourceNotFoundException("Card not found with id: " + id));
    }

    @Transactional
    public Card update(Long id, String term, String meaning, Long deckId) {
        Card card = findById(id);
        card.setTerm(term);
        card.setMeaning(meaning);
        if (deckId != null) {
            Deck deck = deckRepository.findById(deckId)
                    .orElseThrow(() -> new ResourceNotFoundException("Deck not found with id: " + deckId));
            card.setDeck(deck);
        } else {
            card.setDeck(null); // Optional: allow unassigning
        }
        return card;
    }

    @Transactional
    public Card update(Long id, String term, String meaning) {
        // Preserve existing deck if not specified? Or clear it?
        // For "Edit Card" page, we usually send all data.
        // If I keep this old method, I should probably not touch the deck.
        Card card = findById(id);
        card.setTerm(term);
        card.setMeaning(meaning);
        return card;
    }

    @Transactional
    public void delete(Long id) {
        cardRepository.deleteById(id);
    }

    @Transactional
    public Card changeMemorizedStatus(Long id, boolean isMemorized) {
        Card card = findById(id);
        card.setMemorized(isMemorized);
        return card;
    }
}
