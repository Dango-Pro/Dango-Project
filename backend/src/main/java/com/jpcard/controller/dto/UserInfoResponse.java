package com.jpcard.controller.dto;

import java.util.Set;

public record UserInfoResponse(Long id, String username, java.util.Set<String> roles, int dailyLimit, int reviewLimit, String timezone) {
}
