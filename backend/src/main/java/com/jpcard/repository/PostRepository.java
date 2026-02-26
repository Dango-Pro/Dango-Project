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

	@Query("SELECT p FROM Post p WHERE " +
			"(:keyword IS NULL OR :keyword = '' OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR p.content LIKE CONCAT('%', :keyword, '%')) " +
			"AND (:category IS NULL OR p.category = :category) " +
			"AND (:authorId IS NULL OR p.author.id = :authorId)")
	Page<Post> searchWithAuthor(
			@Param("keyword") String keyword,
			@Param("category") PostCategory category,
			@Param("authorId") Long authorId,
			Pageable pageable);
}