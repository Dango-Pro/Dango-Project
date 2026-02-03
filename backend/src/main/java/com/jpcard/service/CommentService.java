package com.jpcard.service;

import com.jpcard.controller.dto.CommentResponse;
import com.jpcard.domain.post.Comment;
import com.jpcard.domain.post.Post;
import com.jpcard.domain.user.Role;
import com.jpcard.domain.user.User;
import com.jpcard.repository.CommentRepository;
import com.jpcard.repository.PostRepository;
import com.jpcard.util.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException; // 시큐리티 예외 패키지 확인
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
		// 최상위 댓글만 필터링하여 응답 변환
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
	
	/**
	 * 댓글 삭제 (권한 검증 포함)
	 */
	@Transactional
	public void deleteComment(Long commentId, User currentUser) {
		// 1. 댓글 존재 여부 확인
		Comment comment = commentRepository.findById(commentId)
				.orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));
		
		// 2. 권한 체크 (본인 확인 또는 관리자 여부)
		checkCommentOwner(comment, currentUser);
		
		// 3. 삭제 수행
		commentRepository.deleteById(commentId);
	}
	
	/**
	 * 댓글 권한 검증 (본인 확인 + 관리자 권한)
	 */
	private void checkCommentOwner(Comment comment, User user) {
		if (user == null) {
			throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
		}
		
		// 관리자 또는 매니저 여부 확인
		boolean isManager = user.getRoles().contains(Role.ROLE_MANAGER) ||
				user.getRoles().contains(Role.ROLE_ADMIN);
		
		// 작성자 본인 확인 (Username 대조)
		boolean isAuthor = comment.getAuthorName() != null &&
				comment.getAuthorName().equals(user.getUsername());
		
		if (!isAuthor && !isManager) {
			throw new AccessDeniedException("해당 댓글을 삭제할 권한이 없습니다.");
		}
	}
}