package com.jpcard.controller;

import com.jpcard.controller.dto.CardRequest;
import com.jpcard.controller.dto.CardResponse;
import com.jpcard.domain.card.Card;
import com.jpcard.service.CardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.core.type.TypeReference;

import java.util.List;
import java.util.Map;
import java.util.Collections;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;
    private final ObjectMapper objectMapper;

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
    public ResponseEntity<CardResponse> create(@RequestBody CardRequest request) {
        var card = cardService.create(request.term(), request.meaning(), request.deckId(), request.content());
        return ResponseEntity.ok(toResponse(card));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CardResponse> update(@PathVariable Long id, @RequestBody CardRequest request) {
        var card = cardService.update(id, request.term(), request.meaning(), request.deckId(), request.content());
        return ResponseEntity.ok(toResponse(card));
    }

    @PatchMapping("/{id}/memorized")
    public ResponseEntity<CardResponse> updateMemorizedStatus(@PathVariable Long id, @RequestBody boolean isMemorized) {
        var card = cardService.changeMemorizedStatus(id, isMemorized);
        return ResponseEntity.ok(toResponse(card));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        cardService.delete(id);
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
