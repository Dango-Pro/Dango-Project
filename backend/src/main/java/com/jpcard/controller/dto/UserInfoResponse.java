package com.jpcard.controller.dto;

import java.time.LocalDate;
import java.util.Set;

public record UserInfoResponse(
    Long id,
    String username,
    String nickname,
    String name,
    String email,
    String phone,
    LocalDate birthdate,
    String gender,
    Set<String> roles,
    int dailyLimit,
    int reviewLimit,
    String timezone
) {}
