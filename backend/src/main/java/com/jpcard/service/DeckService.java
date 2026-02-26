package com.jpcard.service;

import com.jpcard.controller.dto.DeckRequest;
import com.jpcard.domain.card.Card;
import com.jpcard.domain.deck.Deck;
import com.jpcard.domain.user.User;
import com.jpcard.repository.CardRepository;
import com.jpcard.repository.DeckRepository;
import com.jpcard.util.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DeckService {

	private final DeckRepository deckRepository;
	private final CardRepository cardRepository;

	/**
	 * 관리자용: 모든 덱 목록 조회 (페이징)
	 * AdminController의 getDecks()에서 사용됨
	 */
	@Transactional(readOnly = true)
	public Page<Deck> findAllDecks(Pageable pageable) {
		return deckRepository.findAll(pageable);
	}

	@Transactional(readOnly = true)
	public List<Deck> findByOwner(User owner) {
		return deckRepository.findByOwner(owner);
	}

	@Transactional(readOnly = true)
	public List<Deck> findAll(Long userId) {
		return deckRepository.findByOwner_Id(userId);
	}

	@Transactional(readOnly = true)
	public List<Deck> findMyDecks(Long userId) {
		return deckRepository.findByOwner_Id(userId);
	}

	@Transactional(readOnly = true)
	public Deck findById(Long id) {
		return deckRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("덱을 찾을 수 없습니다. ID: " + id));
	}

	/**
	 * 공개된 덱 목록 조회
	 */
	@Transactional(readOnly = true)
	public List<Deck> findPublicDecks() {
		return deckRepository.findByIsPublicTrue();
	}

	@Transactional
	public Deck create(DeckRequest request, User owner) {
		Deck deck = new Deck();
		deck.setName(request.name());
		deck.setDescription(request.description() != null ? request.description() : "");
		deck.setCategory(request.category());
		deck.setPublic(request.isPublic() != null ? request.isPublic() : false);
		deck.setOwner(owner);
		deck.setLearningSteps(request.learningSteps() != null ? request.learningSteps() : "1,10");
		return deckRepository.save(deck);
	}

	@Transactional
	public Deck update(Long id, DeckRequest request, User owner) {
		Deck deck = findById(id);

		// 소유자 확인 (관리자나 매니저가 아니면 본인 것만 수정 가능)
		if (!deck.getOwner().getId().equals(owner.getId()) && !owner.getRole().equals("ROLE_ADMIN")
				&& !owner.getRole().equals("ROLE_MANAGER")) {
			throw new IllegalArgumentException("수정 권한이 없습니다.");
		}

		deck.setName(request.name());
		deck.setDescription(request.description() != null ? request.description() : deck.getDescription());
		deck.setCategory(request.category());
		deck.setPublic(request.isPublic() != null ? request.isPublic() : deck.isPublic());
		deck.setLearningSteps(request.learningSteps() != null ? request.learningSteps() : deck.getLearningSteps());
		return deck;
	}

	@Transactional
	public Deck forkDeck(Long deckId, User user) {
		Deck source = findById(deckId);
		Deck forked = new Deck();
		forked.setName(source.getName() + " (복사)");
		forked.setDescription(source.getDescription());
		forked.setCategory(source.getCategory());
		forked.setPublic(false);
		forked.setOwner(user);
		forked.setLearningSteps(source.getLearningSteps());
		if (source.getCardTemplate() != null) {
			forked.setCardTemplate(source.getCardTemplate());
		}
		Deck savedDeck = deckRepository.save(forked);

		// 카드 전체 복사
		for (Card src : source.getCards()) {
			Card copy = new Card();
			copy.setTerm(src.getTerm());
			copy.setMeaning(src.getMeaning());
			copy.setContentJson(src.getContentJson());
			copy.setNoteId(src.getNoteId());
			copy.setMemorized(false); // 새로 학습 시작
			copy.setDeck(savedDeck);
			cardRepository.save(copy);
		}
		return savedDeck;
	}

	@Transactional
	public void delete(Long id, User owner) {
		Deck deck = findById(id);

		// 소유자 확인 또는 관리자/매니저 권한 확인
		if (owner != null && !deck.getOwner().getId().equals(owner.getId()) && !owner.getRole().equals("ROLE_ADMIN")
				&& !owner.getRole().equals("ROLE_MANAGER")) {
			throw new IllegalArgumentException("삭제 권한이 없습니다.");
		}

		deckRepository.delete(deck);
	}
}