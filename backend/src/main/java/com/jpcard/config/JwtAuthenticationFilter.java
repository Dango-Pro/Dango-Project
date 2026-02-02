package com.jpcard.config;

import com.jpcard.domain.user.Role;
import com.jpcard.domain.user.User;
import com.jpcard.repository.UserRepository;
import com.jpcard.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // 로그 사용을 위해 추가
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Slf4j // 로깅 기능 활성화 (e.getMessage 오류 해결)
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
	
	private final JwtUtil jwtUtil;
	private final UserRepository userRepository;
	
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws ServletException, IOException {
		
		String token = resolveToken(request);
		
		if (token != null) {
			try {
				// (유효하지 않은 토큰이면 여기서 에러 발생 -> catch로 이동)
				Claims claims = jwtUtil.validateToken(token);
				
				// 이메일 대신 'ID(Long)'로 찾기 (맨 처음 코드 방식)
				Long userId = Long.valueOf(claims.getSubject());
				
				// findByEmail 대신 findById 사용
				User user = userRepository.findById(userId).orElse(null);
				
				if (user != null) {
					List<GrantedAuthority> authorities = new ArrayList<>();
					
					// getRole() 대신 getRoles() (여러 권한 루프) 사용
					// Enum이 이미 'ROLE_'을 가지고 있으므로 .name()만 사용
					if (user.getRoles() != null) {
						for (Role role : user.getRoles()) {
							authorities.add(new SimpleGrantedAuthority(role.name()));
						}
					}
					
					Authentication auth =
							new UsernamePasswordAuthenticationToken(user, null, authorities);
					
					SecurityContextHolder.getContext().setAuthentication(auth);
				}
				
			} catch (Exception e) {
				// 토큰 검증 실패 시 로그 출력 (Slf4j 어노테이션 덕분에 가능)
				log.error("Invalid JWT token: {}", e.getMessage());
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