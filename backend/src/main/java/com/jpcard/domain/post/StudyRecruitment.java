package com.jpcard.domain.post;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "study_recruitments")
@Getter @Setter
@NoArgsConstructor
public class StudyRecruitment {
	
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	// Post와 1:1 관계로 연결 (StudyRecruitment가 외래키를 가짐)
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "post_id")
	private Post post;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private RecruitmentStatus recruitmentStatus = RecruitmentStatus.OPEN;
	
	@Enumerated(EnumType.STRING)
	private StudyType studyType;
	
	private String contactLink;
	
	// 생성자
	public StudyRecruitment(Post post, StudyType studyType, String contactLink) {
		this.post = post;
		this.studyType = studyType;
		this.contactLink = contactLink;
		this.recruitmentStatus = RecruitmentStatus.OPEN;
	}
	
	// ★ [추가] 이 메서드가 없어서 빨간 줄이 떴던 겁니다!
	public void updateStatus(RecruitmentStatus status) {
		this.recruitmentStatus = status;
	}
}