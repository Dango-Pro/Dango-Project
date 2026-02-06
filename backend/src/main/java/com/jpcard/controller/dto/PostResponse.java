package com.jpcard.controller.dto;

import java.util.List;

public record PostResponse(Long id, String title, String content, int likeCount, String authorName, List<String> attachmentUrls, boolean isNotice) {
}
