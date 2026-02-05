package com.jpcard.service;

import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class MockAiService implements AiService {

    private final Random random = new Random();

    @Override
    public String getResponse(String userMessage, String systemContext, String language) {
        // Normalize language
        String lang = (language != null) ? language.toLowerCase() : "en";
        
        // Simple dummy logic to simulate AI behavior
        if (userMessage.contains("학습") || userMessage.toLowerCase().contains("progress") || userMessage.contains("勉強")) {
            if ("ko".equals(lang)) {
                return "최근 활동을 분석해보니 오늘 12개의 카드를 복습하셨네요. 정답률은 85%입니다. 'Java 기초'는 아주 잘하고 계시지만 'Spring Boot' 개념은 복습이 좀 더 필요해 보입니다.";
            } else if ("ja".equals(lang)) {
                return "最近の活動に基づくと、今日は12枚のカードを復習しました。正解率は85%です。「Java Basics」は順調ですが、「Spring Boot」の概念をもう一度復習することをお勧めします。";
            } else {
                return "Based on your recent activity, you have reviewed 12 cards today. Your accuracy is 85%. You're doing great with 'Java Basics' but might want to review 'Spring Boot' concepts again.";
            }
        } else if (userMessage.contains("안녕") || userMessage.toLowerCase().contains("hello") || userMessage.contains("こんにちは")) {
             if ("ko".equals(lang)) {
                return "안녕하세요! 학습 도우미 AI입니다. 오늘 무엇을 도와드릴까요?";
            } else if ("ja".equals(lang)) {
                return "こんにちは！学習アシスタントAIです。今日はどのようなお手伝いをしましょうか？";
            } else {
                return "Hello! I am your AI study assistant. How can I help you today?";
            }
        } else if (userMessage.contains("추천") || userMessage.toLowerCase().contains("recommend") || userMessage.contains("おすすめ")) {
             if ("ko".equals(lang)) {
                 return "오늘의 추천 학습은 'Advanced Vocabulary' 덱입니다. 5개의 새로운 카드가 기다리고 있습니다.";
            } else if ("ja".equals(lang)) {
                 return "今日の推奨学習は「Advanced Vocabulary」デッキです。5枚の新しいカードが待っています。";
            } else {
                 return "Today's recommendation is the 'Advanced Vocabulary' deck. 5 new cards are waiting for you.";
            }
        }
        
        String[] defaultResponses;
        
        if ("ko".equals(lang)) {
             defaultResponses = new String[]{
                "그 부분은 흥미로운 질문이네요. 학습 로그를 기반으로 분석해보면...", 
                "조금 더 구체적으로 말씀해 주시겠어요?", 
                "네, 알겠습니다. 학습에 도움이 되도록 기록해두겠습니다."
            };
        } else if ("ja".equals(lang)) {
             defaultResponses = new String[]{
                "それは興味深い質問ですね。学習ログに基づいて分析してみると...", 
                "もう少し具体的にお話しいただけますか？", 
                "はい、分かりました。学習の役に立つように記録しておきます。"
            };
        } else {
             defaultResponses = new String[]{
                "That's an interesting question. Based on your learning logs...", 
                "Could you be more specific?", 
                "I see. I'll make a note of that to help with your studies."
            };
        }
        
        return defaultResponses[random.nextInt(defaultResponses.length)];
    }
}
