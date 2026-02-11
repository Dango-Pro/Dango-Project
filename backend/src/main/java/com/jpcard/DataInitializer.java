package com.jpcard;

import com.jpcard.controller.dto.DeckRequest;
import com.jpcard.domain.user.Role;
import com.jpcard.domain.user.User;
import com.jpcard.domain.deck.Deck;
import com.jpcard.repository.UserRepository;
import com.jpcard.service.CardService;
import com.jpcard.service.DeckService;
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

    private final UserRepository userRepository;
    private final DeckService deckService;
    private final CardService cardService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        User manager;
        if (userRepository.findByUsername("manager").isEmpty()) {
            manager = new User();
            manager.setUsername("manager");
            manager.setPassword(passwordEncoder.encode("manager"));
            manager.addRole(Role.ROLE_USER);
            manager.addRole(Role.ROLE_MANAGER);
            manager = userRepository.save(manager);
            System.out.println("Manager account created: manager / password");
        } else {
            manager = userRepository.findByUsername("manager").get();
        }

        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.addRole(Role.ROLE_USER);
            admin.addRole(Role.ROLE_ADMIN);
            userRepository.save(admin);
            System.out.println("Admin account created: admin / admin123");
        }

        createSampleData(manager);
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
            Deck deck = deckService.create(new DeckRequest(name, description, null, true, "1,10", null), user);
            for (CardData item : data) {
                Map<String, String> content = new HashMap<>();
                content.put("pronunciation", item.reading());
                cardService.create(item.term(), item.meaning(), deck.getId(), content, user);
            }
            System.out.println("Created sample deck: " + name);
        }
    }
}
