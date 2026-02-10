package com.jpcard.controller.dto;
import com.jpcard.domain.deck.Deck;

public record AdminDeckResponse(Long id, String name, String category, boolean isPublic, String ownerNickname, int cardCount) {
	public static AdminDeckResponse from(Deck deck) {
		String category = deck.getCategory() != null ? deck.getCategory() : "";
		int cardCount = deck.getCards() != null ? deck.getCards().size() : 0;
		return new AdminDeckResponse(deck.getId(), deck.getName(), category, deck.isPublic(),
				deck.getOwner() != null ? deck.getOwner().getNickname() : "Unknown",
				cardCount);
	}
}