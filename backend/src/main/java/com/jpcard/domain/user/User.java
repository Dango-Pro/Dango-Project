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
	
	// 생성자 (DataInitializer에서 쓰기 위해 필요)
	public User(String email, String password, String nickname, String role) {
		this.email = email;
		this.password = password;
		this.nickname = nickname;
		this.role = role;
	}
}