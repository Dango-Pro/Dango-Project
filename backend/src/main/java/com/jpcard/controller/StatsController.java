package com.jpcard.controller;

import com.jpcard.controller.dto.DashboardStatsResponse;
import com.jpcard.domain.user.User;
import com.jpcard.service.StatsService;
import com.jpcard.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;
    private final UserService userService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();

        User user;
        Object principal = authentication.getPrincipal();

        if (principal instanceof User) {
            user = (User) principal;
        } else {
            user = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new java.util.NoSuchElementException("User not found"));
        }

        return ResponseEntity.ok(statsService.getDashboardStats(user.getId()));
    }
}
