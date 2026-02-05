package com.jpcard;

import com.jpcard.domain.user.Role;
import com.jpcard.domain.user.User;
import com.jpcard.domain.deck.Deck;
import com.jpcard.repository.PostRepository;
import com.jpcard.repository.UserRepository;
import com.jpcard.service.CardService;
import com.jpcard.service.DeckService;
import com.jpcard.service.PostService;
import com.jpcard.util.SampleDataFactory;
import com.jpcard.util.SampleDataFactory.CardData;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final String DEFAULT_NOTICE_TITLE = "통합 공지사항 입니다.";
    private static final String DEFAULT_NOTICE_CONTENT = """
            # JPCard 스튜디오에 오신 것을 환영합니다.

            본 플랫폼은 **반복 간격 알고리즘(Spaced Repetition)**을 활용한 일본어 지식 카드 관리 및 학습 서비스입니다.

            ## 이용 안내
            - **덱/카드**: 나만의 일본어 단어·문장 덱을 만들고 관리할 수 있습니다.
            - **학습**: 카드를 플래시카드 형태로 학습하며, 복습 시점이 자동으로 관리됩니다.
            - **커뮤니티**: 게시글과 댓글로 다른 학습자와 소통할 수 있습니다.

            문의나 건의사항이 있으시면 커뮤니티 게시판을 활용해 주세요.
            """;

    private final UserRepository userRepository;
    private final DeckService deckService;
    private final CardService cardService;
    private final PostService postService;
    private final PostRepository postRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        User manager;
        if (userRepository.findByUsername("manager").isEmpty()) {
            manager = new User();
            manager.setUsername("manager");
            manager.setPassword(passwordEncoder.encode("password"));
            manager.addRole(Role.ROLE_USER);
            manager.addRole(Role.ROLE_MANAGER);
            manager = userRepository.save(manager);
            System.out.println("Manager account created: manager / password");
        } else {
            manager = userRepository.findByUsername("manager").get();
        }

        User admin = getOrCreateAdmin();
        createSampleData(manager);
        createDefaultNoticeIfNotExists(admin);
    }

    private User getOrCreateAdmin() {
        User admin;
        if (userRepository.findByUsername("admin").isEmpty()) {
            admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.addRole(Role.ROLE_USER);
            admin.addRole(Role.ROLE_MANAGER);
            admin.addRole(Role.ROLE_ADMIN);
            admin = userRepository.save(admin);
            System.out.println("Admin account created: admin / admin");
        } else {
            admin = userRepository.findByUsername("admin").get();
            if (!admin.getRoles().contains(Role.ROLE_ADMIN)) {
                admin.addRole(Role.ROLE_ADMIN);
                userRepository.save(admin);
                System.out.println("Added ROLE_ADMIN to existing admin user");
            }
        }
        return admin;
    }

    private void createDefaultNoticeIfNotExists(User admin) {
        boolean exists = postRepository.findByIsNoticeTrueOrderByIdDesc().stream()
                .anyMatch(p -> DEFAULT_NOTICE_TITLE.equals(p.getTitle()));
        if (!exists) {
            postService.create(
                    DEFAULT_NOTICE_TITLE,
                    DEFAULT_NOTICE_CONTENT,
                    true,
                    "admin",
                    null,
                    null,
                    admin);
            System.out.println("Default notice created: " + DEFAULT_NOTICE_TITLE);
        }
    }

    private void createSampleData(User user) {
        // Deck 1
        createDeckIfNotExists(user, "JLPT N5 - 기초 (숫자/시간)", "JLPT N5 숫자, 시간, 기본 동사", SampleDataFactory.getN5Basics());
        // Deck 2
        createDeckIfNotExists(user, "일상 생활 (음식/가족)", "가족, 음식, 집안 물건", SampleDataFactory.getDailyLife());
        // Deck 3
        createDeckIfNotExists(user, "여행 및 인사말", "여행 필수 단어 및 인사말", SampleDataFactory.getTravelAndGreetings());
    }

    private void createDeckIfNotExists(User user, String name, String description, List<CardData> data) {
        boolean exists = deckService.findMyDecks(user.getId()).stream()
                .anyMatch(d -> d.getName().equals(name));

        if (!exists) {
            Deck deck = deckService.create(name, description, null, true, "1,10", null, null, user);
            for (CardData item : data) {
                Map<String, String> content = new HashMap<>();
                content.put("pronunciation", item.reading());
                cardService.create(item.term(), item.meaning(), deck.getId(), content, user);
            }
            System.out.println("Created sample deck: " + name);
        }
    }
}
