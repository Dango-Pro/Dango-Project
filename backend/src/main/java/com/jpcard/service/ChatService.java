package com.jpcard.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final AiService aiService;

    public String getChatResponse(String userMessage, String language) {
        // Here we could fetch real user data to pass as context
        String systemContext = "You are a helpful study assistant for a flashcard app called JPCard.";
        return aiService.getResponse(userMessage, systemContext, language);
    }
}
