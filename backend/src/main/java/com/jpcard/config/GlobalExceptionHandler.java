package com.jpcard.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
	
	// IllegalArgumentException이 발생하면 가로채서 400 에러로 바꿈
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException e) {
		// e.getMessage()에는  "부적절한 단어..." 메시지가 들어있음
		return ResponseEntity.status(400).body(e.getMessage());
	}
}