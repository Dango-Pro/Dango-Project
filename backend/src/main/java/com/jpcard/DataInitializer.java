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
		// 관리자 계정 있는지 확인
		if (!userRepository.existsByEmail("admin@dango.com")) {
			
			// 관리자 계정 생성
			User admin = new User(
					"admin@dango.com",
					passwordEncoder.encode("admin1234"),
					"시스템관리자",
					"ROLE_ADMIN"
			);
			
			// DB에 저장
			userRepository.save(admin);
			
			System.out.println("=========================");
			System.out.println("관리자 계정 생성");
			System.out.println("ID: admin@dango.com");
			System.out.println("PW: admin1234");
			System.out.println("=========================");
		}
	}
	
}