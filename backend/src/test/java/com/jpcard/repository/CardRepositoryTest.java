package com.jpcard.repository;

import com.jpcard.domain.card.Card;
import com.jpcard.domain.deck.Deck;
import com.jpcard.domain.user.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class CardRepositoryTest {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private DeckRepository deckRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void findNewCards_ShouldReturnCards_WhenNoProgressExists() {
        // Given
        User user = new User();
        user.setUsername("testuser_repo_final");
        user.setPassword("password");
        userRepository.save(user);

        Deck deck = new Deck();
        deck.setName("Test Deck");
        deckRepository.save(deck);

        Card card1 = new Card();
        card1.setDeck(deck);
        card1.setTerm("Card 1");
        card1.setMeaning("Meaning 1");
        card1.setContentJson("{}");
        cardRepository.save(card1);

        Card card2 = new Card();
        card2.setDeck(deck);
        card2.setTerm("Card 2");
        card2.setMeaning("Meaning 2");
        card2.setContentJson("{}");
        cardRepository.save(card2);

        // When
        List<Card> newCards = cardRepository.findNewCards(deck.getId(), user.getId(), PageRequest.of(0, 10));

        // Then
        assertThat(newCards).hasSize(2);
        assertThat(newCards).extracting(Card::getTerm).containsExactlyInAnyOrder("Card 1", "Card 2");
    }
}
