package com.jpcard.config;

import com.jpcard.repository.UserRepository;
import com.jpcard.util.JwtUtil;
import com.jpcard.domain.user.User;
import io.jsonwebtoken.Claims;
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
import java.util.ArrayList;
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

        if (token != null) {
            try {
                Claims claims = jwtUtil.validateToken(token);

                Long userId = Long.valueOf(claims.getSubject());
                User user = userRepository.findById(userId).orElse(null);

                if (user != null) {
                    List<GrantedAuthority> authorities = new ArrayList<>();
                    user.getRoles().forEach(r -> authorities.add(
                            new SimpleGrantedAuthority(r.name())
                    ));

                    Authentication auth =
                            new UsernamePasswordAuthenticationToken(user, null, authorities);

                    SecurityContextHolder.getContext().setAuthentication(auth);
                }

            } catch (Exception e) {
                // 토큰 에러 -> 인증하지 않고 넘김
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