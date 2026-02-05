package com.jpcard.controller;

import com.jpcard.controller.dto.ChatRequest;
import com.jpcard.controller.dto.ChatResponse;
import com.jpcard.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        // Default to "en" if null
        String lang = (request.getLanguage() != null) ? request.getLanguage() : "en";
        String response = chatService.getChatResponse(request.getMessage(), lang);
        return ResponseEntity.ok(new ChatResponse(response));
    }
}
