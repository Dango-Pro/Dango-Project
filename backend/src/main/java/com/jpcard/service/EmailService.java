package com.jpcard.service;

import com.jpcard.repository.EmailVerificationRepository;
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

	private final EmailVerificationRepository emailVerificationRepository;

	@org.springframework.beans.factory.annotation.Value("${spring.mail.username:inanasai1101@gmail.com}")
	private String senderEmail;

	// 인증번호 생성 (6자리)
	public String createCode() {
		return String.valueOf(new Random().nextInt(900000) + 100000);
	}

	// 이메일 발송
	@org.springframework.transaction.annotation.Transactional
	public void sendEmail(String toEmail) {
		String authCode = createCode();

		// 기존 인증번호 삭제 (재요청 시)
		emailVerificationRepository.findByEmail(toEmail).ifPresent(emailVerificationRepository::delete);

		// 새 인증번호 저장 (5분 유효)
		emailVerificationRepository.save(new com.jpcard.domain.auth.EmailVerification(toEmail, authCode, 5));

		MimeMessage message = mailSender.createMimeMessage();

		try {
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
			helper.setFrom(senderEmail, "DANGO");
			helper.setTo(toEmail);
			helper.setSubject("[DANGO] 회원가입 인증번호 안내");

			String htmlContent = "<div style=\"background-color: #f7f9fc; padding: 50px 20px; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;\">"
					+
					"  <div style=\"max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);\">"
					+
					"    <div style=\"background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;\">"
					+
					"      <h1 style=\"color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px;\">DANGO</h1>"
					+
					"    </div>" +
					"    <div style=\"padding: 40px 30px; text-align: center;\">" +
					"      <h2 style=\"color: #333333; margin-bottom: 20px; font-size: 22px;\">이메일 인증을 완료해주세요</h2>" +
					"      <p style=\"color: #666666; line-height: 1.6; margin-bottom: 30px;\">DANGO 회원가입을 위해 아래의 인증번호를 입력창에 입력해주세요.<br/>이 인증번호는 <b>5분</b> 동안 유효합니다.</p>"
					+
					"      <div style=\"background-color: #f1f4f9; padding: 20px; border-radius: 12px; display: inline-block; min-width: 200px;\">"
					+
					"        <span style=\"font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 5px;\">"
					+ authCode + "</span>" +
					"      </div>" +
					"      <p style=\"color: #999999; font-size: 13px; margin-top: 30px;\">본인이 요청하지 않은 경우 이 메일을 무시하셔도 됩니다.</p>"
					+
					"    </div>" +
					"    <div style=\"background-color: #fdfdfd; padding: 20px; text-align: center; border-top: 1px solid #f0f0f0;\">"
					+
					"      <p style=\"color: #cccccc; font-size: 12px; margin: 0;\">&copy; 2026 DANGO. All rights reserved.</p>"
					+
					"    </div>" +
					"  </div>" +
					"</div>";

			helper.setText(htmlContent, true);

			mailSender.send(message);

		} catch (MessagingException | java.io.UnsupportedEncodingException e) {
			throw new RuntimeException("메일 발송 실패", e);
		}
	}
}