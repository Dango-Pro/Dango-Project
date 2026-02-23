package com.jpcard.controller;

import com.jpcard.domain.user.User;
import com.jpcard.repository.DeckRepository;
import com.jpcard.repository.StudyLogRepository;
import com.jpcard.repository.UserRepository;
import com.jpcard.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
//import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
	
	private final AiService aiService;
	private final UserRepository userRepository;
	private final DeckRepository deckRepository;
	private final StudyLogRepository studyLogRepository;
	
	@PostMapping
	public ResponseEntity<Map<String, String>> chat(
			@RequestBody Map<String, String> request,
			@AuthenticationPrincipal User user // ✅ 현재 로그인한 유저 정보 가져오기
	) {
		String userMessage = request.get("message");
		
		// 1. 로그인한 유저 찾기 (로그인 안했으면 게스트 처리)
		String contextInfo = "사용자 정보: 게스트 (로그인하지 않음)";
		
		if (user != null) {
			User loginUser = userRepository.findByUsername(user.getUsername())
					.orElseThrow(() -> new RuntimeException("해당 유저를 찾을 수 없습니다."));
			
			// 2. DB에서 학습 데이터 조회
			// (1) 내 덱 개수
			int deckCount = deckRepository.findAll().stream()
					.filter(d -> d.getOwner().getId().equals(loginUser.getId()))
					.toList().size();
			
			// (2) 오늘 학습한 카드 수 (StudyLog에서 조회)
			LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
			long todayStudyCount = studyLogRepository.countByUserIdAndStudiedAtAfter(loginUser.getId(), startOfDay);
			
			// 3. AI에게 알려줄 "배경 지식(Context)" 만들기
			contextInfo = String.format("""
                    [사용자 정보]
                    - 닉네임: %s
                    - 현재 보유한 덱 개수: %d개
                    - 오늘 학습한 카드 수: %d개
                    
                    [역할]
                    당신은 'JPCard'라는 일본어 암기 서비스의 AI 튜터입니다.
                    위의 사용자 데이터를 바탕으로 학습 격려, 진도 체크, 조언을 해주세요.
                    사용자가 '내 학습 내용 알려줘'라고 하면 위 데이터를 기반으로 대답하세요.
                    """,
					user.getNickname(), deckCount, todayStudyCount);
		}
		
		// 4. AI에게 질문 + 배경지식(Context) 함께 전송
		// getResponse(질문, 컨텍스트, 모델명)
		String aiResponse = aiService.getResponse(userMessage, contextInfo, null);
		
		return ResponseEntity.ok(Map.of("response", aiResponse));
	}
}