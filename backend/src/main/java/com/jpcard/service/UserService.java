package com.jpcard.service;

import com.jpcard.domain.user.Role;
import com.jpcard.domain.user.User;
import com.jpcard.domain.user.UserStatus;
import com.jpcard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {
	
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	
	// ==================== 일반 유저 기능 ====================
	
	@Transactional
	public User signup(String username, String rawPassword, String nickname) {
		userRepository.findByUsername(username)
				.ifPresent(u -> {
					throw new IllegalArgumentException("이미 존재하는 사용자");
				});
		
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
	
	// 유저 설정 업데이트 (일일 학습량, 리뷰 제한 등)
	// UserController에서 dailyLimit도 보내는 경우를 대비해 파라미터 확인 필요
	// 현재 코드 기준으로는 reviewLimit과 timezone만 수정
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
	
	// ==================== 관리자(Admin) 전용 기능 ====================
	
	// 1. 전체 유저 조회 (페이징)
	@Transactional(readOnly = true)
	public Page<User> findAll(Pageable pageable) {
		return userRepository.findAll(pageable);
	}
	
	// 2. 관리자용 유저 생성
	@Transactional
	public User adminCreateUser(String username, String rawPassword, UserStatus status, Set<Role> roles) {
		if (userRepository.findByUsername(username).isPresent()) {
			throw new IllegalArgumentException("User exists");
		}
		User user = new User();
		user.setUsername(username);
		user.setPassword(passwordEncoder.encode(rawPassword));
		user.setStatus(status);
		user.setRoles(roles);
		return userRepository.save(user);
	}
	
	// 3. 관리자용 유저 수정
	@Transactional
	public User adminUpdateUser(Long id, String username, String rawPassword, UserStatus status, Set<Role> roles) {
		User user = findById(id)
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
		
		// 아이디 변경 시 중복 체크
		if (username != null && !username.isBlank() && !username.equals(user.getUsername())) {
			if (userRepository.findByUsername(username).isPresent()) {
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
		return user; // Dirty Checking으로 자동 저장되지만 명시적으로 리턴
	}
	
	// 4. 관리자용 유저 삭제
	@Transactional
	public void adminDeleteUser(Long id) {
		if (!userRepository.existsById(id)) {
			throw new IllegalArgumentException("User not found");
		}
		userRepository.deleteById(id);
	}
}