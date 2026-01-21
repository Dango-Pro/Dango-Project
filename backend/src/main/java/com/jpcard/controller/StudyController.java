package com.jpcard.controller;

import com.jpcard.controller.dto.CardResponse;
import com.jpcard.controller.dto.ReviewRequest;
import com.jpcard.controller.dto.StudySessionResponse;
import com.jpcard.domain.user.User;
import com.jpcard.service.StudyService;
import com.jpcard.service.StudySessionResult;
import com.jpcard.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/study")
@RequiredArgsConstructor
public class StudyController {
	
	private final StudyService studyService;
	private final UserService userService;
	
	// ★ 여기가 문제였던 부분입니다.
	private User getUser(Authentication authentication) {
		Object principal = authentication.getPrincipal();
		if (principal instanceof User) {
			return (User) principal;
		}
		// [수정] findByUsername -> findByEmail
		// authentication.getName()에는 이제 이메일이 들어있습니다.
		return userService.findByEmail(authentication.getName())
				.orElseThrow(() -> new java.util.NoSuchElementException("User not found"));
	}
	
	@GetMapping("/due")
	public ResponseEntity<StudySessionResponse> getDueCards(@RequestParam Long deckId,
															@RequestParam(defaultValue = "false") boolean studyMore,
															Authentication authentication) {
		if (authentication == null) return ResponseEntity.status(401).build();
		User user = getUser(authentication);
		
		StudySessionResult result = studyService.getDueCards(user.getId(), deckId, studyMore);
		
		List<CardResponse> cardResponses = result.cards().stream()
				.map(card -> new CardResponse(card.getId(), card.getTerm(), card.getMeaning(), false, card.getDeck().getId()))
				.collect(Collectors.toList());
		
		StudySessionResponse response = new StudySessionResponse(
				cardResponses,
				result.limitReached(),
				result.newCardsInBatch(),
				result.dueCardsInBatch(),
				result.newCardsStudiedToday(),
				result.dailyLimit()
		);
		
		return ResponseEntity.ok(response);
	}
	
	@PostMapping("/review")
	public ResponseEntity<Void> reviewCard(@RequestBody ReviewRequest request, Authentication authentication) {
		if (authentication == null) return ResponseEntity.status(401).build();
		User user = getUser(authentication);
		
		studyService.processReview(user.getId(), request.cardId(), request.rating());
		return ResponseEntity.ok().build();
	}
}