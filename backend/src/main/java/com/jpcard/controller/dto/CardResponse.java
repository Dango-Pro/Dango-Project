package com.jpcard.controller.dto;

public record CardResponse(Long id, String term, String meaning, boolean isMemorized, Long deckId) {
}
