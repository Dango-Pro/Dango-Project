package com.jpcard.controller;

import com.jpcard.controller.dto.AuthResponse;
import com.jpcard.controller.dto.LoginRequest;
import com.jpcard.controller.dto.SignupRequest;
import com.jpcard.domain.user.User;
import com.jpcard.service.AuthService;
import com.jpcard.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
	
	private final UserService userService;
	private final AuthService authService;
	
	@PostMapping("/signup")
	public ResponseEntity<?> signup(@RequestBody SignupRequest req) {
		// DTO에 email, password, nickname, role이 있다고 가정
		userService.signup(req.email(), req.password(), req.nickname());
		return ResponseEntity.ok("회원가입 성공");
	}
	
	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
		// username -> email로 변경
		var tokens = authService.login(req.email(), req.password());
		return ResponseEntity.ok(
				new AuthResponse(tokens.get("accessToken"), tokens.get("refreshToken"))
		);
	}
	
	// ★ 중복 제거하고 헤더 방식 하나만 남김
	@PostMapping("/refresh")
	public ResponseEntity<String> refresh(@RequestHeader("RefreshToken") String refreshToken) {
		String newAccessToken = authService.reissueAccessToken(refreshToken);
		return ResponseEntity.ok(newAccessToken);
	}
	
	@PostMapping("/logout")
	public ResponseEntity<?> logout(@AuthenticationPrincipal User user) {
		// User 객체에서 이메일 꺼내서 로그아웃 처리
		authService.logout(user.getEmail());
		return ResponseEntity.ok("로그아웃 성공");
	}
}
