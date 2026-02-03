package com.jpcard.controller.dto;

public record UserSettingsRequest(String nickname, int dailyLimit, int reviewLimit, String timezone) {
}
