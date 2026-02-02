package com.jpcard;

import com.jpcard.domain.user.Role;
import com.jpcard.domain.user.User;
import com.jpcard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
	
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	
	@Override
	public void run(String... args) throws Exception {
		if (!userRepository.existsByUsername("admin@dango.com")) {
			
			User admin = new User();
			
			admin.setUsername("admin@dango.com");
			
			admin.setPassword(passwordEncoder.encode("admin1234"));
			
			
			// 권한 설정 (Set<Role>)
			admin.setRoles(Collections.singleton(Role.ROLE_ADMIN));
			

			admin.setDailyLimit(100);
			admin.setTimezone("UTC");
			
			userRepository.save(admin);
			
			System.out.println("=========================");
			System.out.println("✅ 관리자 계정 자동 생성 완료");
			System.out.println("ID: admin@dango.com");
			System.out.println("PW: admin1234");
			System.out.println("=========================");
		}
	}
}