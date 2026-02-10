package com.jpcard.controller.dto;

public record SignupRequest(
        String username,
        String password,
        String nickname,
        String name,
        String email,
        String phone,
        java.time.LocalDate birthdate,
        String gender,
        boolean agreedToTerms,
        boolean agreedToPrivacy
) {

}
