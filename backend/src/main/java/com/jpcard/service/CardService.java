package com.jpcard.service;

import com.jpcard.domain.card.Card;
import com.jpcard.domain.deck.Deck;
import com.jpcard.domain.user.User;
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
        String searchKey = (keyword != null && !keyword.isEmpty()) ? "%" + keyword.toLowerCase() + "%" : null;
        return cardRepository.search(deckId, memorized, searchKey);
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
    public Card create(String term, String meaning, Long deckId, Map<String, String> content, User owner) {
        return createWithNoteId(term, meaning, deckId, content, owner, null);
    }

    @Transactional
    public Card createWithNoteId(String term, String meaning, Long deckId, Map<String, String> content, User owner, Long noteId) {
        Card card = new Card();
        card.setTerm(term);
        card.setMeaning(meaning);
        if (deckId != null) {
            Deck deck = deckRepository.findById(deckId)
                    .orElseThrow(() -> new ResourceNotFoundException("Deck not found with id: " + deckId));

            if (owner != null && !deck.getOwner().getId().equals(owner.getId())) {
                throw new IllegalArgumentException("Not authorized to create card in this deck");
            }
            card.setDeck(deck);
        }
        if (content != null) {
            try {
                card.setContentJson(objectMapper.writeValueAsString(content));
            } catch (Exception e) {
                throw new RuntimeException("Failed to serialize content", e);
            }
        }

        Card savedCard = cardRepository.save(card);

        // Use ID as initial noteId if not provided
        savedCard.setNoteId(noteId != null ? noteId : savedCard.getId());

        return savedCard;
    }

    @Transactional
    public List<Card> createSiblings(String term, String meaning, Long deckId, Map<String, String> content, User owner) {
        // 1. Create Forward Card (Term -> Meaning)
        Card forward = createWithNoteId(term, meaning, deckId, content, owner, null);
        Long sharedNoteId = forward.getNoteId(); // Uses its own ID

        // 2. Create Reverse Card (Meaning -> Term)
        // Swap content keys if generic? Assuming 'Front'/'Back' in content.
        // For simple term/meaning, we swap them.
        // For JSON content, it's tricky without knowing template structure.
        // Assuming simple default template for now.

        Card reverse = createWithNoteId(meaning, term, deckId, content, owner, sharedNoteId);

        return List.of(forward, reverse);
    }

    @Transactional(readOnly = true)
    public Card findById(Long id) {
        return cardRepository.findById(id)
                .orElseThrow(() -> new com.jpcard.util.ResourceNotFoundException("Card not found with id: " + id));
    }

    @Transactional
    public Card update(Long id, String term, String meaning, Long deckId, Map<String, String> content, User owner) {
        Card card = findById(id);

        // Ownership Check
        if (owner != null) {
             if (card.getDeck() != null && !card.getDeck().getOwner().getId().equals(owner.getId())) {
                 throw new IllegalArgumentException("Not authorized to update this card");
             }
             // Also check new deck ownership if changing deck
             if (deckId != null) {
                 Deck newDeck = deckRepository.findById(deckId)
                         .orElseThrow(() -> new ResourceNotFoundException("Deck not found: " + deckId));
                 if (!newDeck.getOwner().getId().equals(owner.getId())) {
                     throw new IllegalArgumentException("Not authorized to move card to this deck");
                 }
             }
        }

        card.setTerm(term);
        card.setMeaning(meaning);
        if (deckId != null) {
            Deck deck = deckRepository.findById(deckId)
                    .orElseThrow(() -> new ResourceNotFoundException("Deck not found with id: " + deckId));
            card.setDeck(deck);
        } else {
            // Should we allow unassigning? Usually cards belong to a deck.
            // If deckId is null in request, it might mean "don't change".
            // But here we might be overwriting. Let's assume deckId is mandatory for update if passed.
            // If frontend sends null, we shouldn't clear it unless intentional.
            // For now, let's keep existing logic: if deckId passed, set it.
        }

        if (content != null) {
            try {
                card.setContentJson(objectMapper.writeValueAsString(content));
            } catch (Exception e) {
                throw new RuntimeException("Failed to serialize content", e);
            }
        }
        return card;
    }

    @Transactional
    public void delete(Long id, User owner) {
        Card card = findById(id);
        if (owner != null && card.getDeck() != null && !card.getDeck().getOwner().getId().equals(owner.getId())) {
             throw new IllegalArgumentException("Not authorized to delete this card");
        }
        cardRepository.deleteById(id);
    }

    @Transactional
    public Card changeMemorizedStatus(Long id, boolean isMemorized, User owner) {
        Card card = findById(id);
        // Ownership? Or is memorized status per user?
        // Currently Card entity has 'memorized' field, which implies global status (single user app design origin).
        // But for multi-user, progress should be in UserCardProgress.
        // The 'memorized' field in Card might be legacy or "Mastered by Owner".
        // Let's protect it.
        if (owner != null && card.getDeck() != null && !card.getDeck().getOwner().getId().equals(owner.getId())) {
             throw new IllegalArgumentException("Not authorized");
        }
        card.setMemorized(isMemorized);
        return card;
    }
}
