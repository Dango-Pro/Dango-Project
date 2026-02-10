package com.jpcard.domain.post;

import com.jpcard.domain.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "study_applications")
@Getter @Setter
@NoArgsConstructor
public class StudyApplication {
	
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	// 어떤 게시글에 신청했는지
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "post_id")
	private Post post;
	
	// 누가 신청했는지
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "applicant_id")
	private User applicant;
	
	private String message;     // 신청 메시지 (예: 열심히 하겠습니다!)
	private String contactInfo; // 연락처 (예: 카톡 ID)
	
	private LocalDateTime appliedAt = LocalDateTime.now(); // 신청 시간
	
	public StudyApplication(Post post, User applicant, String message, String contactInfo) {
		this.post = post;
		this.applicant = applicant;
		this.message = message;
		this.contactInfo = contactInfo;
	}
}