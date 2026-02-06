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
	
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "post_id")
	private Post post;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private RecruitmentStatus recruitmentStatus = RecruitmentStatus.RECRUITING; // ★ OPEN -> RECRUITING
	
	@Enumerated(EnumType.STRING)
	private StudyType studyType;
	
	private String contactLink;
	
	public StudyRecruitment(Post post, StudyType studyType, String contactLink) {
		this.post = post;
		this.studyType = studyType;
		this.contactLink = contactLink;
		this.recruitmentStatus = RecruitmentStatus.RECRUITING; // ★ 초기값도 RECRUITING
	}
	
	// Lombok @Setter가 있으므로 setRecruitmentStatus() 메서드는 자동 생성됩니다.
	// 따로 updateStatus 메서드를 만들지 않아도 됩니다.
}