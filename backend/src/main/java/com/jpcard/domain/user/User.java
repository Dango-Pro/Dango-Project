package com.jpcard.domain.user;

import jakarta.persistence.*;
import lombok.*;

import java.util.Collections;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor
public class User {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(nullable = false)
	private String password;

	@Column(nullable = false)
	private String nickname;

	@Column(nullable = false)
	private String role;

	@Enumerated(EnumType.STRING)
	private UserStatus status = UserStatus.ACTIVE;

	private int dailyLimit = 20;
	private int reviewLimit = 200;
	@Column(nullable = false)
	private String timezone = "UTC";

	public User(String email, String password, String nickname, String role) {
		this.email = email;
		this.password = password;
		this.nickname = nickname;
		this.role = role;
	}

	public void updateStatus(UserStatus status) { this.status = status; }

	/** API 호환: username 필드로 이메일 반환 */
	public String getUsername() { return email; }

	/** 초기화/테스트용: 로그인 ID 설정 (email과 동일) */
	public void setUsername(String username) { this.email = username; if (this.nickname == null) this.nickname = username; }

	/** API 호환: 단일 role 설정 */
	public void addRole(Role r) { this.role = r != null ? r.name() : this.role; }

	/** API 호환: 단일 role 문자열을 Set<Role>로 반환 */
	public Set<Role> getRoles() {
		if (role == null || role.isBlank()) return Collections.emptySet();
		try {
			return Set.of(Role.valueOf(role));
		} catch (IllegalArgumentException e) {
			return Collections.emptySet();
		}
	}
}
