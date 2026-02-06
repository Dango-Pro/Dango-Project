package com.jpcard.controller.dto;

import com.jpcard.domain.post.PostCategory;
import com.jpcard.domain.post.RecruitmentStatus;
import com.jpcard.domain.post.StudyType;
import java.util.List;

public record PostResponse(
		Long id,
		Long authorId,       // ★ [추가] 작성자 본인 확인용
		String title,
		String content,
		int likeCount,
		String authorName,
		List<String> attachmentUrls,
		boolean isNotice,
		
		// ★ [추가] 스터디 모집 정보
		PostCategory category,
		RecruitmentStatus recruitmentStatus,
		StudyType studyType,
		String contactLink
) {}