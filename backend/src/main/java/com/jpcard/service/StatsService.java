package com.jpcard.service;

import com.jpcard.controller.dto.DashboardStatsResponse;
import com.jpcard.domain.post.Post;
import com.jpcard.domain.study.StudyStatus;
import com.jpcard.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final CardRepository cardRepository;
    private final DeckRepository deckRepository;
    private final PostRepository postRepository;
    private final UserCardProgressRepository progressRepository;
    private final StudyLogRepository studyLogRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(Long userId) {
        long totalCards = cardRepository.count();

        // "Memorized" in SRS context usually means mature cards or those in 'REVIEW' status with significant interval.
        long memorizedCards = progressRepository.countByUserIdAndStatus(userId, StudyStatus.REVIEW);

        long totalDecks = deckRepository.count();
        long totalPosts = postRepository.count();
        long totalLikes = postRepository.findAll().stream().mapToLong(Post::getLikeCount).sum();

        // Due Cards
        long dueCards = progressRepository.countByUserIdAndNextReviewLessThanEqual(userId, LocalDateTime.now());

        return new DashboardStatsResponse(totalCards, memorizedCards, totalDecks, totalPosts, totalLikes, dueCards);
    }

    @Transactional(readOnly = true)
    public List<StudyLogCount> getStudyActivity(Long userId) {
        return studyLogRepository.countByDate(userId);
    }
}
