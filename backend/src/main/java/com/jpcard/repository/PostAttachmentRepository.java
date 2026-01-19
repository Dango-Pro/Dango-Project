package com.jpcard.repository;

import com.jpcard.domain.post.PostAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostAttachmentRepository extends JpaRepository<PostAttachment, Long> {
}
