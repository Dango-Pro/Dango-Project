package com.jpcard.service;

import com.jpcard.domain.deck.CardTemplate;
import com.jpcard.domain.deck.Deck;
import com.jpcard.domain.user.User;
import com.jpcard.repository.CardRepository;
import com.jpcard.repository.CardTemplateRepository;
import com.jpcard.repository.DeckRepository;
import com.jpcard.repository.UserCardProgressRepository;
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
	
	// ▼▼▼ [추가] DeckService가 의존하는 나머지 부품들도 Mock 처리해야 안전합니다.
	@Mock
	private CardRepository cardRepository;
	
	@Mock
	private UserCardProgressRepository progressRepository;
	
	@InjectMocks
	private DeckService deckService;
	
	@Test
	void create_ShouldSaveDeck() {
		// Given
		Deck deck = new Deck();
		deck.setId(1L);
		deck.setName("Test Deck");
		
		// 테스트를 위한 가짜 유저 생성
		User user = new User("test@test.com", "pw", "tester", "ROLE_USER");
		
		when(deckRepository.save(any(Deck.class))).thenReturn(deck);
		
		// When
		//  파라미터 4개로 맞춤
		Deck created = deckService.create("Test Deck", "Description", null, user);
		
		// Then
		assertNotNull(created);
		assertEquals("Test Deck", created.getName());
		verify(deckRepository).save(any(Deck.class));
	}
}