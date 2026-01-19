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
        return ResponseEntity.ok(mapToResponse(d));
    }

    @PutMapping("/{id}")
        return ResponseEntity.ok(mapToResponse(d));
    }

    @DeleteMapping("/{id}")
        return ResponseEntity.noContent().build();
    }

    private DeckResponse mapToResponse(Deck d) {
        Long templateId = d.getCardTemplate() != null ? d.getCardTemplate().getId() : null;
        String templateName = d.getCardTemplate() != null ? d.getCardTemplate().getName() : null;
        List<String> fieldNames = d.getCardTemplate() != null ? d.getCardTemplate().getFieldNames() : java.util.Collections.emptyList();
    }
}
