package com.jpcard.service;

import com.jpcard.controller.dto.UserUpdateRequest;
import com.jpcard.domain.user.*;
import com.jpcard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	@Transactional(readOnly = true)
	public Page<User> findAll(Pageable pageable) {
		return userRepository.findAll(pageable);
	}

	@Transactional(readOnly = true)
	public Optional<User> findById(Long id) {
		return userRepository.findById(id);
	}

	@Transactional(readOnly = true)
	public Optional<User> findByEmail(String email) {
		return userRepository.findByEmail(email);
	}

	@Transactional(readOnly = true)
	public Optional<User> findByUsername(String username) {
		return userRepository.findByEmail(username);
	}

	@Transactional
	public User adminCreateUser(String email, String password, UserStatus status, String role) {
		User user = new User(email, passwordEncoder.encode(password), email.split("@")[0], role);
		if (status != null)
			user.updateStatus(status);
		return userRepository.save(user);
	}

	@Transactional
	public User adminUpdateUser(Long id, String email, String password, UserStatus status, String role) {
		User user = userRepository.findById(id).orElseThrow();
		if (email != null)
			user.setEmail(email);
		if (password != null && !password.isBlank())
			user.setPassword(passwordEncoder.encode(password));
		if (status != null)
			user.updateStatus(status);
		if (role != null)
			user.setRole(role);
		return user;
	}

	@Transactional
	public void adminDeleteUser(Long id) {
		userRepository.deleteById(id);
	}

	@Transactional
	public User updateSettings(Long userId, UserUpdateRequest request) {
		User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
		if (request.dailyLimit() != null && request.dailyLimit() > 0) user.setDailyLimit(request.dailyLimit());
		if (request.reviewLimit() != null && request.reviewLimit() > 0) user.setReviewLimit(request.reviewLimit());
		if (request.timezone() != null && !request.timezone().isBlank()) user.setTimezone(request.timezone());
		
		if (request.name() != null) user.setName(request.name());
		if (request.phone() != null) user.setPhone(request.phone());
		if (request.birthdate() != null) user.setBirthdate(request.birthdate().toString());
		if (request.gender() != null) user.setGender(request.gender());
		
		return user;
	}

	@Transactional
	public void updateProfileImage(Long userId, String profileImageUrl) {
		User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
		user.setProfileImageUrl(profileImageUrl);
	}
}
