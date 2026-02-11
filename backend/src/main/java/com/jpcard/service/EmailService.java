package com.jpcard.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class EmailService {

	/** 메일 설정이 없으면 null → 앱 기동은 가능, 발송 시에만 예외 */
	@Autowired(required = false)
	private JavaMailSender mailSender;

	// 인증번호 생성 (6자리)
	public String createCode() {
		Random random = new Random();
		StringBuilder key = new StringBuilder();
		for (int i = 0; i < 6; i++) {
			key.append(random.nextInt(10));
		}
		return key.toString();
	}

	// 이메일 발송 (mailSender 없으면 "메일 미설정" 예외)
	public String sendEmail(String toEmail) {
		if (mailSender == null) {
			throw new IllegalStateException("메일 발송이 설정되지 않았습니다. application.yaml의 spring.mail 설정을 확인하세요.");
		}
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