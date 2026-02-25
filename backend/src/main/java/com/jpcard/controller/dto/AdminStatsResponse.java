package com.jpcard.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminStatsResponse {
	private long totalUsers;
	private long totalDecks;
	private long totalCards;
	private long totalPosts;
	private long totalStudyLogs;
	private long publicDecks;
	private long notices;
}