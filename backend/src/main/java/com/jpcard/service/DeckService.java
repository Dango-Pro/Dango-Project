package com.jpcard.service;

import com.jpcard.domain.deck.CardTemplate;
import com.jpcard.domain.deck.Deck;
import com.jpcard.repository.CardRepository;
import com.jpcard.repository.CardTemplateRepository;
import com.jpcard.repository.DeckRepository;
import com.jpcard.repository.UserCardProgressRepository;
import com.jpcard.util.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DeckService {

    private final DeckRepository deckRepository;
    private final CardTemplateRepository cardTemplateRepository;
    private final CardRepository cardRepository;
    private final UserCardProgressRepository progressRepository;

    @Transactional(readOnly = true)
    public List<Deck> findAll() {
        return deckRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Deck findById(Long id) {
        return deckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deck not found with id: " + id));
    }

    @Transactional
    public Deck create(String name, String description, Long templateId) {
        Deck deck = new Deck();
        deck.setName(name);
        deck.setDescription(description);
        if (templateId != null) {
            CardTemplate template = cardTemplateRepository.findById(templateId)
                    .orElseThrow(() -> new ResourceNotFoundException("Template not found: " + templateId));
            deck.setCardTemplate(template);
        }
        return deckRepository.save(deck);
    }

    @Transactional
    public Deck update(Long id, String name, String description) {
        Deck deck = findById(id);
        deck.setName(name);
        deck.setDescription(description);
        return deck;
    }

    @Transactional
    public void delete(Long id) {
        // Cascade delete progress and cards
        progressRepository.deleteByCardDeckId(id);
        cardRepository.deleteByDeckId(id);
        deckRepository.deleteById(id);
    }
}
