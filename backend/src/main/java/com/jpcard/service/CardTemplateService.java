package com.jpcard.service;

import com.jpcard.domain.deck.CardTemplate;
import com.jpcard.domain.user.User;
import com.jpcard.repository.CardTemplateRepository;
import com.jpcard.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CardTemplateService {

    private final CardTemplateRepository cardTemplateRepository;
    private final UserRepository userRepository;

    @PostConstruct
    public void init() {
        if (cardTemplateRepository.count() == 0) {
            CardTemplate defaultTemplate = new CardTemplate();
            defaultTemplate.setName("Basic");
            defaultTemplate.setFieldNames(Arrays.asList("Front", "Back"));
            cardTemplateRepository.save(defaultTemplate);
        }
    }

    @Transactional(readOnly = true)
    public List<CardTemplate> findAll(Long userId) {
        return cardTemplateRepository.findByUserIdOrUserIdIsNull(userId);
    }

    @Transactional
    public CardTemplate create(String name, List<String> fieldNames, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        CardTemplate template = new CardTemplate();
        template.setName(name);
        template.setFieldNames(fieldNames);
        template.setUser(user);
        return cardTemplateRepository.save(template);
    }

    @Transactional(readOnly = true)
    public CardTemplate findById(Long id) {
        return cardTemplateRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Template not found"));
    }
}
