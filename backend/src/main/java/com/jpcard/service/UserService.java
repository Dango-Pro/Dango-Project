package com.jpcard.service;

import com.jpcard.controller.dto.UserUpdateRequest;
import com.jpcard.domain.user.User;
import com.jpcard.domain.user.UserStatus;
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
	
//	@Transactional
//	public User signup(String email, String rawPassword, String nickname) {
//
//		// 1. 이메일 중복 검사 (username -> email)
//		userRepository.findByEmail(email)
//				.ifPresent(u -> { throw new IllegalArgumentException("이미 존재하는 이메일입니다."); });
//
//		// 2. 유저 생성 (생성자 사용: 이메일, 암호화된 비번, 닉네임, 권한)
//		User user = new User(
//				email,
//				passwordEncoder.encode(rawPassword),
//				nickname,
//				"ROLE_USER" // 문자열로 권한 부여
//		);
//
//		return userRepository.save(user);
//	}
	
	// 내 정보 조회
	@Transactional(readOnly = true)
	public User getMyProfile(String email) {
		return userRepository.findByEmail(email)
				.orElseThrow(() -> new IllegalArgumentException("유저가 없습니다."));
	}
	
	// 회원 탈퇴
	@Transactional
	public void withdraw(String email) {
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new IllegalArgumentException("유저가 없습니다."));
		
		// 진짜 삭제하지 않고, 상태만 'WITHDRAWN'으로 변경
		user.updateStatus(UserStatus.WITHDRAWN);
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
	
	@Transactional
	public void updateProfile(Long userId, UserUpdateRequest request) {
		User user = userRepository.findById(userId)
				.orElseThrow(()-> new IllegalArgumentException("유저 없음"));
		
		// 닉네임 변경 로직
		if(request.newNickname() != null && !request.newNickname().isBlank()) {
			// 존재하는 닉네임인지 확인
			if(!user.getNickname().equals(request.newNickname()) &&
				userRepository.existsByNickname(request.newNickname())) { // Repository에 existsByNickname 필요
				throw new IllegalArgumentException("이미 존재하는 닉네임입니다.");
			}
			user.setNickname(request.newNickname()); // User 엔티티에 Setter 혹은 update 메서드 필요
		}
		
		// 비밀번호 변경 로직
		if(request.newPassword() != null && !request.newPassword().isBlank()) {
			// 기존 비밀번호인가 확인
			if(!passwordEncoder.matches(request.currentPassword(),user.getPassword())) {
				throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
			}
			// 새 비밀번호 암호화 저장
			user.setPassword(passwordEncoder.encode(request.newPassword()));
		}
	}
}