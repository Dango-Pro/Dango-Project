package com.jpcard.domain.post;

import com.jpcard.domain.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "posts")
@Getter @Setter
public class Post {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false)
	private String title;
	
	@Lob
	@Column(nullable = false, columnDefinition = "TEXT")
	private String content;
	
	// 카테고리 (기본값: FREE)
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private PostCategory category = PostCategory.FREE;
	
	// 스터디 모집 정보 (1:1 관계, Post가 주인이 아님)
	@OneToOne(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
	private StudyRecruitment studyRecruitment;
	
	// ★ [추가됨] 신청서 목록 (게시글 삭제 시 신청서들도 자동 삭제)
	@OneToMany(mappedBy = "post", cascade = CascadeType.REMOVE, orphanRemoval = true)
	private List<StudyApplication> applications = new ArrayList<>();
	
	@Column(nullable = false)
	private int likeCount = 0;
	
	@Column(nullable = false)
	private int viewCount = 0;
	
	@Column
	private LocalDateTime createdAt;
	
	@Column
	private String authorName;
	
	@Column
	private String ipAddress;
	
	@Column(nullable = false)
	private boolean isNotice = false;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private User author;
	
	// 첨부파일 (회원님의 기존 방식 유지)
	@OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<PostAttachment> attachments = new ArrayList<>();
	
	// 연관관계 편의 메서드 (스터디 정보 저장 시 사용)
	public void setStudyRecruitment(StudyRecruitment studyRecruitment) {
		this.studyRecruitment = studyRecruitment;
		if (studyRecruitment != null) {
			studyRecruitment.setPost(this);
		}
	}
}