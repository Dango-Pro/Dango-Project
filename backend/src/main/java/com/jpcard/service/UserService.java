package com.jpcard.service;

import com.jpcard.util.BadWordUtil;

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
    public User signup(String username, String rawPassword, String nickname) {

        userRepository.findByUsername(username)
                .ifPresent(u -> { throw new IllegalArgumentException("이미 존재하는 사용자"); });

        if (nickname == null || nickname.trim().isEmpty()) {
            throw new IllegalArgumentException("닉네임은 필수입니다.");
        }

        if (BadWordUtil.containsBadWord(nickname)) {
            throw new IllegalArgumentException("비속어가 포함된 닉네임은 사용할 수 없습니다.");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setNickname(nickname);
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
    public User updateSettings(Long userId, String nickname, int dailyLimit, int reviewLimit, String timezone) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setDailyLimit(dailyLimit);
        user.setReviewLimit(reviewLimit);
        
        if (nickname != null && !nickname.isBlank()) {
             if (BadWordUtil.containsBadWord(nickname)) {
                throw new IllegalArgumentException("비속어가 포함된 닉네임은 사용할 수 없습니다.");
            }
            user.setNickname(nickname);
        }

        if (timezone != null) {
            user.setTimezone(timezone);
        }
        return user;
    }
}
