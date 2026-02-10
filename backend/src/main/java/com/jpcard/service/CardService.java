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
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
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
	public Card create(String term, String meaning, Long deckId, Map<String, String> content, User user) {
		Card card = new Card();
		card.setTerm(term);
		card.setMeaning(meaning);
		if (deckId != null) {
			Deck deck = deckRepository.findById(deckId)
					.orElseThrow(() -> new ResourceNotFoundException("Deck not found with id: " + deckId));
			if (deck.getOwner() != null && !deck.getOwner().getId().equals(user.getId())) {
				throw new IllegalArgumentException("Deck access denied");
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
		return cardRepository.save(card);
	}

	@Transactional
	public List<Card> createSiblings(String term, String meaning, Long deckId, Map<String, String> content, User user) {
		List<Card> list = new ArrayList<>();
		list.add(create(term, meaning, deckId, content, user));
		list.add(create(meaning, term, deckId, content, user));
		return list;
	}

	@Transactional(readOnly = true)
	public Card findById(Long id) {
		return cardRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Card not found with id: " + id));
	}

	private void checkDeckOwner(Card card, User user) {
		if (card.getDeck() == null || card.getDeck().getOwner() == null) return;
		if (!card.getDeck().getOwner().getId().equals(user.getId())) {
			throw new IllegalArgumentException("Card access denied");
		}
	}

	@Transactional
	public Card update(Long id, String term, String meaning, Long deckId, Map<String, String> content, User user) {
		Card card = findById(id);
		checkDeckOwner(card, user);
		card.setTerm(term);
		card.setMeaning(meaning);
		if (deckId != null) {
			Deck deck = deckRepository.findById(deckId)
					.orElseThrow(() -> new ResourceNotFoundException("Deck not found with id: " + deckId));
			card.setDeck(deck);
		} else {
			card.setDeck(null);
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
	public void delete(Long id, User user) {
		Card card = findById(id);
		checkDeckOwner(card, user);
		cardRepository.deleteById(id);
	}

	@Transactional
	public Card changeMemorizedStatus(Long id, boolean isMemorized, User user) {
		Card card = findById(id);
		checkDeckOwner(card, user);
		card.setMemorized(isMemorized);
		return card;
	}
}
