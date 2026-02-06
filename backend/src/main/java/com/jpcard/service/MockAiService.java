package com.jpcard.service;

import org.springframework.stereotype.Service;

@Service
public class MockAiService implements AiService {
	
	@Override
	public String getResponse(String prompt, String context, String model) {
		return "[Mock AI Response] 질문하신 '" + prompt + "'에 대한 답변입니다. (Context: " + context + ")";
	}
}