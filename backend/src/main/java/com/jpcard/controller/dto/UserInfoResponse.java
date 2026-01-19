package com.jpcard.controller.dto;

import java.util.Set;

public record UserInfoResponse(Long id, String username, Set<String> roles, int dailyLimit) {
}
