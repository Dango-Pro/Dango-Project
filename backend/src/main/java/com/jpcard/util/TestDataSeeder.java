package com.jpcard.util;

import com.jpcard.controller.dto.DeckRequest;
import com.jpcard.domain.card.Card;
import com.jpcard.domain.deck.CardTemplate;
import com.jpcard.domain.deck.Deck;
import com.jpcard.domain.study.StudyLog;
import com.jpcard.domain.study.StudyStatus;
import com.jpcard.domain.study.UserCardProgress;
import com.jpcard.domain.user.User;
import com.jpcard.repository.CardTemplateRepository;
import com.jpcard.repository.StudyLogRepository;
import com.jpcard.repository.UserCardProgressRepository;
import com.jpcard.service.CardService;
import com.jpcard.service.DeckService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
public class TestDataSeeder {

    private final DeckService deckService;
    private final CardService cardService;
    private final CardTemplateRepository cardTemplateRepository;
    private final UserCardProgressRepository progressRepository;
    private final StudyLogRepository studyLogRepository;

    private final Random random = new Random(42); // fixed seed for reproducibility

    @Transactional
    public void seedTestData(User testUser) {
        // 1. Create custom templates for test user
        createTemplates(testUser);

        // 2. Create decks with cards — collect cards directly
        List<Card> allCards = new ArrayList<>();
        createDecksWithCards(testUser, allCards);

        System.out.println("Total cards created for test user: " + allCards.size());

        // 3. Create UserCardProgress for ~75% of cards
        List<UserCardProgress> progressList = createProgress(testUser, allCards);

        // 4. Generate StudyLogs for the past 90 days
        createStudyLogs(testUser, allCards);

        System.out.println("Test data seeded: " + allCards.size() + " cards, " +
                progressList.size() + " progress records");
    }

    private void createTemplates(User user) {
        createTemplate("문법 (Grammar)", Arrays.asList("패턴", "의미", "예문"), user);
        createTemplate("예문 (Sentences)", Arrays.asList("일본어 문장", "한국어 번역", "문법 포인트"), user);
        createTemplate("한자 쓰기 (Kanji Writing)", Arrays.asList("한자", "읽기", "뜻", "획순"), user);
        createTemplate("청해 (Listening)", Arrays.asList("음성 텍스트", "번역", "핵심 표현"), user);
    }

    private CardTemplate createTemplate(String name, List<String> fields, User user) {
        CardTemplate template = new CardTemplate();
        template.setName(name);
        template.setFieldNames(fields);
        template.setUser(user);
        return cardTemplateRepository.save(template);
    }

    private void createDecksWithCards(User user, List<Card> allCards) {
        allCards.addAll(createDeck(user, "JLPT N5 기초 한자", "N5 필수 한자 20자", "JLPT", SampleDataFactory.getN5Kanji()));
        allCards.addAll(createDeck(user, "JLPT N4 문법 패턴", "N4 주요 문법 패턴 20개", "JLPT", SampleDataFactory.getN4Grammar()));
        allCards.addAll(createDeck(user, "JLPT N3 독해 단어", "N3 독해 필수 어휘", "JLPT", SampleDataFactory.getN3Reading()));
        allCards.addAll(createDeck(user, "일본어 형용사", "자주 쓰이는 い형용사 18개", "어휘", SampleDataFactory.getAdjectives()));
        allCards.addAll(
                createDeck(user, "비즈니스 일본어", "직장에서 쓰는 비즈니스 표현", "비즈니스", SampleDataFactory.getBusinessJapanese()));
        allCards.addAll(
                createDeck(user, "일본 문화 & 표현", "일본 문화 관련 단어", "문화", SampleDataFactory.getCulturalExpressions()));
        allCards.addAll(createDeck(user, "가타카나 외래어", "자주 쓰이는 외래어 단어", "어휘", SampleDataFactory.getKatakanaLoanwords()));
        allCards.addAll(
                createDeck(user, "일상 회화 표현", "일상에서 바로 쓸 수 있는 표현", "회화", SampleDataFactory.getDailyConversation()));
    }

    /**
     * Creates a deck and its cards, returning the list of created Card entities
     * directly.
     * We do NOT rely on deck.getCards() because JPA first-level cache might not
     * reflect cards added via cardService.create() in the same transaction.
     */
    private List<Card> createDeck(User user, String name, String description, String category,
            List<SampleDataFactory.CardData> cardDataList) {
        Deck deck = deckService.create(
                new DeckRequest(name, description, null, true, "1,10", category), user);

        List<Card> createdCards = new ArrayList<>();
        for (SampleDataFactory.CardData data : cardDataList) {
            Map<String, String> content = new HashMap<>();
            content.put("pronunciation", data.reading());
            Card card = cardService.create(data.term(), data.meaning(), deck.getId(), content, user);
            createdCards.add(card);
        }

        return createdCards;
    }

    private List<UserCardProgress> createProgress(User user, List<Card> allCards) {
        List<UserCardProgress> result = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        // Process ~75% of cards
        int progressCount = (int) (allCards.size() * 0.75);
        List<Card> shuffled = new ArrayList<>(allCards);
        Collections.shuffle(shuffled, random);

        for (int i = 0; i < progressCount && i < shuffled.size(); i++) {
            Card card = shuffled.get(i);
            UserCardProgress p = new UserCardProgress();
            p.setUser(user);
            p.setCard(card);

            double roll = random.nextDouble();

            if (roll < 0.20) {
                // NEW — 20%
                p.setStatus(StudyStatus.NEW);
                p.setNextReview(now.plusDays(random.nextInt(3)));
                p.setIntervalMinutes(0);
                p.setEase(2.5);
                p.setRepetitions(0);
                p.setLearningStep(0);
                p.setLapses(0);
            } else if (roll < 0.45) {
                // LEARNING — 25%
                p.setStatus(StudyStatus.LEARNING);
                p.setNextReview(now.minusMinutes(random.nextInt(120)));
                p.setIntervalMinutes(1 + random.nextInt(60));
                p.setEase(2.0 + random.nextDouble() * 0.8);
                p.setRepetitions(1 + random.nextInt(3));
                p.setLearningStep(random.nextInt(2));
                p.setLapses(random.nextInt(2));
                p.setFirstStudiedAt(now.minusDays(random.nextInt(30)));
            } else if (roll < 0.85) {
                // REVIEW — 40% (these count as "memorized")
                p.setStatus(StudyStatus.REVIEW);
                int daysInterval = 1 + random.nextInt(30);
                p.setIntervalMinutes(daysInterval * 1440);
                p.setEase(2.0 + random.nextDouble() * 1.0);
                p.setRepetitions(3 + random.nextInt(13));
                p.setLearningStep(0);
                p.setLapses(random.nextInt(4));
                p.setFirstStudiedAt(now.minusDays(30 + random.nextInt(60)));

                // Some are overdue (past nextReview), some in future
                if (random.nextDouble() < 0.4) {
                    p.setNextReview(now.minusDays(random.nextInt(5)).minusHours(random.nextInt(24)));
                } else {
                    p.setNextReview(now.plusDays(random.nextInt(daysInterval)));
                }

                // FSRS-like fields for some
                if (random.nextDouble() < 0.5) {
                    p.setStability(5.0 + random.nextDouble() * 25.0);
                    p.setDifficulty(1.0 + random.nextDouble() * 9.0);
                }
            } else {
                // SUSPENDED — 15%
                p.setStatus(StudyStatus.SUSPENDED);
                p.setNextReview(now.plusDays(365));
                p.setIntervalMinutes(1440 + random.nextInt(14400));
                p.setEase(1.8 + random.nextDouble() * 0.5);
                p.setRepetitions(random.nextInt(5));
                p.setLearningStep(0);
                p.setLapses(2 + random.nextInt(4));
                p.setFirstStudiedAt(now.minusDays(60 + random.nextInt(30)));
            }

            result.add(progressRepository.save(p));
        }

        System.out.println("Created " + result.size() + " UserCardProgress records");
        return result;
    }

    private void createStudyLogs(User user, List<Card> allCards) {
        if (allCards.isEmpty()) {
            System.out.println("WARNING: No cards available for study log generation!");
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        String[] ratings = { "FAIL", "HARD", "GOOD", "GOOD", "GOOD", "GOOD", "GOOD", "EASY", "EASY", "HARD" };
        // Distribution: FAIL 10%, HARD 20%, GOOD 50%, EASY 20%

        int totalLogs = 0;

        for (int dayOffset = 90; dayOffset >= 0; dayOffset--) {
            // Some days have no reviews (gaps for realism)
            if (random.nextDouble() < 0.12)
                continue; // ~12% chance of no study

            LocalDateTime dayBase = now.minusDays(dayOffset).withHour(8).withMinute(0).withSecond(0);
            int dayOfWeek = dayBase.getDayOfWeek().getValue(); // 1=Mon, 7=Sun

            // Weekdays: 5-15, Weekends: 10-25
            int reviewCount;
            if (dayOfWeek <= 5) {
                reviewCount = 5 + random.nextInt(11);
            } else {
                reviewCount = 10 + random.nextInt(16);
            }

            for (int r = 0; r < reviewCount; r++) {
                Card card = allCards.get(random.nextInt(allCards.size()));
                String rating = ratings[random.nextInt(ratings.length)];

                StudyLog log = new StudyLog();
                log.setUser(user);
                log.setCard(card);
                log.setRating(rating);
                // Spread reviews throughout study session (8am - 11pm)
                log.setStudiedAt(dayBase.plusMinutes(random.nextInt(900)));

                studyLogRepository.save(log);
                totalLogs++;
            }
        }

        System.out.println("Created " + totalLogs + " study log entries over 90 days");
    }
}
