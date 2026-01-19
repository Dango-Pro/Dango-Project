package com.jpcard.repository;

import com.jpcard.domain.card.Card;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CardRepository extends JpaRepository<Card, Long> {

           "(:deckId IS NULL OR c.deck.id = :deckId) AND " +
           "(:memorized IS NULL OR c.isMemorized = :memorized) AND " +
    List<Card> search(@Param("deckId") Long deckId,
                      @Param("memorized") Boolean memorized,
                      @Param("keyword") String keyword);

    List<Card> findNewCards(@Param("deckId") Long deckId, @Param("userId") Long userId, Pageable pageable);

    void deleteByDeckId(Long deckId);
}
