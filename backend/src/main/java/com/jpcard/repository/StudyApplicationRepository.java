package com.jpcard.repository;

import com.jpcard.domain.post.StudyApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StudyApplicationRepository extends JpaRepository<StudyApplication, Long> {
	// 1. 특정 게시글의 신청자 목록 가져오기
	List<StudyApplication> findByPostId(Long postId);
	
	// 2. 이미 신청했는지 확인하기 (중복 신청 방지용)
	Optional<StudyApplication> findByPostIdAndApplicantId(Long postId, Long applicantId);
}