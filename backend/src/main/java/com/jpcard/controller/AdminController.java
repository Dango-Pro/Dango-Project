package com.jpcard.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin", description = "관리자 전용 API (권한 테스트용)")
@RestController
@RequestMapping("/api/admin")
public class AdminController {
	@Operation(summary = "관리자 권한 테스트", description = "ROLE_ADMIN 권한을 가진 사람만 호출가능")
	@GetMapping("/test")
	public ResponseEntity<String> adminTest() {
		return ResponseEntity.ok("당신은 관리자가 맞습니다 (접근성공)");
	}
}
