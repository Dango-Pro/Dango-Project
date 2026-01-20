package com.jpcard.controller.dto;

public record SignupRequest(
        String email,
        String password,
		String nickname
	) {

}
