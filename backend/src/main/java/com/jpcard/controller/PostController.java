package com.jpcard.controller;

import com.jpcard.controller.dto.PostRequest;
import com.jpcard.controller.dto.PostResponse;
import com.jpcard.domain.post.Post;
import com.jpcard.domain.post.PostCategory;
import com.jpcard.domain.post.StudyApplication; // ★ 신청 엔티티 import
import com.jpcard.domain.post.StudyRecruitment;
import com.jpcard.domain.post.StudyType;
import com.jpcard.service.PostService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Validated
public class PostController {
	
	private final PostService postService;
	
	// 1. 게시글 목록 조회
	@GetMapping
	public ResponseEntity<List<PostResponse>> list(@RequestParam(required = false) String q, @RequestParam(required = false, defaultValue = "false") boolean notice) {
		List<Post> posts;
		if (notice) {
			posts = postService.findNotices();
		} else {
			posts = postService.search(q);
		}
		
		List<PostResponse> responses = posts.stream()
				.map(this::mapToResponse)
				.collect(Collectors.toList());
		return ResponseEntity.ok(responses);
	}
	
	// 2. 게시글 상세 조회
	@GetMapping("/{id}")
	public ResponseEntity<PostResponse> get(@PathVariable Long id) {
		var post = postService.findById(id);
		return ResponseEntity.ok(mapToResponse(post));
	}
	
	// 3. 게시글 생성 (카테고리, 스터디정보 포함)
	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<PostResponse> create(
			@RequestParam("title") @NotBlank @Size(max=255) String title,
			@RequestParam("content") @NotBlank String content,
			@RequestParam(value = "isNotice", required = false, defaultValue = "false") boolean isNotice,
			@RequestParam(value = "files", required = false) List<MultipartFile> files,
			
			// 추가된 파라미터들
			@RequestParam("category") PostCategory category,
			@RequestParam(value = "studyType", required = false) StudyType studyType,
			@RequestParam(value = "contactLink", required = false) String contactLink,
			
			HttpServletRequest httpRequest) {
		
		com.jpcard.domain.user.User author = null;
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof com.jpcard.domain.user.User) {
			author = (com.jpcard.domain.user.User) authentication.getPrincipal();
		}
		
		String authorName = determineAuthorName(httpRequest);
		String ipAddress = httpRequest.getRemoteAddr();
		
		// Service 호출
		var post = postService.create(title, content, isNotice, authorName, ipAddress, files, author, category, studyType, contactLink);
		return ResponseEntity.ok(mapToResponse(post));
	}
	
	// 4. 게시글 수정
	@PutMapping("/{id}")
	public ResponseEntity<PostResponse> update(@PathVariable Long id, @Valid @RequestBody PostRequest request) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		com.jpcard.domain.user.User user = (auth != null && auth.getPrincipal() instanceof com.jpcard.domain.user.User)
				? (com.jpcard.domain.user.User) auth.getPrincipal() : null;
		
		var post = postService.update(id, request.title(), request.content(), request.isNotice(), user);
		return ResponseEntity.ok(mapToResponse(post));
	}
	
	// 5. 게시글 삭제
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		com.jpcard.domain.user.User user = (auth != null && auth.getPrincipal() instanceof com.jpcard.domain.user.User)
				? (com.jpcard.domain.user.User) auth.getPrincipal() : null;
		
		postService.delete(id, user);
		return ResponseEntity.noContent().build();
	}
	
	// 6. 좋아요
	@PostMapping("/{id}/like")
	public ResponseEntity<PostResponse> like(@PathVariable Long id) {
		var post = postService.likePost(id);
		return ResponseEntity.ok(mapToResponse(post));
	}
	
	// --- ★ [신규 기능] 스터디 신청 관련 API ---
	
	// 7. 스터디 신청하기 (메시지 + 연락처)
	@PostMapping("/{id}/apply")
	public ResponseEntity<Void> applyStudy(
			@PathVariable Long id,
			@RequestBody java.util.Map<String, String> body) {
		
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		com.jpcard.domain.user.User user = (com.jpcard.domain.user.User) auth.getPrincipal();
		
		String message = body.get("message");
		String contactInfo = body.get("contactInfo"); // 연락처 정보
		
		postService.applyStudy(id, user, message, contactInfo);
		
		return ResponseEntity.ok().build();
	}
	
	// 8. 신청자 목록 조회 (작성자 전용)
	@GetMapping("/{id}/applications")
	public ResponseEntity<List<java.util.Map<String, Object>>> getApplications(@PathVariable Long id) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		com.jpcard.domain.user.User user = (com.jpcard.domain.user.User) auth.getPrincipal();
		
		List<StudyApplication> applications = postService.getApplications(id, user);
		
		List<java.util.Map<String, Object>> result = applications.stream().map(app -> {
			java.util.Map<String, Object> map = new java.util.HashMap<>();
			map.put("applicantName", app.getApplicant().getUsername());
			map.put("message", app.getMessage());
			map.put("contactInfo", app.getContactInfo());
			map.put("appliedAt", app.getAppliedAt());
			return map;
		}).collect(Collectors.toList());
		
		return ResponseEntity.ok(result);
	}
	
	// 9. 내가 신청했는지 여부 확인
	@GetMapping("/{id}/applied")
	public ResponseEntity<Boolean> checkApplied(@PathVariable Long id) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
			return ResponseEntity.ok(false);
		}
		com.jpcard.domain.user.User user = (com.jpcard.domain.user.User) auth.getPrincipal();
		return ResponseEntity.ok(postService.hasApplied(id, user));
	}
	
	// --- 유틸리티 메서드 ---
	
	// 응답 변환 로직 (작성자 ID 포함)
	private PostResponse mapToResponse(Post post) {
		List<String> attachmentUrls = post.getAttachments() == null ? java.util.Collections.emptyList() :
				post.getAttachments().stream()
						.map(a -> "/uploads/" + a.getStoreFilename())
						.collect(Collectors.toList());
		
		StudyRecruitment study = post.getStudyRecruitment();
		
		return new PostResponse(
				post.getId(),
				// 작성자 ID (본인 확인용, null 안전하게 처리)
				post.getAuthor() != null ? post.getAuthor().getId() : null,
				post.getTitle(),
				post.getContent(),
				post.getLikeCount(),
				post.getAuthorName() != null ? post.getAuthorName() : "익명",
				attachmentUrls,
				post.isNotice(),
				post.getCategory(),
				study != null ? study.getRecruitmentStatus() : null,
				study != null ? study.getStudyType() : null,
				study != null ? study.getContactLink() : null
		);
	}
	
	private String determineAuthorName(HttpServletRequest request) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
			Object principal = authentication.getPrincipal();
			if (principal instanceof com.jpcard.domain.user.User) {
				return ((com.jpcard.domain.user.User) principal).getUsername();
			}
			return authentication.getName();
		}
		
		String ip = request.getRemoteAddr();
		return maskIpAddress(ip);
	}
	
	private String maskIpAddress(String ip) {
		if (ip == null) return "Unknown";
		String[] parts = ip.split("\\.");
		if (parts.length == 4) {
			return parts[0] + "." + parts[1] + ".***.***";
		}
		return "Anonymous";
	}
}