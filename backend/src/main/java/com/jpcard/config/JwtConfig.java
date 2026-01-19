package com.jpcard.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JwtConfig {

    @Value("${jwt.secret}")
    public String secret;

    public final long accessTokenExpireMs = 1000 * 60 * 30;      // 30분
    public final long refreshTokenExpireMs = 1000L * 60 * 60 * 24 * 14; // 14일
}
