package com.jpcard.controller.dto;

/** 프론트는 username 필드로 보냄. 로그인 ID = 이메일로 사용 */
public record LoginRequest(String username, String password) {
    public String email() { return username; }
}

