package com.jpcard.domain.auth;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "refreshToken")
@Getter
@NoArgsConstructor
public class RefreshToken {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false)
	private String userEmail;
	
	@Column(nullable = false, length = 512)
	private String tokenValue;
	
	public RefreshToken(String userEmail, String tokenValue) {
		this.userEmail = userEmail;
		this.tokenValue = tokenValue;
	}
	
	public void updateToken(String newToken) {
		this.tokenValue = newToken;
	}
}
