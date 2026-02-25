package com.jpcard.controller.dto;

public record UserSettingsRequest(int dailyLimit, int reviewLimit, String timezone) {
}
