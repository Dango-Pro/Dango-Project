package com.jpcard.repository;

import com.jpcard.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
	
	Optional<User> findByEmail(String email);
	
	// 회원가입 시 중복 체크용
	boolean existsByEmail(String email);
}