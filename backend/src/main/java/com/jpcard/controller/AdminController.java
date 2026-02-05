package com.jpcard.controller;

import com.jpcard.controller.dto.AdminStatsResponse;
import com.jpcard.controller.dto.AdminUserRequest;
import com.jpcard.controller.dto.AdminUserResponse;
import com.jpcard.controller.dto.AdminDeckResponse;
import com.jpcard.controller.dto.PostResponse;
import com.jpcard.domain.deck.Deck;
import com.jpcard.domain.post.Post;
import com.jpcard.domain.user.Role;
import com.jpcard.domain.user.User;
import com.jpcard.domain.user.UserStatus;
import com.jpcard.repository.CardRepository;
import com.jpcard.repository.DeckRepository;
import com.jpcard.repository.PostRepository;
import com.jpcard.repository.StudyLogRepository;
import com.jpcard.repository.UserRepository;
import com.jpcard.service.DeckService;
import com.jpcard.service.PostService;
import com.jpcard.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
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

	// ==================== Dashboard Stats ====================
	@Operation(summary = "Dashboard Stats", description = "Get comprehensive system-wide statistics")
	@GetMapping("/stats")
	public ResponseEntity<AdminStatsResponse> getStats() {
		long totalUsers = userRepository.count();
		long totalDecks = deckRepository.count();
		long totalCards = cardRepository.count();
		long totalPosts = postRepository.count();
		long totalStudyLogs = studyLogRepository.count();
		long publicDecks = deckRepository.findPublicDecks().size();
		long notices = postRepository.findByIsNoticeTrueOrderByIdDesc().size();

		return ResponseEntity.ok(new AdminStatsResponse(
				totalUsers, totalDecks, totalCards, totalPosts,
				totalStudyLogs, publicDecks, notices));
	}

	// ==================== User Management ====================
	@Operation(summary = "List Users", description = "Get all users with pagination")
	@GetMapping("/users")
	public ResponseEntity<Page<AdminUserResponse>> getUsers(@PageableDefault(size = 20) Pageable pageable) {
		Page<User> users = userService.findAll(pageable);
		Page<AdminUserResponse> response = users.map(AdminUserResponse::from);
		return ResponseEntity.ok(response);
	}

	@Operation(summary = "Get User", description = "Get a single user by ID")
	@GetMapping("/users/{id}")
	public ResponseEntity<AdminUserResponse> getUser(@PathVariable Long id) {
		User user = userService.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
		return ResponseEntity.ok(AdminUserResponse.from(user));
	}

	@Operation(summary = "Create User", description = "Create a new user")
	@PostMapping("/users")
	public ResponseEntity<AdminUserResponse> createUser(@RequestBody AdminUserRequest request) {
		Set<Role> roles = parseRoles(request.roles());
		UserStatus status = request.status() != null ? UserStatus.valueOf(request.status()) : UserStatus.ACTIVE;
		User user = userService.adminCreateUser(request.username(), request.password(), status, roles);
		return ResponseEntity.ok(AdminUserResponse.from(user));
	}

	@Operation(summary = "Update User", description = "Update an existing user")
	@PutMapping("/users/{id}")
	public ResponseEntity<AdminUserResponse> updateUser(@PathVariable Long id, @RequestBody AdminUserRequest request) {
		Set<Role> roles = request.roles() != null ? parseRoles(request.roles()) : null;
		UserStatus status = request.status() != null ? UserStatus.valueOf(request.status()) : null;
		User user = userService.adminUpdateUser(id, request.username(), request.password(), status, roles);
		return ResponseEntity.ok(AdminUserResponse.from(user));
	}

	@Operation(summary = "Delete User", description = "Delete a user")
	@DeleteMapping("/users/{id}")
	public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
		userService.adminDeleteUser(id);
		return ResponseEntity.noContent().build();
	}

	// ==================== Deck Management ====================
	@Operation(summary = "List All Decks", description = "Get all decks with pagination")
	@GetMapping("/decks")
	public ResponseEntity<Page<AdminDeckResponse>> getDecks(@PageableDefault(size = 20) Pageable pageable) {
		Page<Deck> decks = deckService.findAllDecks(pageable);
		Page<AdminDeckResponse> response = decks.map(AdminDeckResponse::from);
		return ResponseEntity.ok(response);
	}

	@Operation(summary = "List Public Decks", description = "Get public decks only")
	@GetMapping("/decks/public")
	public ResponseEntity<List<AdminDeckResponse>> getPublicDecks() {
		List<Deck> decks = deckRepository.findPublicDecks();
		List<AdminDeckResponse> response = decks.stream().map(AdminDeckResponse::from).collect(Collectors.toList());
		return ResponseEntity.ok(response);
	}

	@Operation(summary = "Delete Deck (Admin)", description = "Force delete any deck")
	@DeleteMapping("/decks/{id}")
	public ResponseEntity<Void> deleteDeck(@PathVariable Long id, Authentication auth) {
		// Admin can delete any deck
		Deck deck = deckService.findById(id);
		// Use the deck owner for deletion - or bypass owner check
		deckService.delete(id, deck.getOwner());
		return ResponseEntity.noContent().build();
	}

	// ==================== Post/Notice Management ====================
	@Operation(summary = "List All Posts", description = "Get all posts with optional search")
	@GetMapping("/posts")
	public ResponseEntity<List<PostResponse>> getAllPosts(@RequestParam(required = false) String q) {
		List<Post> posts = postService.search(q);
		List<PostResponse> responses = posts.stream()
				.map(this::mapToResponse)
				.collect(Collectors.toList());
		return ResponseEntity.ok(responses);
	}

	@Operation(summary = "Toggle Notice", description = "Toggle a post's notice status")
	@PatchMapping("/posts/{id}/notice")
	public ResponseEntity<PostResponse> toggleNotice(@PathVariable Long id, @RequestParam boolean isNotice,
			Authentication auth) {
		User adminUser = (User) auth.getPrincipal();
		Post post = postService.findById(id);
		// Update notice status
		post.setNotice(isNotice);
		postRepository.save(post);
		return ResponseEntity.ok(mapToResponse(post));
	}

	@Operation(summary = "Delete Post (Admin)", description = "Force delete any post")
	@DeleteMapping("/posts/{id}")
	public ResponseEntity<Void> deletePost(@PathVariable Long id, Authentication auth) {
		User adminUser = (User) auth.getPrincipal();
		postService.delete(id, adminUser);
		return ResponseEntity.noContent().build();
	}

	// ==================== Helper Methods ====================
	private Set<Role> parseRoles(Set<String> roleStrings) {
		if (roleStrings == null || roleStrings.isEmpty()) {
			Set<Role> defaultRoles = new HashSet<>();
			defaultRoles.add(Role.ROLE_USER);
			return defaultRoles;
		}
		Set<Role> roles = new HashSet<>();
		for (String r : roleStrings) {
			try {
				roles.add(Role.valueOf(r));
			} catch (IllegalArgumentException e) {
				// Skip invalid roles
			}
		}
		if (roles.isEmpty()) {
			roles.add(Role.ROLE_USER);
		}
		return roles;
	}

	private PostResponse mapToResponse(Post post) {
		List<String> attachmentUrls = post.getAttachments() == null ? java.util.Collections.emptyList()
				: post.getAttachments().stream()
						.map(a -> "/uploads/" + a.getStoreFilename())
						.collect(Collectors.toList());
		return new PostResponse(post.getId(), post.getTitle(), post.getContent(), post.getLikeCount(),
				post.getAuthorName(), attachmentUrls, post.isNotice(),
				post.getAuthor() != null ? post.getAuthor().getId() : null);
	}
}
