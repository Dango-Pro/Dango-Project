package com.jpcard.repository;

import com.jpcard.domain.card.Card;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CardRepository extends JpaRepository<Card, Long> {

    @Query("SELECT c FROM Card c WHERE " +
           "(:deckId IS NULL OR c.deck.id = :deckId) AND " +
           "(:memorized IS NULL OR c.isMemorized = :memorized) AND " +
           "(:keyword IS NULL OR LOWER(c.term) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.meaning) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Card> search(@Param("deckId") Long deckId,
                      @Param("memorized") Boolean memorized,
                      @Param("keyword") String keyword);

    @Query("SELECT c FROM Card c LEFT JOIN UserCardProgress p ON p.card = c AND p.user.id = :userId WHERE c.deck.id = :deckId AND p.id IS NULL")
    List<Card> findNewCards(@Param("deckId") Long deckId, @Param("userId") Long userId, Pageable pageable);

    void deleteByDeckId(Long deckId);
}
