package com.jpcard.controller.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private String message;
    private String language; // "ko", "en", "ja"
}
