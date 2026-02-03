package com.jpcard.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
				// 1. CSRF 비활성화 (JWT 사용 시 필수)
				.csrf(csrf -> csrf.disable())

				// 2. CORS 설정 적용
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))

				// 3. 세션 사용 안 함 (Stateless)
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				// 4. URL별 권한 설정 (★ 순서 중요!)
				.authorizeHttpRequests(auth -> auth
						// (1) 누구나 접근 가능한 곳 (회원가입, 로그인, H2 콘솔, 이미지 등)
						.requestMatchers(org.springframework.http.HttpMethod.GET, "/api/posts/**").permitAll()
						.requestMatchers(org.springframework.http.HttpMethod.GET, "/api/posts/*/comments").permitAll()
						.requestMatchers(org.springframework.http.HttpMethod.POST, "/api/posts/*/comments").permitAll()
						.requestMatchers(
								"/api/auth/**",
								"/h2-console/**",
								"/uploads/**",
								"/favicon.ico",
								"/error",
								"/swagger-ui/**", // Swagger 화면(HTML) 접근 허용
								"/v3/api-docs/**" // Swagger가 사용하는 데이터(JSON) 접근 허용
						).permitAll()

						// 관리자 전용 구역 (반드시 anyRequest보다 위에 있어야 함!)
						.requestMatchers("/api/admin/**").hasRole("ADMIN")
						// (2) 그 외 모든 요청은 인증 필요 (★ 무조건 맨 마지막에!)
						.anyRequest().authenticated())

				// 5. H2 콘솔 깨짐 방지 (X-Frame-Options)
				.headers(headers -> headers.frameOptions(frame -> frame.disable()))

				// 6. 필터 추가 (UsernamePasswordAuthenticationFilter 앞에 JWT 필터 배치)
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
		return authConfig.getAuthenticationManager();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();
		// 프론트엔드 주소 허용 (React 등)
		config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));
		config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
		config.setAllowedHeaders(List.of("*"));
		config.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return source;
	}
}