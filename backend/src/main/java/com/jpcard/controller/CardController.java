package com.jpcard.controller;

import com.jpcard.controller.dto.CardRequest;
import com.jpcard.controller.dto.CardResponse;
import com.jpcard.domain.card.Card;
import com.jpcard.domain.user.User;
import com.jpcard.service.CardService;
import com.jpcard.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.util.List;
import java.util.Map;
import java.util.Collections;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;
    private final UserService userService;
    private final ObjectMapper objectMapper;

    private User getUser(Authentication authentication) {
        if (authentication == null) return null;
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        if (principal instanceof String && !"anonymousUser".equals(principal)) {
             return userService.findByUsername((String) principal).orElse(null);
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<List<CardResponse>> list(
            @RequestParam(required = false) Long deckId,
            @RequestParam(required = false) Boolean memorized,
            @RequestParam(required = false) String q) {

        List<Card> cards = cardService.search(deckId, memorized, q);
        List<CardResponse> responses = cards.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CardResponse> get(@PathVariable Long id) {
        var card = cardService.findById(id);
        return ResponseEntity.ok(toResponse(card));
    }

    @PostMapping
    public ResponseEntity<List<CardResponse>> create(@RequestBody CardRequest request, Authentication auth) {
        User user = getUser(auth);
        if (user == null) return ResponseEntity.status(401).build();

        List<Card> cards;
        if (Boolean.TRUE.equals(request.createReverse())) {
            cards = cardService.createSiblings(request.term(), request.meaning(), request.deckId(), request.content(), user);
        } else {
            cards = Collections.singletonList(cardService.create(request.term(), request.meaning(), request.deckId(), request.content(), user));
        }

        List<CardResponse> responses = cards.stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CardResponse> update(@PathVariable Long id, @RequestBody CardRequest request, Authentication auth) {
        User user = getUser(auth);
        if (user == null) return ResponseEntity.status(401).build();

        var card = cardService.update(id, request.term(), request.meaning(), request.deckId(), request.content(), user);
        return ResponseEntity.ok(toResponse(card));
    }

    @PatchMapping("/{id}/memorized")
    public ResponseEntity<CardResponse> updateMemorizedStatus(@PathVariable Long id, @RequestBody boolean isMemorized, Authentication auth) {
        User user = getUser(auth);
        // Memorized status update might be allowed for study session logic?
        // But changeMemorizedStatus in CardService updates the Card entity directly.
        // So it requires owner permission.
        if (user == null) return ResponseEntity.status(401).build();

        var card = cardService.changeMemorizedStatus(id, isMemorized, user);
        return ResponseEntity.ok(toResponse(card));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        User user = getUser(auth);
        if (user == null) return ResponseEntity.status(401).build();

        cardService.delete(id, user);
        return ResponseEntity.noContent().build();
    }

    private CardResponse toResponse(Card card) {
        Map<String, String> content = parseContent(card.getContentJson());
        return new CardResponse(card.getId(), card.getTerm(), card.getMeaning(), card.isMemorized(), card.getDeck() != null ? card.getDeck().getId() : null, content);
    }

    private Map<String, String> parseContent(String json) {
        if (json == null || json.isEmpty()) return Collections.emptyMap();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, String>>() {});
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }
}
