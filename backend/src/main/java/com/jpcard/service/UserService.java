package com.jpcard.service;

import com.jpcard.domain.user.Role;
import com.jpcard.domain.user.User;
import com.jpcard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User signup(String username, String rawPassword) {

        userRepository.findByUsername(username)
                .ifPresent(u -> {
                    throw new IllegalArgumentException("이미 존재하는 사용자");
                });

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.addRole(Role.ROLE_USER);

        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional(readOnly = true)
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional
    public User updateSettings(Long userId, int reviewLimit, String timezone) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setReviewLimit(reviewLimit);
        if (timezone != null) {
            user.setTimezone(timezone);
        }
        return user;
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<User> findAll(org.springframework.data.domain.Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Transactional
    public User adminCreateUser(String username, String rawPassword, com.jpcard.domain.user.UserStatus status,
            java.util.Set<Role> roles) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists");
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setStatus(status);
        user.setRoles(roles);
        return userRepository.save(user);
    }

    @Transactional
    public User adminUpdateUser(Long userId, String username, String rawPassword,
            com.jpcard.domain.user.UserStatus status, java.util.Set<Role> roles) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (username != null && !username.isBlank() && !username.equals(user.getUsername())) {
            if (userRepository.existsByUsername(username)) {
                throw new IllegalArgumentException("Username already exists");
            }
            user.setUsername(username);
        }
        if (rawPassword != null && !rawPassword.isBlank()) {
            user.setPassword(passwordEncoder.encode(rawPassword));
        }
        if (status != null) {
            user.setStatus(status);
        }
        if (roles != null && !roles.isEmpty()) {
            user.setRoles(roles);
        }
        return userRepository.save(user);
    }

    @Transactional
    public void adminDeleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }
        userRepository.deleteById(userId);
    }
}
