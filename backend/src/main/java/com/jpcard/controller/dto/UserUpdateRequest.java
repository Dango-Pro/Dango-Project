package com.jpcard.controller.dto;

import java.time.LocalDate;

public record UserUpdateRequest(
    Integer dailyLimit,
    Integer reviewLimit,
    String timezone,
    String nickname,
    String name,
    String email,
    String phone,
    LocalDate birthdate,
    String gender
) {}
