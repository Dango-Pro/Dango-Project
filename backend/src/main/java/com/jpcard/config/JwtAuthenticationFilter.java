package com.jpcard.config;

import com.jpcard.repository.UserRepository;
import com.jpcard.util.JwtUtil;
import com.jpcard.domain.user.User;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends GenericFilter {
	
	private final JwtUtil jwtUtil;
	private final UserRepository userRepository;
	
	@Override
	public void doFilter(ServletRequest request, ServletResponse response,
						 FilterChain chain) throws IOException, ServletException {
		
		HttpServletRequest httpReq = (HttpServletRequest) request;
		String token = resolveToken(httpReq);
		
		// [수정 1] validateToken은 이제 boolean을 반환하므로 조건식에 바로 사용
		if (token != null && jwtUtil.validateToken(token)) {
			try {
				// [수정 2] 토큰에서 ID 대신 '이메일'을 꺼냄 (JwtUtil에 추가한 메서드 사용)
				String email = jwtUtil.getEmailFromToken(token);
				
				// [수정 3] 이메일로 유저 찾기 (findById -> findByEmail)
				User user = userRepository.findByEmail(email).orElse(null);
				
				if (user != null) {
					// [수정 4] 단일 Role 처리 (String -> SimpleGrantedAuthority)
					// user.getRole()은 "ROLE_USER" 같은 문자열임
					List<GrantedAuthority> authorities = Collections.singletonList(
							new SimpleGrantedAuthority(user.getRole())
					);
					
					Authentication auth =
							new UsernamePasswordAuthenticationToken(user, null, authorities);
					
					SecurityContextHolder.getContext().setAuthentication(auth);
				}
				
			} catch (Exception e) {
				// 인증 실패 시 예외 처리 (로그 등)
				// SecurityContext에 저장하지 않고 넘어감 -> 403 에러 발생
			}
		}
		
		chain.doFilter(request, response);
	}
	
	private String resolveToken(HttpServletRequest request) {
		String header = request.getHeader("Authorization");
		if (header != null && header.startsWith("Bearer "))
			return header.substring(7);
		return null;
	}
}