package com.jpcard.controller.dto;

import java.time.LocalDateTime;

public record StudyApplicationResponse(
		Long id,
		Long applicantId,
		String applicantEmail,
		String applicantName,
		String message,
		String contactInfo,
		LocalDateTime appliedAt
) {}
