package com.jpcard.service;

import com.jpcard.controller.dto.DashboardStatsResponse;
import com.jpcard.domain.study.StudyStatus;
import com.jpcard.repository.CardRepository;
import com.jpcard.repository.DeckRepository;
import com.jpcard.repository.PostRepository;
import com.jpcard.repository.StudyLogRepository;
import com.jpcard.repository.UserCardProgressRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StatsServiceTest {

    @Mock
    private CardRepository cardRepository;
    @Mock
    private DeckRepository deckRepository;
    @Mock
    private PostRepository postRepository;
    @Mock
    private UserCardProgressRepository progressRepository;
    @Mock
    private StudyLogRepository studyLogRepository;

    @InjectMocks
    private StatsService statsService;

    @Test
    void getDashboardStats_ShouldAggregateData() {
        when(cardRepository.countByDeckOwnerId(1L)).thenReturn(100L);
        when(deckRepository.findByOwner_Id(1L)).thenReturn(Collections.emptyList());
        when(postRepository.count()).thenReturn(5L);
        when(postRepository.sumTotalLikes()).thenReturn(42L);
        when(progressRepository.countByUserIdAndStatus(eq(1L), eq(StudyStatus.REVIEW))).thenReturn(30L);
        when(progressRepository.countByUserIdAndNextReviewLessThanEqual(eq(1L), any(LocalDateTime.class)))
                .thenReturn(5L);

        DashboardStatsResponse stats = statsService.getDashboardStats(1L);

        assertEquals(100, stats.totalCards());
        assertEquals(0, stats.totalDecks()); // empty list size
        assertEquals(5, stats.totalPosts());
        assertEquals(42, stats.totalLikes());
        assertEquals(30, stats.memorizedCards());
        assertEquals(5, stats.dueCards());
    }
}
