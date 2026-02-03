package com.jpcard.controller.dto;

import jakarta.validation.constraints.NotBlank;

public record CommentRequest(
		@NotBlank(message = "댓글 내용은 비어있을 수 없습니다.")
		String content
) {
}