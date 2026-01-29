package com.jpcard.repository;

import com.jpcard.domain.deck.Deck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DeckRepository extends JpaRepository<Deck, Long> {

    @Query("SELECT d FROM Deck d WHERE d.owner.id = :userId")
    List<Deck> findByOwnerId(@Param("userId") Long userId);

    @Query("SELECT d FROM Deck d WHERE d.isPublic = true")
    List<Deck> findPublicDecks();

    @Query("SELECT d FROM Deck d WHERE d.owner.id = :userId OR d.isPublic = true")
    List<Deck> findByOwnerIdOrIsPublicTrue(@Param("userId") Long userId);
}
