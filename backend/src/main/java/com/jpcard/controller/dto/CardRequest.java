package com.jpcard.controller.dto;

import java.util.Map;

public record CardRequest(String term, String meaning, Long deckId, Map<String, String> content) {
}
