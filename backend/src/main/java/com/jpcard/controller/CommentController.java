package com.jpcard.controller;

import com.jpcard.controller.dto.CommentRequest;
import com.jpcard.controller.dto.CommentResponse;
import com.jpcard.service.CommentService;
import jakarta.servlet.http.HttpServletRequest;
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
    }

    @PostMapping("/posts/{postId}/comments")
        String authorName = determineAuthorName(httpRequest);
        String ipAddress = httpRequest.getRemoteAddr();

        CommentResponse response = commentService.addComment(postId, request.content(), authorName, ipAddress, parentId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/comments/{id}")
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