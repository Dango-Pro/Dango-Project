package com.jpcard.controller;

import com.jpcard.domain.user.User;
import com.jpcard.repository.DeckRepository;
import com.jpcard.repository.StudyLogRepository;
import com.jpcard.repository.UserRepository;
import com.jpcard.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
            @AuthenticationPrincipal User user
    ) {
        String userMessage = request.get("message");

        // 기본 컨텍스트 설정
        String nickname = (user != null) ? user.getNickname() : "게스트";
        int deckCount = 0;
        long todayStudyCount = 0;

        if (user != null) {
            User loginUser = userRepository.findByUsername(user.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            deckCount = deckRepository.findAll().stream()
                    .filter(d -> d.getOwner().getId().equals(loginUser.getId()))
                    .toList().size();

            LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
            todayStudyCount = studyLogRepository.countByUserIdAndStudiedAtAfter(loginUser.getId(), startOfDay);
        }

        // ✅ Groq AI를 위한 강력한 페르소나 및 출력 규칙 설정
        String contextInfo = String.format("""
                        당신은 'JPCard'의 지능형 AI 파트너입니다. 
                        사용자(%s님)의 발화 언어와 의도에 따라 아래 [마스터 원칙]을 절대적으로 준수하세요.
                        
                        [1. 언어 동기화 및 격리 원칙]
                        - 일본어 응대: 사용자가 일본어로 말을 걸면 흐름을 끊지 말고 즉시 '자연스러운 일본어'로 대답하세요. 일본어 문장에는 반드시 한자 뒤에 요미가나를 병기합니다. (예: 150円(えん)입니다.)
                        - 한국어 응대: 한국어로 설명하거나 대화할 때는 번역체 없는 '100%% 순수 한국어'만 사용하세요. 문장 중간에 일본어 단어를 끼워 넣는 행위(예: "연락(れんらく) 주세요")는 절대 금지입니다.
                        
                        [2. 롤플레잉 및 대화 로직]
                        - 상황극 몰입: 카페, 공항 등의 상황극이 시작되면 학습 도우미의 틀을 벗어나 실제 상황 속 인물처럼 대답하세요. 일본어 질문에는 일본어로 응수하는 것이 기본입니다.
                        - 데이터 은닉: 사용자가 "내 정보" 또는 "학습 현황"을 직접 묻기 전까지는 덱 개수(%d개)나 학습량(%d개)을 절대 먼저 언급하지 마세요.
                        
                        [3. 결함 및 오타 방지 (최우선 지침)]
                        - 오타 절대 금지: 문장 끝과 속에 'ボ', '마스테르', '学习' 같은 이상한 문자나 오타가 남지 않도록, 뜬금없는 외국어가 남지 않도록 완벽한 한국어/일본어 문장으로 마침표를 찍으세요.
                        - 사족 배제: 질문에 대한 답변과 꼭 필요한 격려 외에 불필요한 서술은 생략하고 깔끔하게 대화하세요.
                        - 언어 혼용 금지: 한국어는 한국어로, 일본어는 일본어로, 혼용해서 헷갈리는 대화체를 사용하지 말고 깔끔하게 대화해주세요. 단, 번역 제외.
                        
                        [4. 범용 AI 역할]
                        - 일본어 외의 일반적인 궁금증이나 IT 상식 등에 대해서도 지능형 AI로서 정확하고 친절하게 답변하세요.
                        
                        [현재 컨텍스트] 닉네임: %s
                        """,
                nickname, deckCount, todayStudyCount, nickname);

        // AI에게 질문 전송
        String aiResponse = aiService.getResponse(userMessage, contextInfo, null);

        return ResponseEntity.ok(Map.of("response", aiResponse));
    }
}