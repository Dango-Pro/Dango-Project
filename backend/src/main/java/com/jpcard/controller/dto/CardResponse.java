package com.jpcard.controller.dto;

import java.util.List;
import java.util.Map;

public record CardResponse(Long id, String term, String meaning, boolean isMemorized, Long deckId, Map<String, String> content, List<String> fieldNames) {
    public CardResponse(Long id, String term, String meaning, boolean isMemorized, Long deckId, Map<String, String> content) {
        this(id, term, meaning, isMemorized, deckId, content, List.of());
    }
}
