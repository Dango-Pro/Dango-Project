package com.jpcard.service;

import jakarta.annotation.PostConstruct;
import org.apache.commons.text.similarity.JaroWinklerDistance;
import org.apache.commons.text.similarity.JaroWinklerSimilarity;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.Buffer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NicknameFilterService {

	// 금지어 리스트 (욕설 + 운영자 사칭)
	private List<String> BAD_WORDS = new ArrayList<>();
	// 유사도 계산기
	private final JaroWinklerSimilarity similarity = new JaroWinklerSimilarity();
	
	// 서버가 켜질 때 한 번 실행되어 파일 읽어옴 (메모리 절약!)
	@PostConstruct
	public void init() {
		try {
			ClassPathResource resource = new ClassPathResource("badwords.txt");
			BufferedReader reader = new BufferedReader(
					new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8));
			BAD_WORDS = reader.lines().collect(Collectors.toList());
			
			System.out.println("금지어 리스트 로딩 완료: " + BAD_WORDS.size() + "개");
		}
		catch (IOException e) {
			System.out.println("금지어를 읽을 수 없습니다. 기본값만 사용합니다.");
			// 파일 못 읽었을 때 대비한 비상용 기본값
			BAD_WORDS.addAll(List.of("admin","root","운영자"));
		}
	}
	
	public void validateNickname(String nickname) {
		// 공백 제거, 소문자 변환 (정확한 비교 위해)
		String normalized = nickname.replace(" ", "").toLowerCase();
		
		for (String badWord : BAD_WORDS) {
			// 유사도 점수 계산 (0.0 ~ 1.0 사이, 1.0이면 똑같은 글자)
			Double score = similarity.apply(normalized, badWord);
			
			// 판단 기준: 85% 이상 비슷하면 차단 (수치는 테스트하며 조절)
			if (score > 0.85) {
				throw new IllegalArgumentException(
						"부적절한 단어('" + badWord + "')와 유사한 닉네임입니다. 보안정책에 의해 사용할 수 없습니다."
				);
			}
			
			// 포함 여부 검사 (단순 포함도 차단)
			if (normalized.contains(badWord)) {
				throw new IllegalArgumentException("사용할 수 없는 단어가 포함되어 있습니다.");
			}
		}
	}
}
