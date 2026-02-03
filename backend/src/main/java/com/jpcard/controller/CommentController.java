package com.jpcard.controller;

import com.jpcard.controller.dto.CommentRequest;
import com.jpcard.controller.dto.CommentResponse;
import com.jpcard.domain.user.User;
import com.jpcard.service.CommentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {
	
	private final CommentService commentService;
	
	@GetMapping("/posts/{postId}/comments")
	public ResponseEntity<List<CommentResponse>> list(@PathVariable Long postId) {
		List<CommentResponse> responses = commentService.getCommentsForPost(postId);
		return ResponseEntity.ok(responses);
	}
	
	@PostMapping("/posts/{postId}/comments")
	public ResponseEntity<CommentResponse> create(
			@PathVariable Long postId,
			@Valid @RequestBody CommentRequest request,
			@RequestParam(required = false) Long parentId,
			HttpServletRequest httpRequest) {
		
		String authorName = determineAuthorName(httpRequest);
		String ipAddress = httpRequest.getRemoteAddr();
		
		CommentResponse response = commentService.addComment(postId, request.content(), authorName, ipAddress, parentId);
		return ResponseEntity.ok(response);
	}
	
	@DeleteMapping("/comments/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) { // ResponseEntity<Void>로 명시
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		User user = (auth != null && auth.getPrincipal() instanceof User) ? (User) auth.getPrincipal() : null;
		
		commentService.deleteComment(id, user);
		return ResponseEntity.noContent().build();
	}
	
	private String determineAuthorName(HttpServletRequest request) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
			Object principal = authentication.getPrincipal();
			if (principal instanceof User) {
				return ((User) principal).getUsername();
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