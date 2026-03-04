package com.jpcard.repository;

import com.jpcard.domain.card.Card;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CardRepository extends JpaRepository<Card, Long> {

	@Query("SELECT c FROM Card c WHERE (:deckId IS NULL OR c.deck.id = :deckId) AND (:memorized IS NULL OR c.isMemorized = :memorized) AND (:keyword IS NULL OR :keyword = '' OR LOWER(c.term) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.meaning) LIKE LOWER(CONCAT('%', :keyword, '%')))")
	List<Card> search(@Param("deckId") Long deckId,
			@Param("memorized") Boolean memorized,
			@Param("keyword") String keyword);

	@Query("SELECT c FROM Card c WHERE c.deck.id = :deckId AND c.id NOT IN (SELECT ucp.card.id FROM UserCardProgress ucp WHERE ucp.user.id = :userId)")
	List<Card> findNewCards(@Param("deckId") Long deckId, @Param("userId") Long userId, Pageable pageable);

	@Query("SELECT COUNT(c) FROM Card c WHERE c.deck.owner.id = :userId")
	long countByDeckOwnerId(@Param("userId") Long userId);

	long countByDeckId(Long deckId);

	void deleteByDeckId(Long deckId);
}
