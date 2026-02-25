package com.jpcard.repository;

import com.jpcard.domain.post.Post;
import com.jpcard.domain.post.PostCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

	Page<Post> findByTitleContainingOrContentContaining(String title, String content, Pageable pageable);

	Page<Post> findByCategory(PostCategory category, Pageable pageable);

	Page<Post> findByCategoryAndTitleContainingOrContentContaining(PostCategory category, String title, String content, Pageable pageable);

	@Query("SELECT p FROM Post p WHERE :keyword IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR p.content LIKE CONCAT('%', :keyword, '%')")
	Page<Post> search(@Param("keyword") String keyword, Pageable pageable);

	List<Post> findByIsNoticeTrueOrderByIdDesc();
}