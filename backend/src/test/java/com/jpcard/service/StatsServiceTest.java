package com.jpcard.service;

import com.jpcard.controller.dto.DashboardStatsResponse;
import com.jpcard.domain.post.Post;
import com.jpcard.domain.study.StudyStatus;
import com.jpcard.repository.CardRepository;
import com.jpcard.repository.DeckRepository;
import com.jpcard.repository.PostRepository;
import com.jpcard.repository.UserCardProgressRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StatsServiceTest {

    @Mock private CardRepository cardRepository;
    @Mock private DeckRepository deckRepository;
    @Mock private PostRepository postRepository;
    @Mock private UserCardProgressRepository progressRepository;

    @InjectMocks private StatsService statsService;

    @Test
    void getDashboardStats_ShouldAggregateData() {
        when(cardRepository.count()).thenReturn(100L);
        when(deckRepository.count()).thenReturn(10L);
        when(postRepository.count()).thenReturn(5L);
        when(postRepository.findAll()).thenReturn(Collections.emptyList());
        when(progressRepository.countByUserIdAndStatus(anyLong(), eq(StudyStatus.REVIEW))).thenReturn(30L);
        when(progressRepository.countByUserIdAndNextReviewLessThanEqual(anyLong(), any(LocalDateTime.class))).thenReturn(5L);

        DashboardStatsResponse stats = statsService.getDashboardStats(1L);

        assertEquals(100, stats.totalCards());
        assertEquals(10, stats.totalDecks());
        assertEquals(5, stats.totalPosts());
        assertEquals(30, stats.memorizedCards());
        assertEquals(5, stats.dueCards());
    }
}
