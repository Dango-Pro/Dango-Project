package com.jpcard.controller;

import com.jpcard.controller.dto.UserInfoResponse;
import com.jpcard.controller.dto.UserUpdateRequest;
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
                new UserInfoResponse(
                    user.getId(), user.getUsername(), user.getNickname(),
                    user.getName(), user.getEmail(), user.getPhone(),
                    user.getBirthdate() != null ? java.time.LocalDate.parse(user.getBirthdate()) : null, 
                    user.getGender(),
                    roles, user.getDailyLimit(), user.getReviewLimit(), user.getTimezone(),
                    user.getProfileImageUrl()
                )
        );
    }

    @PatchMapping("/me")
    public ResponseEntity<?> updateMe(@RequestBody UserUpdateRequest request, Authentication auth) {
        User principal = getUser(auth);
        if (principal == null) return ResponseEntity.status(401).build();

        userService.updateSettings(principal.getId(), request);

        if (request.profileImageUrl() != null) {
            userService.updateProfileImage(principal.getId(), request.profileImageUrl());
        }

        return ResponseEntity.ok().build();
    }

    @PostMapping("/me/profile-image")
    public ResponseEntity<?> uploadProfileImage(@RequestParam("file") org.springframework.web.multipart.MultipartFile file, Authentication auth) {
        User principal = getUser(auth);
        if (principal == null) return ResponseEntity.status(401).build();

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        try {
            String uploadDir = "uploads/";
            java.io.File directory = new java.io.File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String fileName = java.util.UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            java.nio.file.Path filePath = java.nio.file.Paths.get(uploadDir + fileName);
            java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/" + fileName;
            userService.updateProfileImage(principal.getId(), fileUrl);

            return ResponseEntity.ok(java.util.Map.of("profileImageUrl", fileUrl));
        } catch (java.io.IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to upload file");
        }
    }

    private User getUser(Authentication authentication) {
        if (authentication == null) return null;
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        if (principal instanceof String && !"anonymousUser".equals(principal)) {
             return userService.findByEmail((String) principal).orElse(null);
        }
        return null;
    }
}
