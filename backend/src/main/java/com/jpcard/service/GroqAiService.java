package com.jpcard.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@Primary
@RequiredArgsConstructor
public class GroqAiService implements AiService {

    @Value("${groq.ai.api-key:}")
    private String apiKey;

    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getResponse(String prompt, String context, String model) {
        if (apiKey == null || apiKey.isBlank()) {
            return "API 키가 설정되지 않았습니다. 인텔리제이 환경변수 GROQ_API_KEY를 확인해 주세요.";
        }

        // 우리가 이전에 사용했던 고성능 모델 Llama 3.3 70B를 기본값으로 설정합니다.
        String targetModel = (model != null && !model.isBlank()) ? model : "llama-3.3-70b-versatile";
        String url = "https://api.groq.com/openai/v1/chat/completions";

        // 시스템 페르소나와 사용자 컨텍스트를 결합합니다.
        String systemRole = (context != null && !context.isBlank()) ? context : "당신은 일본어 학습 서비스 'JPCard'의 AI 튜터입니다.";

        Map<String, Object> requestBody = Map.of(
                "model", targetModel,
                "messages", List.of(
                        Map.of("role", "system", "content", systemRole),
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.7
        );

        try {
            String response = restClient.post()
                    .uri(url)
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            return root.path("choices").get(0).path("message").path("content").asText();

        } catch (Exception e) {
            e.printStackTrace();
            return "Groq AI 연결 실패: " + e.getMessage();
        }
    }
}