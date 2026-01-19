package com.jpcard.controller;

import com.jpcard.controller.dto.PostRequest;
import com.jpcard.controller.dto.PostResponse;
import com.jpcard.service.PostService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import com.jpcard.domain.post.Post;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

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

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> get(@PathVariable Long id) {
        var post = postService.findById(id);
        return ResponseEntity.ok(mapToResponse(post));
    }

    @PostMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponse> create(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "isNotice", required = false, defaultValue = "false") boolean isNotice,
            @RequestParam(value = "files", required = false) List<org.springframework.web.multipart.MultipartFile> files,
            HttpServletRequest httpRequest) {
        String authorName = determineAuthorName(httpRequest);
        String ipAddress = httpRequest.getRemoteAddr();

        var post = postService.create(title, content, isNotice, authorName, ipAddress, files);
        return ResponseEntity.ok(mapToResponse(post));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> update(@PathVariable Long id, @RequestBody PostRequest request) {
        var post = postService.update(id, request.title(), request.content(), request.isNotice());
        return ResponseEntity.ok(mapToResponse(post));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        postService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<PostResponse> like(@PathVariable Long id) {
        var post = postService.likePost(id);
        return ResponseEntity.ok(mapToResponse(post));
    }

    private PostResponse mapToResponse(Post post) {
        List<String> attachmentUrls = post.getAttachments() == null ? java.util.Collections.emptyList() :
                post.getAttachments().stream()
                        .map(a -> "/uploads/" + a.getStoreFilename())
                        .collect(Collectors.toList());
        return new PostResponse(post.getId(), post.getTitle(), post.getContent(), post.getLikeCount(), post.getAuthorName(), attachmentUrls, post.isNotice());
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
