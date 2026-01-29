package com.jpcard.controller;

import com.jpcard.controller.dto.DeckRequest;
import com.jpcard.controller.dto.DeckResponse;
import com.jpcard.domain.deck.Deck;
import com.jpcard.domain.user.User;
import com.jpcard.service.DeckService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/decks")
@RequiredArgsConstructor
public class DeckController {

    private final DeckService deckService;

    @GetMapping
    public ResponseEntity<List<DeckResponse>> list(Authentication auth) {
        if (auth == null) {
            // Not logged in -> Public decks only
             List<DeckResponse> responses = deckService.findPublicDecks().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
            return ResponseEntity.ok(responses);
        }
        User user = (User) auth.getPrincipal();
        List<DeckResponse> responses = deckService.findAll(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/my")
    public ResponseEntity<List<DeckResponse>> listMy(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        User user = (User) auth.getPrincipal();

        List<DeckResponse> responses = deckService.findMyDecks(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/public")
    public ResponseEntity<List<DeckResponse>> listPublic() {
        List<DeckResponse> responses = deckService.findPublicDecks().stream()
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
    public ResponseEntity<DeckResponse> create(@RequestBody DeckRequest request, Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        User user = (User) auth.getPrincipal();

        var d = deckService.create(request.name(), request.description(), request.templateId(), request.isPublic(), user);
        return ResponseEntity.ok(mapToResponse(d));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeckResponse> update(@PathVariable Long id, @RequestBody DeckRequest request, Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        User user = (User) auth.getPrincipal();

        boolean isPublic = request.isPublic() != null ? request.isPublic() : false;

        var d = deckService.update(id, request.name(), request.description(), isPublic, user);
        return ResponseEntity.ok(mapToResponse(d));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        User user = (User) auth.getPrincipal();

        deckService.delete(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/fork")
    public ResponseEntity<DeckResponse> fork(@PathVariable Long id, Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        User user = (User) auth.getPrincipal();

        var d = deckService.forkDeck(id, user);
        return ResponseEntity.ok(mapToResponse(d));
    }

    private DeckResponse mapToResponse(Deck d) {
        Long templateId = d.getCardTemplate() != null ? d.getCardTemplate().getId() : null;
        String templateName = d.getCardTemplate() != null ? d.getCardTemplate().getName() : null;
        List<String> fieldNames = d.getCardTemplate() != null ? d.getCardTemplate().getFieldNames() : java.util.Collections.emptyList();

        // Need to add ownerId and isPublic to Response DTO?
        // Let's assume frontend might need it.
        return new DeckResponse(d.getId(), d.getName(), d.getDescription(), templateId, templateName, fieldNames, d.getOwner() != null ? d.getOwner().getId() : null, d.isPublic());
    }
}
