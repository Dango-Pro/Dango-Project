package com.jpcard.controller;

import com.jpcard.controller.dto.AuthResponse;
import com.jpcard.controller.dto.LoginRequest;
import com.jpcard.controller.dto.SignupRequest;
import com.jpcard.domain.user.User;
import com.jpcard.service.AuthService;
import com.jpcard.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.jpcard.service.EmailService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthService authService;
	private final EmailService emailService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest req) {
        userService.signup(
            req.username(), req.password(), req.nickname(),
            req.name(), req.email(), req.phone(),
            req.birthdate(), req.gender(),
            req.agreedToTerms(), req.agreedToPrivacy()
        );
        return ResponseEntity.ok("ok");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        var tokens = authService.login(req.username(), req.password());
        return ResponseEntity.ok(
                new AuthResponse(tokens.get("accessToken"), tokens.get("refreshToken"))
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestParam String refreshToken) {
        String newAccess = authService.refresh(refreshToken);
        return ResponseEntity.ok(Map.of("accessToken", newAccess));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(Authentication auth) {
        User user = (User) auth.getPrincipal();
        authService.logout(user.getId());
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("logout");
    }
	
	@PostMapping("/email-code")
	public ResponseEntity<?> sendVerificationCode(@RequestBody Map<String, String> request) {
		String email = request.get("email");
		if (email == null || email.isBlank()) {
			return ResponseEntity.badRequest().body("이메일을 입력해주세요.");
		}
		
		String code = emailService.sendEmail(email);
		return ResponseEntity.ok("인증번호가 발송되었습니다: " + code);
	}
}

