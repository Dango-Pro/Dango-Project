package com.jpcard.controller.dto;

public record SignupRequest(
        String username,
        String password,
        String nickname,
        String email,
        String verificationCode) {
    public String nicknameOrEmailPrefix() {
        if (nickname != null && !nickname.isBlank())
            return nickname;
        return username != null && username.contains("@") ? username.split("@")[0] : (username != null ? username : "");
    }
}
