package com.jpcard.controller;

import com.jpcard.controller.dto.CardRequest;
import com.jpcard.controller.dto.CardResponse;
import com.jpcard.domain.card.Card;
import com.jpcard.service.CardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;

    @GetMapping
    public ResponseEntity<List<CardResponse>> list(
            @RequestParam(required = false) Long deckId,
            @RequestParam(required = false) Boolean memorized,
            @RequestParam(required = false) String q) {

        List<Card> cards = cardService.search(deckId, memorized, q);
        List<CardResponse> responses = cards.stream()
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CardResponse> get(@PathVariable Long id) {
        var card = cardService.findById(id);
    }

    @PostMapping
    }

    @PutMapping("/{id}")
    }

    @PatchMapping("/{id}/memorized")
    }

    @DeleteMapping("/{id}")
        return ResponseEntity.noContent().build();
    }
}
