package com.jpcard.controller;

import com.jpcard.controller.dto.UserInfoResponse;
import com.jpcard.controller.dto.UserSettingsRequest;
import com.jpcard.domain.user.User;
import com.jpcard.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
	
	private final UserService userService;
	
	@GetMapping("/me")
	public ResponseEntity<?> me(Authentication auth) {
		
		if (auth == null) {
			return ResponseEntity.status(401).body("Invalid authentication principal");
		}
		
		// 1. 현재 로그인한 유저 정보 가져오기 (이메일 기준)
		User user = userService.findByEmail(auth.getName())
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
		
		// 2. 권한 처리 (단일 String -> Set으로 변환)
		Set<String> roles = Collections.singleton(user.getRole());
		
		// 3. 응답 반환
		// getUsername() 대신 getNickname() (화면 표시용 이름)
		return ResponseEntity.ok(
				new UserInfoResponse(
						user.getId(),
						user.getNickname(),
						roles,
						user.getDailyLimit()
				)
		);
	}
	
	@PatchMapping("/me")
	public ResponseEntity<?> updateMe(@RequestBody UserSettingsRequest request, Authentication auth) {
		if (auth == null) return ResponseEntity.status(401).build();
		
		// 현재 유저 찾기
		User user = userService.findByEmail(auth.getName())
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
		
		userService.updateStudySettings(user.getId(), request.dailyLimit());
		
		return ResponseEntity.ok().build();
	}
}