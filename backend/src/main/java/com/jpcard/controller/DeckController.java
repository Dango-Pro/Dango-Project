package com.jpcard.controller;

import com.jpcard.controller.dto.DeckRequest;
import com.jpcard.controller.dto.DeckResponse;
import com.jpcard.domain.deck.Deck;
import com.jpcard.service.DeckService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/decks")
@RequiredArgsConstructor
public class DeckController {

    private final DeckService deckService;

    @GetMapping
    public ResponseEntity<List<DeckResponse>> list() {
        List<DeckResponse> responses = deckService.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeckResponse> get(@PathVariable Long id) {
        var d = deckService.findById(id);
        return ResponseEntity.ok(mapToResponse(d));
    }

    @PostMapping
    public ResponseEntity<DeckResponse> create(@RequestBody DeckRequest request) {
        var d = deckService.create(request.name(), request.description(), request.templateId());
        return ResponseEntity.ok(mapToResponse(d));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeckResponse> update(@PathVariable Long id, @RequestBody DeckRequest request) {
        var d = deckService.update(id, request.name(), request.description());
        return ResponseEntity.ok(mapToResponse(d));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        deckService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private DeckResponse mapToResponse(Deck d) {
        Long templateId = d.getCardTemplate() != null ? d.getCardTemplate().getId() : null;
        String templateName = d.getCardTemplate() != null ? d.getCardTemplate().getName() : null;
        List<String> fieldNames = d.getCardTemplate() != null ? d.getCardTemplate().getFieldNames() : java.util.Collections.emptyList();
        return new DeckResponse(d.getId(), d.getName(), d.getDescription(), templateId, templateName, fieldNames);
    }
}
