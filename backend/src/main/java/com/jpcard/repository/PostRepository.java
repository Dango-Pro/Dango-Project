package com.jpcard.repository;

import com.jpcard.domain.post.Post;
import org.springframework.data.domain.Page; // ★ 추가
import org.springframework.data.domain.Pageable; // ★ 추가
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
	
	// ★ 반환 타입 List -> Page로 변경, Pageable 파라미터 추가
	@Query("SELECT p FROM Post p WHERE :keyword IS NULL OR LOWER(p.title) LIKE :keyword OR p.content LIKE :keyword")
	Page<Post> search(@Param("keyword") String keyword, Pageable pageable);
	
	List<Post> findByIsNoticeTrueOrderByIdDesc();
}