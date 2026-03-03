package com.jpcard.controller;

import com.jpcard.controller.dto.DeckRequest;
import com.jpcard.controller.dto.DeckResponse;
import com.jpcard.domain.deck.Deck;
import com.jpcard.domain.user.User;
import com.jpcard.service.DeckService;
import com.jpcard.service.UserService;
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
    private final UserService userService;

    private User getUser(Authentication authentication) {
        if (authentication == null)
            return null;
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
    public ResponseEntity<List<DeckResponse>> list(Authentication auth) {
        User user = getUser(auth);
        if (user == null) {
            // Not logged in -> Public decks only
            List<DeckResponse> responses = deckService.findPublicDecks().stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responses);
        }
        List<DeckResponse> responses = deckService.findAll(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/my")
    public ResponseEntity<List<DeckResponse>> listMy(Authentication auth) {
        User user = getUser(auth);
        if (user == null)
            return ResponseEntity.status(401).build();

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
        User user = getUser(auth);
        if (user == null)
            return ResponseEntity.status(401).build();

        var d = deckService.create(request, user);
        return ResponseEntity.ok(mapToResponse(d));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeckResponse> update(@PathVariable Long id, @RequestBody DeckRequest request,
            Authentication auth) {
        User user = getUser(auth);
        if (user == null)
            return ResponseEntity.status(401).build();

        var d = deckService.update(id, request, user);
        return ResponseEntity.ok(mapToResponse(d));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        User user = getUser(auth);
        if (user == null)
            return ResponseEntity.status(401).build();

        deckService.delete(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/fork")
    public ResponseEntity<DeckResponse> fork(@PathVariable Long id, Authentication auth) {
        User user = getUser(auth);
        if (user == null)
            return ResponseEntity.status(401).build();

        var d = deckService.forkDeck(id, user);
        return ResponseEntity.ok(mapToResponse(d));
    }

    private DeckResponse mapToResponse(Deck d) {
        Long templateId = d.getCardTemplate() != null ? d.getCardTemplate().getId() : null;
        String templateName = d.getCardTemplate() != null ? d.getCardTemplate().getName() : null;
        List<String> fieldNames = d.getCardTemplate() != null ? d.getCardTemplate().getFieldNames()
                : java.util.Collections.emptyList();

        return new DeckResponse(d.getId(), d.getName(), d.getDescription(), templateId, templateName, fieldNames,
                d.getOwner() != null ? d.getOwner().getId() : null, d.isPublic(), d.getLearningSteps(),
                d.getAlgorithmType(), d.getDailyNewCardLimit());
    }
}
