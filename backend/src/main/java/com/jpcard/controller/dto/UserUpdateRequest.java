package com.jpcard.controller.dto;

public record UserUpdateRequest(
		String newNickname,
		String currentPassword, // 보안 확인용
		String newPassword		// 변경할 비밀번호
) {}
