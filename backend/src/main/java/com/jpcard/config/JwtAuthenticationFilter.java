package com.jpcard.config;

import com.jpcard.domain.user.User;
import com.jpcard.repository.UserRepository;
import com.jpcard.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
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
                    String role = user.getRole();

                    if (role != null && !role.isBlank()) {
                        // ROLE_ 접두사가 없다면 붙여서 시큐리티가 인식하게 함 (핵심 수정 사항)
                        String roleWithPrefix = role.startsWith("ROLE_") ? role : "ROLE_" + role;
                        authorities.add(new SimpleGrantedAuthority(roleWithPrefix));
                    }

                    // 비밀번호(credentials)는 보안상 null로 처리
                    Authentication auth =
                            new UsernamePasswordAuthenticationToken(user, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    log.info("인증 성공: 사용자 {}, 권한 {}", email, authorities);
                }
            } catch (Exception e) {
                log.error("JWT 인증 과정 중 오류 발생: {}", e.getMessage());
            }
        }

        chain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}