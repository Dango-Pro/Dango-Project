package com.jpcard.controller.dto;

public record DeckRequest(String name, String description, Long templateId, Boolean isPublic, String learningSteps, String category) {
    public String category() { return category != null ? category : ""; }
}
