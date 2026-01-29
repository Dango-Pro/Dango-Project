package com.jpcard.repository;

import com.jpcard.domain.study.StudyLog;
import com.jpcard.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {

    // For heatmap: count per day
    // We can fetch raw data and aggregate in service, or use aggregation query.
    // Assuming simple list fetch is fine for now as logs grow.
    // Optimization: SELECT DATE(studiedAt), COUNT(*) FROM StudyLog WHERE userId = :userId GROUP BY DATE(studiedAt)
    // H2 syntax: CAST(studiedAt as DATE)

    @Query("SELECT new com.jpcard.repository.StudyLogCount(CAST(s.studiedAt AS java.time.LocalDate), COUNT(s)) " +
           "FROM StudyLog s WHERE s.user.id = :userId " +
           "GROUP BY CAST(s.studiedAt AS java.time.LocalDate)")
    List<StudyLogCount> countByDate(@Param("userId") Long userId);
}
