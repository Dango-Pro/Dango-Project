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
import java.util.stream.Collectors;

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

        // Fetch fresh from DB to be sure about settings
        User principal = (User) auth.getPrincipal();
        User user = userService.findById(principal.getId()).orElseThrow();

        Set<String> roles = (user.getRoles() != null)
                ? user.getRoles().stream().map(Enum::name).collect(Collectors.toSet())
                : Collections.emptySet();

        return ResponseEntity.ok(
                new UserInfoResponse(user.getId(), user.getUsername(), roles, user.getDailyLimit())
        );
    }

    @PatchMapping("/me")
    public ResponseEntity<?> updateMe(@RequestBody UserSettingsRequest request, Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        User principal = (User) auth.getPrincipal();

        User updated = userService.updateSettings(principal.getId(), request.dailyLimit());

        return ResponseEntity.ok().build();
    }
}
