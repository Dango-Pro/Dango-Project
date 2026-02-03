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
                new UserInfoResponse(user.getId(), user.getUsername(), user.getNickname(), roles, user.getDailyLimit(), user.getReviewLimit(), user.getTimezone())
        );
    }

    @PatchMapping("/me")
    public ResponseEntity<?> updateMe(@RequestBody UserSettingsRequest request, Authentication auth) {
        User principal = getUser(auth);
        if (principal == null) return ResponseEntity.status(401).build();

        // Fix potential uninitialized reviewLimit if older client doesn't send it?
        // Assuming request body validation or default handling.
        // For int, it defaults to 0 if missing in JSON?
        // If 0, we might want to keep existing or default. But primitives in record are tricky.
        // Let's trust the request or adding @JsonIgnoreProperties(ignoreUnknown = true) if needed.
        // Or if reviewLimit is 0, set to default 200?
        // For now, straightforward mapping.

        int reviewLimit = request.reviewLimit() > 0 ? request.reviewLimit() : 200;

        User updated = userService.updateSettings(principal.getId(), request.nickname(), request.dailyLimit(), reviewLimit, request.timezone());

        return ResponseEntity.ok().build();
    }

    private User getUser(Authentication authentication) {
        if (authentication == null) return null;
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        if (principal instanceof String && !"anonymousUser".equals(principal)) {
             return userService.findByUsername((String) principal).orElse(null);
        }
        return null;
    }
}
