package com.jpcard.repository;

import com.jpcard.domain.auth.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
	// 토큰 값으로 DB에서 찾기
	Optional<RefreshToken> findByTokenValue(String tokenValue);
	
	void deleteByUserEmail(String userEmail);
}
