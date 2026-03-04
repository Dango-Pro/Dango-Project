package com.jpcard.controller;

import com.jpcard.controller.dto.ApplyRequest;
import com.jpcard.controller.dto.PostRequest;
import com.jpcard.controller.dto.PostResponse;
import com.jpcard.controller.dto.RecruitmentUpdateRequest;
import com.jpcard.controller.dto.StudyApplicationResponse;
import com.jpcard.domain.post.*;
import com.jpcard.domain.user.User;
import com.jpcard.service.PostService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Validated
public class PostController {

	private final PostService postService;

	// 1. 목록 조회 (페이징 적용, 카테고리 필터, 내가 쓴 글)
	@GetMapping
	public ResponseEntity<Page<PostResponse>> list(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) PostCategory category,
			@RequestParam(required = false, defaultValue = "false") boolean myPosts,
			@PageableDefault(size = 10) Pageable pageable) {

		Long authorId = null;
		if (myPosts) {
			User user = getCurrentUser();
			if (user != null)
				authorId = user.getId();
		}
		Page<Post> posts = postService.search(q, category, authorId, pageable);
		return ResponseEntity.ok(posts.map(this::mapToResponse));
	}

	// 2. 상세 조회 (첨부파일 lazy load를 위해 트랜잭션 유지)
	@GetMapping("/{id}")
	@Transactional(readOnly = true)
	public ResponseEntity<PostResponse> get(@PathVariable Long id) {
		return ResponseEntity.ok(mapToResponse(postService.findById(id)));
	}

	// 조회수 증가 (상세 진입 시 프론트에서 1회만 호출)
	@PostMapping("/{id}/view")
	public ResponseEntity<Void> incrementView(@PathVariable Long id) {
		postService.incrementViewCount(id);
		return ResponseEntity.noContent().build();
	}

	// 3. 게시글 생성 (파일 업로드 + 스터디 정보 포함)
	@PostMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<PostResponse> create(
			@RequestParam("title") @NotBlank @Size(max = 255) String title,
			@RequestParam("content") @NotBlank String content,
			@RequestParam(value = "isNotice", defaultValue = "false") boolean isNotice,
			@RequestParam("category") PostCategory category,
			@RequestParam(value = "studyType", required = false) StudyType studyType,
			@RequestParam(value = "contactLink", required = false) String contactLink,
			@RequestParam(value = "files", required = false) List<MultipartFile> files,
			HttpServletRequest httpRequest) {

		User author = null;
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null && auth.getPrincipal() instanceof User) {
			author = (User) auth.getPrincipal();
		}

		String authorName = determineAuthorName(httpRequest);
		String ipAddress = httpRequest.getRemoteAddr();

		Post post = postService.create(
				title, content, isNotice, authorName, ipAddress,
				files, author, category, studyType, contactLink);

		return ResponseEntity.ok(mapToResponse(post));
	}

	// 4. 게시글 수정
	@PutMapping("/{id}")
	public ResponseEntity<PostResponse> update(@PathVariable Long id, @RequestBody PostRequest request) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		User user = (auth != null && auth.getPrincipal() instanceof User) ? (User) auth.getPrincipal() : null;

		Post post = postService.update(id, request.title(), request.content(), request.isNotice(), user);
		return ResponseEntity.ok(mapToResponse(post));
	}

	// 5. 게시글 삭제
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		User user = (auth != null && auth.getPrincipal() instanceof User) ? (User) auth.getPrincipal() : null;
		postService.delete(id, user);
		return ResponseEntity.noContent().build();
	}

	// 6. 좋아요 (토글 방식 - 로그인 필수)
	@PostMapping("/{id}/like")
	public ResponseEntity<PostResponse> like(@PathVariable Long id) {
		User user = getCurrentUser();
		if (user == null)
			return ResponseEntity.status(401).build();
		return ResponseEntity.ok(mapToResponse(postService.likePost(id, user)));
	}

	// 7. 스터디 신청하기
	@PostMapping("/{id}/apply")
	public ResponseEntity<StudyApplicationResponse> apply(@PathVariable Long id, @RequestBody ApplyRequest request) {
		User user = getCurrentUser();
		postService.applyStudy(id, user, request.message(), request.contactInfo());
		return ResponseEntity.ok(postService.getMyApplication(id, user).orElseThrow());
	}

	// 8. 스터디 신청 취소
	@DeleteMapping("/{id}/apply")
	public ResponseEntity<Void> cancelApply(@PathVariable Long id) {
		User user = getCurrentUser();
		postService.cancelApplication(id, user);
		return ResponseEntity.noContent().build();
	}

	// 9. 모집 상태 변경 (모집중 / 모집완료)
	@PatchMapping("/{id}/recruitment")
	public ResponseEntity<PostResponse> updateRecruitment(@PathVariable Long id,
			@RequestBody RecruitmentUpdateRequest request) {
		User user = getCurrentUser();
		return ResponseEntity
				.ok(mapToResponse(postService.updateRecruitmentStatus(id, request.recruitmentStatus(), user)));
	}

	// 10. 신청자 목록 조회
	@GetMapping("/{id}/applicants")
	public ResponseEntity<List<StudyApplicationResponse>> getApplicants(@PathVariable Long id) {
		return ResponseEntity.ok(postService.getApplicants(id));
	}

	// 11. 내 신청 여부 조회 (신청 안 했으면 404)
	@GetMapping("/{id}/applicants/me")
	public ResponseEntity<StudyApplicationResponse> getMyApplication(@PathVariable Long id) {
		User user = getCurrentUser();
		return postService.getMyApplication(id, user)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	// --- 헬퍼 메서드 ---
	private User getCurrentUser() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		return (auth != null && auth.getPrincipal() instanceof User) ? (User) auth.getPrincipal() : null;
	}

	private PostResponse mapToResponse(Post post) {
		List<String> attachmentUrls = post.getAttachments() == null ? List.of()
				: post.getAttachments().stream()
						.map(a -> "/uploads/" + a.getStoreFilename())
						.collect(Collectors.toList());

		StudyRecruitment s = post.getStudyRecruitment();

		return new PostResponse(
				post.getId(),
				post.getAuthor() != null ? post.getAuthor().getId() : null,
				post.getTitle(),
				post.getContent(),
				post.getLikeCount(),
				post.getViewCount(),
				post.getAuthor() != null ? (post.getAuthor().getNickname() != null ? post.getAuthor().getNickname()
						: post.getAuthor().getEmail()) : post.getAuthorName(),
				attachmentUrls,
				post.isNotice(),
				post.getCategory(),
				s != null ? s.getRecruitmentStatus() : null,
				s != null ? s.getStudyType() : null,
				s != null ? s.getContactLink() : null,
				post.getCreatedAt() != null ? post.getCreatedAt().atZone(ZoneId.systemDefault()).toInstant() : null);
	}

	private String determineAuthorName(HttpServletRequest request) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof User) {
			User user = (User) auth.getPrincipal();
			return user.getNickname() != null ? user.getNickname() : user.getEmail();
		}
		return maskIpAddress(request.getRemoteAddr());
	}

	private String maskIpAddress(String ip) {
		if (ip == null)
			return "Unknown";
		String[] parts = ip.split("\\.");
		return parts.length == 4 ? parts[0] + "." + parts[1] + ".***.***" : "Anonymous";
	}
}