package com.jpcard.service;

import com.jpcard.repository.RefreshTokenRepository;
import com.jpcard.repository.UserRepository;
import com.jpcard.util.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import com.jpcard.domain.user.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public Map<String, String> login(String username, String password) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        if (!encoder.matches(password, user.getPassword()))
            throw new IllegalArgumentException("비밀번호 틀림");

        // access token
        Set<String> roles = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());
        String access = jwtUtil.createAccessToken(user.getId(), roles);

        // refresh token
        String refresh = jwtUtil.createRefreshToken(user.getId());
        user.setRefreshToken(refresh);

        Map<String, String> map = new HashMap<>();
        map.put("accessToken", access);
        map.put("refreshToken", refresh);

        return map;
    }

    @Transactional
    public void logout(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setRefreshToken(null);
    }

    @Transactional
    public String refresh(String refreshToken) {

        Claims claims = jwtUtil.validateToken(refreshToken);
        Long userId = Long.valueOf(claims.getSubject());

        User user = userRepository.findById(userId).orElseThrow();

        if (user.getRefreshToken() == null ||
                !user.getRefreshToken().equals(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 리프레시");
        }

        // 새 Access 토큰 발급
        Set<String> roles = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());

        return jwtUtil.createAccessToken(userId, roles);
    }
	
	// 재발급 로직
	private final RefreshTokenRepository refreshTokenRepository;
	
	public String reissueAccessToken(String refreshTokenValue) {
		// 토큰 유효성 검사
		if (!jwtUtil.validateToken(refreshTokenValue)) {
			throw new RuntimeException("유효하지 않은 리프레시 토큰입니다.");
		}
		// DB에 있는지 확인
		RefreshToken foundToken = refreshTokenRepository.findByTokenValue(refreshTokenValue)
				.orElseThrow(()-> new RuntimeException("DB에 없는 토큰입니다. (로그아웃됨)"));
		// 토큰 주인의 이메일 알아내기
		String email = foundToken.getUserEmail();
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
		// 새 토큰 발급 및 반환
		return jwtUtil.createAccessToken(user.getEmail(), user.getRoles());
		
		
	}
}

