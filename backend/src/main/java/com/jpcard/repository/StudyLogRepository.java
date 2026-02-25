package com.jpcard.repository;

import com.jpcard.domain.study.StudyLog;
import com.jpcard.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {

    // For heatmap: count per day
    @Query("SELECT new com.jpcard.repository.StudyLogCount(CAST(s.studiedAt AS java.time.LocalDate), COUNT(s)) " +
            "FROM StudyLog s WHERE s.user.id = :userId " +
            "GROUP BY CAST(s.studiedAt AS java.time.LocalDate)")
    List<StudyLogCount> countByDate(@Param("userId") Long userId);

    @Query("SELECT COUNT(s) FROM StudyLog s WHERE s.user.id = :userId AND s.studiedAt BETWEEN :start AND :end AND s.card.deck.id = :deckId")
    long countReviewsToday(@Param("userId") Long userId, @Param("deckId") Long deckId,
            @Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

    long countByUserIdAndStudiedAtAfter(Long userId, LocalDateTime date);

    // Today's stats
    @Query("SELECT COUNT(s) FROM StudyLog s WHERE s.user.id = :userId AND s.studiedAt BETWEEN :start AND :end")
    long countTodayReviews(@Param("userId") Long userId, @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(s) FROM StudyLog s WHERE s.user.id = :userId AND s.studiedAt BETWEEN :start AND :end AND (s.rating = 'GOOD' OR s.rating = 'EASY')")
    long countTodayCorrect(@Param("userId") Long userId, @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // Weekly trend: count per day in date range
    @Query("SELECT new com.jpcard.repository.StudyLogCount(CAST(s.studiedAt AS java.time.LocalDate), COUNT(s)) " +
            "FROM StudyLog s WHERE s.user.id = :userId AND s.studiedAt >= :since " +
            "GROUP BY CAST(s.studiedAt AS java.time.LocalDate) " +
            "ORDER BY CAST(s.studiedAt AS java.time.LocalDate)")
    List<StudyLogCount> countByDateSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);
}
