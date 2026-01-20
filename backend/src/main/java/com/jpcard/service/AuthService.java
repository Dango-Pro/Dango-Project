package com.jpcard.service;

import com.jpcard.domain.auth.RefreshToken;
import com.jpcard.domain.user.User;
import com.jpcard.repository.RefreshTokenRepository;
import com.jpcard.repository.UserRepository;
import com.jpcard.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
	
	private final UserRepository userRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final PasswordEncoder encoder;
	private final JwtUtil jwtUtil;
	
	@Transactional
	public Map<String, String> login(String email, String password) {
		// 1. 유저 확인
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
		
		// 2. 비밀번호 확인
		if (!encoder.matches(password, user.getPassword())) {
			throw new IllegalArgumentException("비밀번호 틀림");
		}
		
		// 3. 토큰 생성 (단일 Role 사용)
		String accessToken = jwtUtil.createAccessToken(user.getEmail(), user.getRole());
		String refreshToken = jwtUtil.createRefreshToken(user.getEmail());
		
		// 4. 리프레시 토큰 저장 (기존 것 삭제 후 저장)
		refreshTokenRepository.deleteByUserEmail(user.getEmail());
		refreshTokenRepository.save(new RefreshToken(user.getEmail(), refreshToken));
		
		Map<String, String> map = new HashMap<>();
		map.put("accessToken", accessToken);
		map.put("refreshToken", refreshToken);
		return map;
	}
	
	@Transactional
	public String reissueAccessToken(String refreshTokenValue) {
		if (!jwtUtil.validateToken(refreshTokenValue)) {
			throw new RuntimeException("유효하지 않은 토큰");
		}
		
		RefreshToken foundToken = refreshTokenRepository.findByTokenValue(refreshTokenValue)
				.orElseThrow(() -> new RuntimeException("DB에 없는 토큰"));
		
		User user = userRepository.findByEmail(foundToken.getUserEmail())
				.orElseThrow(() -> new RuntimeException("유저 없음"));
		
		// 새 토큰 발급
		return jwtUtil.createAccessToken(user.getEmail(), user.getRole());
	}
	
	@Transactional
	public void logout(String email) {
		refreshTokenRepository.deleteByUserEmail(email);
	}
}