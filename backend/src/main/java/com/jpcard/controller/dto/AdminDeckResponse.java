package com.jpcard.controller.dto;

import com.jpcard.domain.deck.Deck;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDeckResponse {
	private Long id;
	private String name;
	private String description;
	private String ownerName;
	private boolean isPublic;
	private int cardCount;
	
	public static AdminDeckResponse from(Deck deck) {
		return AdminDeckResponse.builder()
				.id(deck.getId())
				.name(deck.getName())
				.description(deck.getDescription())
				.ownerName(deck.getOwner().getNickname())
				.isPublic(deck.isPublic())
				.cardCount(0)
				.build();
	}
}