package com.jpcard.config;

import com.jpcard.domain.user.Role;
import com.jpcard.domain.user.User;
import com.jpcard.repository.UserRepository;
import com.jpcard.util.JwtUtil;
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
		
		if (token != null && jwtUtil.validateToken(token)) {
			try {
				String email = jwtUtil.getEmailFromToken(token);
				User user = userRepository.findByEmail(email).orElse(null);

				if (user != null) {
					List<GrantedAuthority> authorities = new ArrayList<>();
					if (user.getRole() != null && !user.getRole().isBlank()) {
						authorities.add(new SimpleGrantedAuthority(user.getRole()));
					}

					Authentication auth =
							new UsernamePasswordAuthenticationToken(user, null, authorities);
					SecurityContextHolder.getContext().setAuthentication(auth);
				}
			} catch (Exception e) {
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