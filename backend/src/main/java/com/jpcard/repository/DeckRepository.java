package com.jpcard.repository;

import com.jpcard.domain.deck.Deck;
import com.jpcard.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeckRepository extends JpaRepository<Deck, Long> {
	List<Deck> findByOwner(User owner);
	List<Deck> findByOwner_Id(Long ownerId);
	List<Deck> findByIsPublicTrue();
}
