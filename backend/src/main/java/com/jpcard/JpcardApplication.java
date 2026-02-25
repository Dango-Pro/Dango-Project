package com.jpcard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class JpcardApplication {

	public static void main(String[] args) {
		SpringApplication.run(JpcardApplication.class, args);
	}

	@org.springframework.context.annotation.Bean
	public org.springframework.boot.CommandLineRunner initData(com.jpcard.repository.PostRepository postRepository) {
		return args -> {
			boolean hasPosts = postRepository.findAll().stream().anyMatch(p -> !p.isNotice());
			if (!hasPosts) {
				createSamplePost(postRepository, "히라가나 외우는 팁 있을까요?", "이제 막 시작했는데 너무 헷갈리네요 ㅠㅠ 다들 어떻게 외우셨나요?", "일본어 초보");
				createSamplePost(postRepository, "한자 공부 순서 질문", "상용한자부터 해야하나요? 아니면 JLPT 급수별로 하는게 좋을까요?", "한자어렵다");
				createSamplePost(postRepository, "일본 드라마 추천해주세요!", "쉐도잉하기 좋은 드라마 찾고 있어요. 일상 회화 많이 나오는걸로 부탁드려요.",
						"일드매니아");
			}
		};
	}

	private void createSamplePost(com.jpcard.repository.PostRepository repository, String title, String content,
			String authorName) {
		com.jpcard.domain.post.Post post = new com.jpcard.domain.post.Post();
		post.setTitle(title);
		post.setContent(content);
		post.setAuthorName(authorName);
		post.setNotice(false);
		post.setLikeCount(0);
		// ipAddress can be null or dummy
		post.setIpAddress("127.0.0.1");
		repository.save(post);
	}

}
