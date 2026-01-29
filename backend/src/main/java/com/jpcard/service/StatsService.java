package com.jpcard.service;

import com.jpcard.controller.dto.DashboardStatsResponse;
import com.jpcard.domain.post.Post;
import com.jpcard.domain.study.StudyStatus;
import com.jpcard.repository.CardRepository;
import com.jpcard.repository.DeckRepository;
import com.jpcard.repository.PostRepository;
import com.jpcard.repository.UserCardProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final CardRepository cardRepository;
    private final DeckRepository deckRepository;
    private final PostRepository postRepository;
    private final UserCardProgressRepository progressRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(Long userId) {
        long totalCards = cardRepository.count();

        // "Memorized" in SRS context usually means mature cards or those in 'REVIEW' status with significant interval.
        // For simplicity, let's count cards in 'REVIEW' status for this user.
        long memorizedCards = progressRepository.countByUserIdAndStatus(userId, StudyStatus.REVIEW);

        long totalDecks = deckRepository.count();
        long totalPosts = postRepository.count();
        long totalLikes = postRepository.findAll().stream().mapToLong(Post::getLikeCount).sum();

        // Due Cards
        long dueCards = progressRepository.countByUserIdAndNextReviewLessThanEqual(userId, LocalDateTime.now());

        return new DashboardStatsResponse(totalCards, memorizedCards, totalDecks, totalPosts, totalLikes, dueCards);
    }
}
