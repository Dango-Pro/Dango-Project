package com.jpcard.controller.dto;

import java.util.Map;

public record CardRequest(
		Long deckId,
		String term,
		String meaning,
		Map<String, String> content,
		Boolean createReverse
) {
	public Boolean createReverse() { return createReverse != null && createReverse; }
}
