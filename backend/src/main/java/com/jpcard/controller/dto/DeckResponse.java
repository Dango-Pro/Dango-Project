package com.jpcard.controller.dto;

import java.util.List;

public record DeckResponse(Long id, String name, String description, Long templateId, String templateName,
        java.util.List<String> fieldNames, Long ownerId, boolean isPublic, String learningSteps, String algorithmType) {
}
