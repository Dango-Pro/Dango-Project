package com.jpcard.util;

import com.jpcard.config.JwtConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Set;

@Component
public class JwtUtil {

    private final Key key;
    private final JwtConfig jwtConfig;

    public JwtUtil(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
        this.key = Keys.hmacShaKeyFor(jwtConfig.secret.getBytes());
    }

    public String createAccessToken(Long userId, Set<String> roles) {
        return createToken(userId, roles, jwtConfig.accessTokenExpireMs);
    }

    public String createRefreshToken(Long userId) {
        return createToken(userId, null, jwtConfig.refreshTokenExpireMs);
    }

    private String createToken(Long userId, Set<String> roles, long expireMs) {

        JwtBuilder builder = Jwts.builder()
                .setSubject(String.valueOf(userId))
                .setExpiration(new Date(System.currentTimeMillis() + expireMs))
                .signWith(key);

        if (roles != null) builder.claim("roles", roles);

        return builder.compact();
    }

    public Claims validateToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
