package com.jpcard.controller.dto;

import com.jpcard.domain.post.*;
import java.util.List;

public record PostResponse(
		Long id,
		Long authorId, // ★ [추가] 작성자 ID (이게 있어야 본인 확인 가능)
		String title,
		String content,
		int likeCount,
		String authorName,
		List<String> attachmentUrls,
		boolean isNotice,
		
		PostCategory category,
		RecruitmentStatus recruitmentStatus,
		StudyType studyType,
		String contactLink
) {
	public static PostResponse from(Post post) {
		StudyRecruitment study = post.getStudyRecruitment();
		
		return new PostResponse(
				post.getId(),
				// ★ [추가] 작성자가 있으면 ID 반환, 없으면(탈퇴/익명) null
				post.getAuthor() != null ? post.getAuthor().getId() : null,
				post.getTitle(),
				post.getContent(),
				post.getLikeCount(),
				post.getAuthorName() != null ? post.getAuthorName() : "익명",
				post.getAttachments().stream().map(a -> "/uploads/" + a.getStoreFilename()).toList(),
				post.isNotice(),
				post.getCategory(),
				study != null ? study.getRecruitmentStatus() : null,
				study != null ? study.getStudyType() : null,
				study != null ? study.getContactLink() : null
		);
	}
}