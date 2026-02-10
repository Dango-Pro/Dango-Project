package com.jpcard.service;

import com.jpcard.domain.auth.RefreshToken;
import com.jpcard.domain.user.User;
import com.jpcard.domain.user.UserStatus;
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
	private final NicknameFilterService nicknameFilterService;
	
	@Transactional
	public void signup(String email, String password, String nickname) {
		// [보안 기능] 1. 악성 닉네임 필터링 (필터에 걸리면 에러 출력 및 가입 중단)
		nicknameFilterService.validateNickname(nickname);
		
		// 2. 이메일 중복 검사 (기존 코드)
		if (userRepository.existsByEmail(email)) {
			throw new IllegalArgumentException("이미 가입된 이메일 입니다");
		}
		
		//  3. 유저 객체 생성 및 저장
		User user = new User(
				email,
				encoder.encode(password), // 비밀번호 암호화 필수!
				nickname,
				"ROLE_USER" // 기본 권한 부여
		);
		userRepository.save(user); // DB에 저장
	}
	
	@Transactional
	public Map<String, String> login(String email, String password) {
		// 1. 유저 확인
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
		
		// 탈퇴한 회원의 로그인 막기
		if (user.getStatus() == UserStatus.WITHDRAWN) {
			throw new IllegalArgumentException("탈퇴한 계정입니다.");
		}
		
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