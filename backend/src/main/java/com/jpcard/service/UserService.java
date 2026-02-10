package com.jpcard.service;

import com.jpcard.util.BadWordUtil;

import com.jpcard.domain.user.Role;
import com.jpcard.domain.user.User;
import com.jpcard.repository.UserRepository;
import com.jpcard.util.JwtUtil;
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
	private final JwtUtil jwtUtil;

    @Transactional
    public User signup(String username, String rawPassword, String nickname, 
                       String name, String email, String phone, 
                       java.time.LocalDate birthdate, String gender, 
                       boolean agreedToTerms, boolean agreedToPrivacy) {

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
        user.setName(name);
        user.setEmail(email);
        user.setPhone(phone);
        user.setBirthdate(birthdate);
        user.setGender(gender);
        user.setAgreedToTerms(agreedToTerms);
        user.setAgreedToPrivacy(agreedToPrivacy);
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
    public User updateSettings(Long userId, String nickname, int dailyLimit, int reviewLimit, String timezone,
                               String name, String email, String phone, java.time.LocalDate birthdate, String gender) {
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

        if (timezone != null) user.setTimezone(timezone);
        if (name != null) user.setName(name);
        if (email != null) user.setEmail(email);
        if (phone != null) user.setPhone(phone);
        if (birthdate != null) user.setBirthdate(birthdate);
        if (gender != null) user.setGender(gender);

        return user;
    }
	
	public Page<User> findAll(Pageable pageable) {
		return userRepository.findAll(pageable);
	}
	
	@Transactional
	public User adminCreateUser(String nickname, String password, UserStatus status, Set<Role> roles) {
		// 이메일(username)은 닉네임 기반 임시 생성 (혹은 파라미터로 받아야 함. 여기선 임시 처리)
		String tempUsername = nickname + "_" + System.currentTimeMillis() + "@admin-created.com";
		
		User user = new User();
		user.setUsername(tempUsername);
		user.setNickname(nickname);
		user.setPassword(passwordEncoder.encode(password));
		user.setStatus(status);
		user.setRoles(roles); // Role 설정
		
		return userRepository.save(user);
	}
	
	@Transactional
	public User adminUpdateUser(Long userId, String nickname, String password, UserStatus status, Set<Role> roles) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new RuntimeException("User not found"));
		
		user.setNickname(nickname);
		user.setStatus(status);
		user.setRoles(roles);
		
		// 비밀번호가 입력되었을 때만 변경
		if (password != null && !password.isBlank()) {
			user.setPassword(passwordEncoder.encode(password));
		}
		
		return user; // Dirty Checking으로 자동 저장됨
	}
	
	@Transactional
	public void adminDeleteUser(Long userId) {
		userRepository.deleteById(userId);
	}
}
