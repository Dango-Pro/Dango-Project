package com.jpcard.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
	
	@Bean
	public OpenAPI openAPI() {
		// 1. 내가 쓸 JWT 토큰 정의 (자물쇠 만들기)
		SecurityScheme apiKey = new SecurityScheme()
				.type(SecurityScheme.Type.HTTP)
				.in(SecurityScheme.In.HEADER)
				.name("Authorization")
				.scheme("bearer")
				.bearerFormat("JWT");
		
		SecurityRequirement securityRequirement = new SecurityRequirement()
				.addList("Bearer Token");
		
		// 2. 스웨거 화면 만들기
		return new OpenAPI()
				.components(new Components().addSecuritySchemes("Bearer Token", apiKey))
				.addSecurityItem(securityRequirement)
				.info(new Info()
						.title("단고(Dango) API 문서")
						.description("일본어 학습 카드 서비스 API 명세서입니다.")
						.version("1.0.0"));
	}
}