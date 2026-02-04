package com.jpcard.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PostRequest(
		@NotBlank(message = "제목은 비어있을 수 없습니다.")
		@Size(max = 255, message = "제목은 최대 255자까지 입력 가능합니다.")
		String title,
		
		@NotBlank(message = "내용은 비어있을 수 없습니다.")
		String content,
		
		boolean isNotice) {
}
