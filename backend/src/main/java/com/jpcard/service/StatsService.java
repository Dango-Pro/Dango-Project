package com.jpcard.service;

import com.jpcard.controller.dto.DashboardExtendedResponse;
import com.jpcard.controller.dto.DashboardExtendedResponse.DeckProgressItem;
import com.jpcard.controller.dto.DashboardStatsResponse;
import com.jpcard.domain.deck.Deck;
import com.jpcard.domain.study.StudyStatus;
import com.jpcard.repository.CardRepository;
import com.jpcard.repository.DeckRepository;
import com.jpcard.repository.PostRepository;
import com.jpcard.repository.StudyLogRepository;
import com.jpcard.repository.StudyLogCount;
import com.jpcard.repository.UserCardProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
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
                long totalCards = cardRepository.countByDeckOwnerId(userId);
                long memorizedCards = progressRepository.countByUserIdAndStatus(userId, StudyStatus.REVIEW);
                long totalDecks = deckRepository.findByOwner_Id(userId).size();
                long totalPosts = postRepository.count();
                long totalLikes = postRepository.sumTotalLikes();
                long dueCards = progressRepository.countByUserIdAndNextReviewLessThanEqual(userId, LocalDateTime.now());
                return new DashboardStatsResponse(totalCards, memorizedCards, totalDecks, totalPosts, totalLikes,
                                dueCards);
        }

        @Transactional(readOnly = true)
        public List<Map<String, Object>> getActivityData(Long userId) {
                List<StudyLogCount> counts = studyLogRepository.countByDate(userId);
                return counts.stream()
                                .map(c -> Map.<String, Object>of(
                                                "date", c.date().toString(),
                                                "count", c.count()))
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public DashboardExtendedResponse getExtendedStats(Long userId) {
                LocalDate today = LocalDate.now();
                LocalDateTime dayStart = today.atStartOfDay();
                LocalDateTime dayEnd = today.atTime(LocalTime.MAX);

                // 1. Today's summary
                long reviewsToday = studyLogRepository.countTodayReviews(userId, dayStart, dayEnd);
                long correctToday = studyLogRepository.countTodayCorrect(userId, dayStart, dayEnd);
                double accuracyPercent = reviewsToday > 0
                                ? Math.round((double) correctToday / reviewsToday * 1000.0) / 10.0
                                : 0;

                // 2. Streak calculation
                int streakDays = calculateStreak(userId);

                // 3. Deck progress
                List<Deck> userDecks = deckRepository.findByOwner_Id(userId);
                List<DeckProgressItem> deckProgress = new ArrayList<>();
                for (Deck deck : userDecks) {
                        long totalCards = cardRepository.countByDeckId(deck.getId());
                        long newCards = progressRepository.countByUserIdAndCardDeckIdAndStatus(userId, deck.getId(),
                                        StudyStatus.NEW);
                        long learningCards = progressRepository.countByUserIdAndCardDeckIdAndStatus(userId,
                                        deck.getId(),
                                        StudyStatus.LEARNING);
                        long reviewCards = progressRepository.countByUserIdAndCardDeckIdAndStatus(userId, deck.getId(),
                                        StudyStatus.REVIEW);
                        long suspendedCards = progressRepository.countByUserIdAndCardDeckIdAndStatus(userId,
                                        deck.getId(),
                                        StudyStatus.SUSPENDED);
                        deckProgress.add(new DeckProgressItem(
                                        deck.getId(), deck.getName(), totalCards,
                                        newCards, learningCards, reviewCards, suspendedCards));
                }

                // 4. Weekly trend (last 7 days)
                LocalDateTime sevenDaysAgo = today.minusDays(6).atStartOfDay();
                List<StudyLogCount> weekData = studyLogRepository.countByDateSince(userId, sevenDaysAgo);
                Map<LocalDate, Long> weekMap = weekData.stream()
                                .collect(Collectors.toMap(StudyLogCount::date, StudyLogCount::count));

                List<Map<String, Object>> weeklyTrend = new ArrayList<>();
                for (int i = 6; i >= 0; i--) {
                        LocalDate date = today.minusDays(i);
                        long count = weekMap.getOrDefault(date, 0L);
                        weeklyTrend.add(Map.of(
                                        "date", date.toString(),
                                        "day", date.getDayOfWeek().toString().substring(0, 3),
                                        "count", count));
                }

                return new DashboardExtendedResponse(reviewsToday, accuracyPercent, streakDays, deckProgress,
                                weeklyTrend);
        }

        private int calculateStreak(Long userId) {
                List<StudyLogCount> allDates = studyLogRepository.countByDate(userId);
                Set<LocalDate> studyDates = allDates.stream()
                                .map(StudyLogCount::date)
                                .collect(Collectors.toSet());

                int streak = 0;
                LocalDate check = LocalDate.now();

                // If no study today, start from yesterday
                if (!studyDates.contains(check)) {
                        check = check.minusDays(1);
                }

                while (studyDates.contains(check)) {
                        streak++;
                        check = check.minusDays(1);
                }
                return streak;
        }
}
