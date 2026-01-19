package com.jpcard.repository;

import com.jpcard.domain.post.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> search(@Param("keyword") String keyword);

    List<Post> findByIsNoticeTrueOrderByIdDesc();
}
