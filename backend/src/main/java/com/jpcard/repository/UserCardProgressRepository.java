package com.jpcard.repository;

import com.jpcard.domain.study.StudyStatus;
import com.jpcard.domain.study.UserCardProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserCardProgressRepository extends JpaRepository<UserCardProgress, Long> {

    Optional<UserCardProgress> findByUserIdAndCardId(Long userId, Long cardId);

    // Find progress for a specific deck that is due
    @Query("SELECT p FROM UserCardProgress p JOIN p.card c WHERE p.user.id = :userId AND c.deck.id = :deckId AND p.nextReview <= :now")
    List<UserCardProgress> findDueCards(@Param("userId") Long userId, @Param("deckId") Long deckId, @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(p) FROM UserCardProgress p JOIN p.card c WHERE p.user.id = :userId AND c.deck.id = :deckId AND p.firstStudiedAt BETWEEN :start AND :end")
    long countNewCardsStudiedToday(@Param("userId") Long userId, @Param("deckId") Long deckId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    long countByUserIdAndNextReviewLessThanEqual(Long userId, LocalDateTime now);
    long countByUserIdAndStatus(Long userId, StudyStatus status);

    void deleteByCardDeckId(Long deckId);
}
