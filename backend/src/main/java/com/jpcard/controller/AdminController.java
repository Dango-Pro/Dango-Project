package com.jpcard.controller;

import com.jpcard.controller.dto.*;
import com.jpcard.domain.deck.Deck;
import com.jpcard.domain.post.Post;
import com.jpcard.domain.post.StudyRecruitment;
import com.jpcard.domain.user.User;
import com.jpcard.domain.user.UserStatus;
import com.jpcard.repository.*;
import com.jpcard.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Tag(name = "Admin", description = "Admin API")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
	
	private final UserRepository userRepository;
	private final DeckRepository deckRepository;
	private final CardRepository cardRepository;
	private final PostRepository postRepository;
	private final StudyLogRepository studyLogRepository;
	private final UserService userService;
	private final DeckService deckService;
	private final PostService postService;
	
	@Operation(summary = "Dashboard Stats")
	@GetMapping("/stats")
	public ResponseEntity<AdminStatsResponse> getStats() {
		return ResponseEntity.ok(new AdminStatsResponse(
				userRepository.count(),
				deckRepository.count(),
				cardRepository.count(),
				postRepository.count(),
				studyLogRepository.count(),
				deckRepository.count(), // 공개 덱 카운트 로직 필요 시 수정
				postRepository.findByIsNoticeTrueOrderByIdDesc().size()
		));
	}
	
	// --- 유저 관리 ---
	@GetMapping("/users")
	public ResponseEntity<Page<AdminUserResponse>> getUsers(@PageableDefault(size = 20) Pageable pageable) {
		return ResponseEntity.ok(userService.findAll(pageable).map(this::mapToUserResponse));
	}
	
	@GetMapping("/users/{id}")
	public ResponseEntity<AdminUserResponse> getUser(@PathVariable Long id) {
		User user = userService.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
		return ResponseEntity.ok(mapToUserResponse(user));
	}
	
	@PostMapping("/users")
	public ResponseEntity<AdminUserResponse> createUser(@RequestBody AdminUserRequest request) {
		String role = request.roles() != null && !request.roles().isEmpty()
				? request.roles().iterator().next() : "ROLE_USER";
		UserStatus status = request.status() != null ? UserStatus.valueOf(request.status()) : UserStatus.ACTIVE;
		User user = userService.adminCreateUser(request.username(), request.password(), status, role);
		return ResponseEntity.ok(mapToUserResponse(user));
	}
	
	@PutMapping("/users/{id}")
	public ResponseEntity<AdminUserResponse> updateUser(@PathVariable Long id, @RequestBody AdminUserRequest request) {
		String role = request.roles() != null && !request.roles().isEmpty()
				? request.roles().iterator().next() : null;
		UserStatus status = request.status() != null ? UserStatus.valueOf(request.status()) : null;
		User user = userService.adminUpdateUser(id, request.username(), request.password(), status, role);
		return ResponseEntity.ok(mapToUserResponse(user));
	}
	
	@DeleteMapping("/users/{id}")
	public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
		userService.adminDeleteUser(id);
		return ResponseEntity.noContent().build();
	}
	
	// --- 덱 관리 ---
	@GetMapping("/decks")
	public ResponseEntity<Page<AdminDeckResponse>> getDecks(@PageableDefault(size = 20) Pageable pageable) {
		return ResponseEntity.ok(deckService.findAllDecks(pageable).map(AdminDeckResponse::from));
	}
	
	@DeleteMapping("/decks/{id}")
	public ResponseEntity<Void> deleteDeck(@PathVariable Long id) {
		Deck deck = deckService.findById(id);
		deckService.delete(id, deck.getOwner());
		return ResponseEntity.noContent().build();
	}
	
	// --- 게시글 관리 (페이징 필수 적용) ---
	@Operation(summary = "List All Posts")
	@GetMapping("/posts")
	public ResponseEntity<Page<PostResponse>> getAllPosts(
			@RequestParam(required = false) String q,
			@PageableDefault(size = 20) Pageable pageable) {
		Page<Post> posts = postService.search(q, null, null, pageable);
		return ResponseEntity.ok(posts.map(this::mapToPostResponse));
	}
	
	@PatchMapping("/posts/{id}/notice")
	public ResponseEntity<PostResponse> toggleNotice(@PathVariable("id") Long id,
													 @RequestParam(name = "isNotice") boolean isNotice) {
		Post post = postService.findById(id);
		post.setNotice(isNotice);
		postRepository.save(post);
		return ResponseEntity.ok(mapToPostResponse(post));
	}
	
	@DeleteMapping("/posts/{id}")
	public ResponseEntity<Void> deletePost(@PathVariable Long id, Authentication auth) {
		User adminUser = (auth != null && auth.getPrincipal() instanceof User) ? (User) auth.getPrincipal() : null;
		postService.delete(id, adminUser);
		return ResponseEntity.noContent().build();
	}
	
	// --- 매핑 헬퍼 메서드 ---
	private AdminUserResponse mapToUserResponse(User user) {
		return new AdminUserResponse(
				user.getId(),
				user.getEmail(),
				user.getStatus().name(),
				Collections.singleton(user.getRole()),
				null
		);
	}
	
	private PostResponse mapToPostResponse(Post post) {
		List<String> urls = post.getAttachments() != null ?
				post.getAttachments().stream().map(a -> "/uploads/" + a.getStoreFilename()).collect(Collectors.toList()) : List.of();
		StudyRecruitment s = post.getStudyRecruitment();
		return new PostResponse(
				post.getId(),
				post.getAuthor() != null ? post.getAuthor().getId() : null,
				post.getTitle(),
				post.getContent(),
				post.getLikeCount(),
				post.getViewCount(),
				post.getAuthorName(),
				urls,
				post.isNotice(),
				post.getCategory(),
				s != null ? s.getRecruitmentStatus() : null,
				s != null ? s.getStudyType() : null,
				s != null ? s.getContactLink() : null,
				post.getCreatedAt() != null ? post.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant() : null
		);
	}
}