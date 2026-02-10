package com.jpcard.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
	
	@Value("${jwt.secret}") // application.yaml에 설정된 비밀키 가져오기
	private String secretKey;
	
	private Key key;
	private final long ACCESS_TOKEN_EXPIRATION = 1000 * 60 * 30; // 30분
	private final long REFRESH_TOKEN_EXPIRATION = 1000 * 60 * 60 * 24 * 7; // 7일
	
	@PostConstruct
	public void init() {
		// 비밀키를 암호화 알고리즘에 맞게 변환
		this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
	}
	
	// 1. Access Token 생성 (이메일 + 단일 Role)
	public String createAccessToken(String email, String role) {
		return Jwts.builder()
				.setSubject(email)       // 토큰 주인: 이메일
				.claim("role", role)     // 권한: 문자열 하나 (예: "ROLE_USER")
				.setIssuedAt(new Date()) // 발행 시간
				.setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION)) // 만료 시간
				.signWith(key, SignatureAlgorithm.HS256) // 서명
				.compact();
	}
	
	// 2. Refresh Token 생성 (이메일만 포함)
	public String createRefreshToken(String email) {
		return Jwts.builder()
				.setSubject(email)
				.setIssuedAt(new Date())
				.setExpiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRATION))
				.signWith(key, SignatureAlgorithm.HS256)
				.compact();
	}
	
	// 3. 토큰 검증 (boolean 반환)
	public boolean validateToken(String token) {
		try {
			Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
			return true;
		} catch (SecurityException | MalformedJwtException e) {
			System.out.println("잘못된 JWT 서명입니다.");
		} catch (ExpiredJwtException e) {
			System.out.println("만료된 JWT 토큰입니다.");
		} catch (UnsupportedJwtException e) {
			System.out.println("지원되지 않는 JWT 토큰입니다.");
		} catch (IllegalArgumentException e) {
			System.out.println("JWT 토큰이 잘못되었습니다.");
		}
		return false;
	}
	
	// 4. 토큰에서 이메일(Subject) 꺼내기
	public String getEmailFromToken(String token) {
		return Jwts.parserBuilder().setSigningKey(key).build()
				.parseClaimsJws(token)
				.getBody()
				.getSubject();
	}
}