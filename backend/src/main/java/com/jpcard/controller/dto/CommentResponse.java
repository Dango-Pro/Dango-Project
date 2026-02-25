package com.jpcard.controller.dto;

import java.util.List;

public record CommentResponse(Long id, String content, Long postId, String authorName, Long parentId, List<CommentResponse> replies) {
}
