package com.jpcard.controller.dto;
import java.time.LocalDateTime;
import java.util.Set;

public record AdminUserResponse(
		Long id, String username, String status, Set<String> roles, LocalDateTime createdAt
) {}