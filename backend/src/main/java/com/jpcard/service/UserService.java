package com.jpcard.service;

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
	public User signup(String email, String rawPassword, String nickname) {
		
		// 1. 이메일 중복 검사 (username -> email)
		userRepository.findByEmail(email)
				.ifPresent(u -> { throw new IllegalArgumentException("이미 존재하는 이메일입니다."); });
		
		// 2. 유저 생성 (생성자 사용: 이메일, 암호화된 비번, 닉네임, 권한)
		User user = new User(
				email,
				passwordEncoder.encode(rawPassword),
				nickname,
				"ROLE_USER" // 문자열로 권한 부여
		);
		
		return userRepository.save(user);
	}
	
	@Transactional(readOnly = true)
	public Optional<User> findByEmail(String email) {
		return userRepository.findByEmail(email);
	}
	
	@Transactional(readOnly = true)
	public Optional<User> findById(Long id) {
		return userRepository.findById(id);
	}
	
	@Transactional
	public void updateStudySettings(Long userId, int newLimit) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("유저가 없습니다."));
		user.updateDailyLimit(newLimit);
	}
}