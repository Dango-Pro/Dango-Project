package com.jpcard.service;

import com.jpcard.domain.card.Card;
import com.jpcard.domain.deck.CardTemplate;
import com.jpcard.domain.deck.Deck;
import com.jpcard.domain.study.AlgorithmType;
import com.jpcard.domain.user.User;
import com.jpcard.repository.CardRepository;
import com.jpcard.repository.CardTemplateRepository;
import com.jpcard.repository.DeckRepository;
import com.jpcard.repository.UserCardProgressRepository;
import com.jpcard.util.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable; // ✅ 이 import가 꼭 필요합니다!
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DeckService {
	
	private final DeckRepository deckRepository;
	private final CardTemplateRepository cardTemplateRepository;
	private final CardRepository cardRepository;
	private final UserCardProgressRepository progressRepository;
	
	@Transactional(readOnly = true)
	public List<Deck> findAll(Long userId) {
		// Return My Decks + Public Decks
		return deckRepository.findByOwnerIdOrIsPublicTrue(userId);
	}
	
	@Transactional(readOnly = true)
	public List<Deck> findMyDecks(Long userId) {
		return deckRepository.findByOwnerId(userId);
	}
	
	@Transactional(readOnly = true)
	public List<Deck> findPublicDecks() {
		return deckRepository.findPublicDecks();
	}
	
	@Transactional(readOnly = true)
	public Deck findById(Long id) {
		return deckRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Deck not found with id: " + id));
	}
	
	// 덱 생성 (Overloading: DataInitializer 호환용)
	@Transactional
	public Deck create(String name, String description, Long templateId, Boolean isPublic, String learningSteps, User owner) {
		return create(name, description, templateId, isPublic, learningSteps, null, null, owner);
	}
	
	// 덱 생성 (Full Parameter)
	@Transactional
	public Deck create(String name, String description, Long templateId, Boolean isPublic, String learningSteps,
					   String algorithmType, Integer dailyNewCardLimit, User owner) {
		
		Deck deck = new Deck();
		deck.setName(name);
		deck.setDescription(description);
		deck.setOwner(owner);
		deck.setPublic(isPublic != null ? isPublic : false);
		
		if (dailyNewCardLimit != null && dailyNewCardLimit > 0) {
			deck.setDailyNewCardLimit(dailyNewCardLimit);
		}
		
		if (learningSteps != null && !learningSteps.trim().isEmpty()) {
			deck.setLearningSteps(learningSteps);
		}
		
		if (algorithmType != null && !algorithmType.trim().isEmpty()) {
			try {
				deck.setAlgorithmType(AlgorithmType.valueOf(algorithmType));
			} catch (IllegalArgumentException e) {
				deck.setAlgorithmType(AlgorithmType.SM2);
			}
		}
		
		if (templateId != null) {
			CardTemplate template = cardTemplateRepository.findById(templateId)
					.orElseThrow(() -> new ResourceNotFoundException("Template not found: " + templateId));
			deck.setCardTemplate(template);
		}
		return deckRepository.save(deck);
	}
	
	@Transactional
	public Deck update(Long id, String name, String description, boolean isPublic, String learningSteps,
					   String algorithmType, Integer dailyNewCardLimit, User owner) {
		
		Deck deck = findById(id);
		if (!deck.getOwner().getId().equals(owner.getId())) {
			throw new IllegalArgumentException("Not authorized to update this deck");
		}
		deck.setName(name);
		deck.setDescription(description);
		deck.setPublic(isPublic);
		
		if (learningSteps != null && !learningSteps.trim().isEmpty()) {
			deck.setLearningSteps(learningSteps);
		}
		if (dailyNewCardLimit != null && dailyNewCardLimit > 0) {
			deck.setDailyNewCardLimit(dailyNewCardLimit);
		}
		if (algorithmType != null && !algorithmType.trim().isEmpty()) {
			try {
				deck.setAlgorithmType(AlgorithmType.valueOf(algorithmType));
			} catch (IllegalArgumentException e) {
				// Keep existing algorithm if invalid
			}
		}
		return deck;
	}
	
	@Transactional
	public void delete(Long id, User owner) {
		Deck deck = findById(id);
		if (!deck.getOwner().getId().equals(owner.getId())) {
			throw new IllegalArgumentException("Not authorized to delete this deck");
		}
		progressRepository.deleteByCardDeckId(id);
		cardRepository.deleteByDeckId(id);
		deckRepository.deleteById(id);
	}
	
	@Transactional
	public Deck forkDeck(Long originalDeckId, User currentUser) {
		Deck original = findById(originalDeckId);
		
		if (!original.isPublic() && !original.getOwner().getId().equals(currentUser.getId())) {
			throw new IllegalArgumentException("Cannot fork a private deck");
		}
		
		Deck newDeck = new Deck();
		newDeck.setName(original.getName() + " (Fork)");
		newDeck.setDescription(original.getDescription());
		newDeck.setCardTemplate(original.getCardTemplate());
		newDeck.setOwner(currentUser);
		newDeck.setPublic(false);
		
		Deck savedDeck = deckRepository.save(newDeck);
		List<Card> cards = cardRepository.findByDeckId(originalDeckId);
		Map<Long, Long> oldNoteIdToNewNoteId = new HashMap<>();
		
		for (Card card : cards) {
			Card newCard = new Card();
			newCard.setDeck(savedDeck);
			newCard.setTerm(card.getTerm());
			newCard.setMeaning(card.getMeaning());
			newCard.setContentJson(card.getContentJson());
			newCard.setMemorized(false);
			
			Long oldNoteId = card.getNoteId();
			if (oldNoteId != null && oldNoteIdToNewNoteId.containsKey(oldNoteId)) {
				newCard.setNoteId(oldNoteIdToNewNoteId.get(oldNoteId));
				cardRepository.save(newCard);
			} else {
				cardRepository.save(newCard);
				newCard.setNoteId(newCard.getId());
				if (oldNoteId != null) {
					oldNoteIdToNewNoteId.put(oldNoteId, newCard.getId());
				}
				cardRepository.save(newCard);
			}
		}
		return savedDeck;
	}
	
	@Transactional(readOnly = true)
	public Page<Deck> findAllDecks(Pageable pageable) {
		return deckRepository.findAll(pageable);
	}
}