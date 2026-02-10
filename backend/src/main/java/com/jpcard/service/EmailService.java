package com.jpcard.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@RequiredArgsConstructor
public class EmailService {
	
	private final JavaMailSender mailSender;
	
	// 인증번호 생성 (6자리)
	public String createCode() {
		Random random = new Random();
		StringBuilder key = new StringBuilder();
		for (int i = 0; i < 6; i++) {
			key.append(random.nextInt(10));
		}
		return key.toString();
	}
	
	// 이메일 발송
	public String sendEmail(String toEmail) {
		String authCode = createCode();
		MimeMessage message = mailSender.createMimeMessage();
		
		try {
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
			helper.setTo(toEmail);
			helper.setSubject("[JPCard] 회원가입 인증번호 안내");
			helper.setText("인증번호는 <h1>" + authCode + "</h1> 입니다.", true);
			
			mailSender.send(message);
			return authCode;
			
		} catch (MessagingException e) {
			throw new RuntimeException("메일 발송 실패", e);
		}
	}
}