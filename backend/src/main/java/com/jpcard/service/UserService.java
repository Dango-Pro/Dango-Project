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
                .ifPresent(u -> { throw new IllegalArgumentException("이미 존재하는 사용자"); });

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
    public User updateSettings(Long userId, int dailyLimit) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setDailyLimit(dailyLimit);
        return user;
    }
}
