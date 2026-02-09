package com.jpcard.controller.dto;

import java.util.Set;


public record AdminUserRequest(
		String username,
		String password,
		String nickname,
		String status,
		Set<String> roles
) {}