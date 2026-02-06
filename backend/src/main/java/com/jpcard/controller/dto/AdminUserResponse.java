package com.jpcard.controller.dto;

import com.jpcard.domain.user.Role;
import com.jpcard.domain.user.User;
import com.jpcard.domain.user.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminUserResponse {
	private Long id;
	private String username;
	private String nickname;
	private Set<Role> roles;
	private UserStatus status;
	private LocalDateTime createdAt;
	
	public static AdminUserResponse from(User user) {
		return AdminUserResponse.builder()
				.id(user.getId())
				.username(user.getUsername())
				.nickname(user.getNickname())
				.roles(user.getRoles())
				.status(user.getStatus())
				// .createdAt(user.getCreatedAt()) // createdAt이 User 엔티티에 없다면 빼야 함
				.build();
	}
}