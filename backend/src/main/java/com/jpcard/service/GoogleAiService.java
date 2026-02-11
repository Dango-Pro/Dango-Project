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
public class GoogleAiService implements AiService {
	
	@Value("${google.ai.api-key:}")
	private String apiKey;
	
	private final RestClient restClient = RestClient.create();
	private final ObjectMapper objectMapper = new ObjectMapper();
	
	@Override
	public String getResponse(String prompt, String context, String model) {
		if (apiKey == null || apiKey.isBlank()) {
			return "API 키가 설정되지 않았습니다. 환경변수 GOOGLE_AI_KEY를 설정한 뒤 다시 시도해 주세요.";
		}
		// model 파라미터는 추후 확장성을 위해 두되, 현재는 gemini-1.5-flash 고정 사용
		String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;
		
		// context가 있다면 프롬프트 앞에 붙여줍니다.
		String finalPrompt = (context != null && !context.isBlank())
				? "Context: " + context + "\n\nQuestion: " + prompt
				: prompt;
		
		Map<String, Object> requestBody = Map.of(
				"contents", List.of(
						Map.of("parts", List.of(
								Map.of("text", finalPrompt)
						))
				)
		);
		
		try {
			String response = restClient.post()
					.uri(url)
					.contentType(MediaType.APPLICATION_JSON)
					.body(requestBody)
					.retrieve()
					.body(String.class);
			
			JsonNode root = objectMapper.readTree(response);
			return root.path("candidates").get(0)
					.path("content").path("parts").get(0)
					.path("text").asText();
			
		} catch (Exception e) {
			e.printStackTrace();
			return "AI 서비스 연결 오류: " + e.getMessage();
		}
	}
}