package com.jpcard.service;

import com.jpcard.controller.dto.CommentResponse;
import com.jpcard.domain.post.Comment;
import com.jpcard.domain.post.Post;
import com.jpcard.repository.CommentRepository;
import com.jpcard.repository.PostRepository;
import com.jpcard.util.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsForPost(Long postId) {
        List<Comment> comments = commentRepository.findByPostId(postId);
        // Filter top-level only and map
        return comments.stream()
                .filter(c -> c.getParent() == null)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private CommentResponse mapToResponse(Comment c) {
        List<CommentResponse> replies = c.getReplies() == null ? Collections.emptyList() :
                c.getReplies().stream().map(this::mapToResponse).collect(Collectors.toList());

        return new CommentResponse(
                c.getId(),
                c.getContent(),
                c.getPost().getId(),
                c.getAuthorName(),
                c.getParent() != null ? c.getParent().getId() : null,
                replies
        );
    }

    @Transactional(readOnly = true)
    public List<Comment> findByPostId(Long postId) {
        return commentRepository.findByPostId(postId);
    }

    @Transactional
    public CommentResponse addComment(Long postId, String content, String authorName, String ipAddress, Long parentId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setPost(post);
        comment.setAuthorName(authorName);
        comment.setIpAddress(ipAddress);

        if (parentId != null) {
            Comment parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found with id: " + parentId));
            comment.setParent(parent);
        }

        Comment saved = commentRepository.save(comment);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }
}
