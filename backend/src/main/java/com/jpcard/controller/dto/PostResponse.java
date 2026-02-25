package com.jpcard.controller.dto;

import com.jpcard.domain.post.PostCategory;
import com.jpcard.domain.post.RecruitmentStatus;
import com.jpcard.domain.post.StudyType;
import java.time.Instant;
import java.util.List;

public record PostResponse(
		Long id,
		Long authorId,
		String title,
		String content,
		int likeCount,
		int viewCount,
		String authorName,
		List<String> attachmentUrls,
		boolean isNotice,
		PostCategory category,
		RecruitmentStatus recruitmentStatus,
		StudyType studyType,
		String contactLink,
		Instant createdAt
) {}