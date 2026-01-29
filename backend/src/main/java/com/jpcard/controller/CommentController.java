package com.jpcard.controller;

import com.jpcard.controller.dto.CommentRequest;
import com.jpcard.controller.dto.CommentResponse;
import com.jpcard.domain.post.Comment;
import com.jpcard.service.CommentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<CommentResponse>> list(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getCommentsForPost(postId));
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentResponse> create(@PathVariable Long postId, @RequestBody CommentRequest request, @RequestParam(required = false) Long parentId, HttpServletRequest httpRequest) {
        String authorName = determineAuthorName(httpRequest);
        String ipAddress = httpRequest.getRemoteAddr();

        CommentResponse response = commentService.addComment(postId, request.content(), authorName, ipAddress, parentId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }

    private String determineAuthorName(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
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
