package com.jpcard.domain.user;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users") // SQL 테이블명과 일치
@Getter
@NoArgsConstructor
public class User {
	
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false, unique = true)
	private String email; // username 대신 email 사용
	
	@Column(nullable = false)
	private String password;
	
	@Column(nullable = false)
	private String nickname;
	
	@Column(nullable = false)
	private String role; // Set<Role> 대신 String 하나로 통일
	
	@Enumerated(EnumType.STRING) // DB에 숫자가 아닌 "ACTIVE", "WITHDRAWN" 글자로 저장
	@Column(nullable = false)
	private UserStatus status = UserStatus.ACTIVE;
	
	
	// 생성자 (DataInitializer에서 쓰기 위해 필요)
	public User(String email, String password, String nickname, String role) {
		this.email = email;
		this.password = password;
		this.nickname = nickname;
		this.role = role;
	}
	
	@Column(nullable = false)
	private int dailyLimit = 20;
	public void updateDailyLimit(int newLimit) {
		this.dailyLimit = newLimit;
	}
	public int getDailyLimit() {
		return dailyLimit;
	}
	
	public void updateStatus(UserStatus status) { this.status = status; }
	
	public void setNickname(String nickname) {
		this.nickname = nickname;
	}
	
	public void setPassword(String password) {
		this.password = password;
	}
}