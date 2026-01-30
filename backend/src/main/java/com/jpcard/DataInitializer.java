package com.jpcard;

import com.jpcard.domain.user.User;
import com.jpcard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
	
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	
	@Override
	public void run(String... args) throws Exception {
		// 1. 관리자 계정이 있는지 '이메일'로 확인 (username 아님)
		if (userRepository.findByEmail("manager@dango.com").isEmpty()) {
			
			// 2. 없으면 생성 (생성자 사용: 이메일, 비번, 닉네임, 권한)
			User manager = new User(
					"manager@dango.com",           // email
					passwordEncoder.encode("1234"), // password
					"관리자",                       // nickname
					"ROLE_MANAGER"                 // role (String)
			);
			
			userRepository.save(manager);
			System.out.println("초기 관리자 계정 생성 완료: manager@dango.com / 1234");
		}
	}
}