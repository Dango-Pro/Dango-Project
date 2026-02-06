package com.jpcard.controller;

import com.jpcard.controller.dto.PostRequest;
import com.jpcard.controller.dto.PostResponse;
import com.jpcard.service.PostService;
import com.jpcard.domain.post.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {
	
	private final PostService postService;
	
	@GetMapping
	public ResponseEntity<Page<PostResponse>> list(
			@RequestParam(required = false) String q,
			@RequestParam(required = false, defaultValue = "false") boolean notice,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		
		if (notice) {
			List<Post> posts = postService.findNotices();
			return ResponseEntity.ok(new PageImpl<>(posts).map(this::mapToResponse));
		}
		return ResponseEntity.ok(postService.search(q, PageRequest.of(page, size, Sort.by("id").descending()))
				.map(this::mapToResponse));
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<PostResponse> get(@PathVariable Long id) {
		return ResponseEntity.ok(mapToResponse(postService.findById(id)));
	}
	
	@PostMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<PostResponse> create(
			@RequestParam("title") String title,
			@RequestParam("content") String content,
			@RequestParam(value = "isNotice", defaultValue = "false") boolean isNotice,
			@RequestParam(value = "files", required = false) List<MultipartFile> files,
			@RequestParam("category") PostCategory category,
			@RequestParam(value = "studyType", required = false) StudyType studyType,
			@RequestParam(value = "contactLink", required = false) String contactLink,
			HttpServletRequest req) {
		
		com.jpcard.domain.user.User author = null;
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null && auth.getPrincipal() instanceof com.jpcard.domain.user.User) {
			author = (com.jpcard.domain.user.User) auth.getPrincipal();
		}
		
		var post = postService.create(title, content, isNotice, author != null ? author.getUsername() : "익명", req.getRemoteAddr(), files, author, category, studyType, contactLink);
		return ResponseEntity.ok(mapToResponse(post));
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<PostResponse> update(@PathVariable Long id, @Valid @RequestBody PostRequest request) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		var user = (auth != null && auth.getPrincipal() instanceof com.jpcard.domain.user.User) ? (com.jpcard.domain.user.User) auth.getPrincipal() : null;
		return ResponseEntity.ok(mapToResponse(postService.update(id, request.title(), request.content(), request.isNotice(), user)));
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		var user = (auth != null && auth.getPrincipal() instanceof com.jpcard.domain.user.User) ? (com.jpcard.domain.user.User) auth.getPrincipal() : null;
		postService.delete(id, user);
		return ResponseEntity.noContent().build();
	}
	
	@PostMapping("/{id}/like")
	public ResponseEntity<PostResponse> like(@PathVariable Long id) {
		return ResponseEntity.ok(mapToResponse(postService.likePost(id)));
	}
	
	// --- 스터디 관련 API ---
	@PostMapping("/{id}/apply")
	public ResponseEntity<Void> apply(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
		var user = (com.jpcard.domain.user.User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		postService.applyStudy(id, user, body.get("message"), body.get("contactInfo"));
		return ResponseEntity.ok().build();
	}
	
	@DeleteMapping("/{id}/apply")
	public ResponseEntity<Void> cancelApply(@PathVariable Long id) {
		var user = (com.jpcard.domain.user.User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		postService.cancelApplication(id, user);
		return ResponseEntity.ok().build();
	}
	
	@PatchMapping("/{id}/status")
	public ResponseEntity<Void> status(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
		var user = (com.jpcard.domain.user.User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		postService.updateRecruitmentStatus(id, user, RecruitmentStatus.valueOf(body.get("status")));
		return ResponseEntity.ok().build();
	}
	
	@GetMapping("/{id}/applications")
	public ResponseEntity<List<java.util.Map<String, Object>>> getApps(@PathVariable Long id) {
		var user = (com.jpcard.domain.user.User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return ResponseEntity.ok(postService.getApplications(id, user).stream().map(a -> {
			var m = new java.util.HashMap<String, Object>();
			m.put("applicantName", a.getApplicant().getUsername());
			m.put("message", a.getMessage());
			m.put("contactInfo", a.getContactInfo());
			return m;
		}).collect(Collectors.toList()));
	}
	
	@GetMapping("/{id}/applied")
	public ResponseEntity<Boolean> checkApplied(@PathVariable Long id) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null || !(auth.getPrincipal() instanceof com.jpcard.domain.user.User)) return ResponseEntity.ok(false);
		return ResponseEntity.ok(postService.hasApplied(id, (com.jpcard.domain.user.User) auth.getPrincipal()));
	}
	
	private PostResponse mapToResponse(Post post) {
		List<String> urls = post.getAttachments() != null ? post.getAttachments().stream().map(a -> "/uploads/" + a.getStoreFilename()).collect(Collectors.toList()) : List.of();
		StudyRecruitment s = post.getStudyRecruitment();
		return new PostResponse(
				post.getId(),
				post.getAuthor() != null ? post.getAuthor().getId() : null, // ★ authorId 매핑
				post.getTitle(),
				post.getContent(),
				post.getLikeCount(),
				post.getAuthorName(),
				urls,
				post.isNotice(),
				post.getCategory(),
				s != null ? s.getRecruitmentStatus() : null,
				s != null ? s.getStudyType() : null,
				s != null ? s.getContactLink() : null
		);
	}
}