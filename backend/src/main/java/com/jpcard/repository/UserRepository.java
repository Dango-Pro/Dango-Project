package com.jpcard.repository;

import com.jpcard.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
	Optional<User> findByEmail(String email);

	@Query("SELECT u FROM User u WHERE u.email = :username")
	Optional<User> findByUsername(@Param("username") String username);

	boolean existsByEmail(String email);

	boolean existsByNickname(String nickname);

	Page<User> findAll(Pageable pageable);
}