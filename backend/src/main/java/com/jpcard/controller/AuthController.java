package com.jpcard.controller;

import com.jpcard.controller.dto.AuthResponse;
import com.jpcard.controller.dto.LoginRequest;
import com.jpcard.controller.dto.SignupRequest;
import com.jpcard.domain.user.User;
import com.jpcard.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest req) {
        authService.signup(req.username(), req.password(), req.nicknameOrEmailPrefix());
        return ResponseEntity.ok("ok");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        var tokens = authService.login(req.email(), req.password());
        return ResponseEntity.ok(
                new AuthResponse(tokens.get("accessToken"), tokens.get("refreshToken"))
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestParam String refreshToken) {
        String newAccess = authService.reissueAccessToken(refreshToken);
        return ResponseEntity.ok(Map.of("accessToken", newAccess));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(Authentication auth) {
        User user = (User) auth.getPrincipal();
        authService.logout(user.getEmail());
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("logout");
    }
}

