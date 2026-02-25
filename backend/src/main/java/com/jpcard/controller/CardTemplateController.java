package com.jpcard.controller;

import com.jpcard.domain.deck.CardTemplate;
import com.jpcard.domain.user.User;
import com.jpcard.service.CardTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class CardTemplateController {

    private final CardTemplateService cardTemplateService;

    @GetMapping
    public ResponseEntity<List<CardTemplate>> list(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(cardTemplateService.findAll(userId));
    }

    @PostMapping
    public ResponseEntity<CardTemplate> create(Authentication auth, @RequestBody TemplateRequest request) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(cardTemplateService.create(request.name(), request.fieldNames(), userId));
    }

    private Long getUserId(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof User) {
            return ((User) auth.getPrincipal()).getId();
        }
        throw new RuntimeException("Unauthorized");
    }

    public record TemplateRequest(String name, List<String> fieldNames) {}
}
