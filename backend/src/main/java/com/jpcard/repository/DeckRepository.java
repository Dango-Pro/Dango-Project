package com.jpcard.repository;

import com.jpcard.domain.deck.Deck;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeckRepository extends JpaRepository<Deck, Long> {
}
