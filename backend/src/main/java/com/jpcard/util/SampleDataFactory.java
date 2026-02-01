package com.jpcard.util;

import java.util.ArrayList;
import java.util.List;

public class SampleDataFactory {

    public record CardData(String term, String reading, String meaning) {}

    public static List<CardData> getN5Basics() {
        List<CardData> list = new ArrayList<>();
        // Numbers
        list.add(new CardData("一", "いち", "일 (1)"));
        list.add(new CardData("二", "に", "이 (2)"));
        list.add(new CardData("三", "さん", "삼 (3)"));
        list.add(new CardData("四", "よん / し", "사 (4)"));
        list.add(new CardData("五", "ご", "오 (5)"));
        list.add(new CardData("六", "ろく", "육 (6)"));
        list.add(new CardData("七", "なな / しち", "칠 (7)"));
        list.add(new CardData("八", "はち", "팔 (8)"));
        list.add(new CardData("九", "きゅう / く", "구 (9)"));
        list.add(new CardData("十", "じゅう", "십 (10)"));
        list.add(new CardData("百", "ひゃく", "백 (100)"));
        list.add(new CardData("千", "せん", "천 (1000)"));
        list.add(new CardData("万", "まん", "만 (10000)"));
        // Time
        list.add(new CardData("今", "いま", "지금"));
        list.add(new CardData("今日", "きょう", "오늘"));
        list.add(new CardData("明日", "あした", "내일"));
        list.add(new CardData("昨日", "きのう", "어제"));
        list.add(new CardData("毎日", "まいにち", "매일"));
        list.add(new CardData("朝", "あさ", "아침"));
        list.add(new CardData("昼", "ひる", "점심/낮"));
        list.add(new CardData("晩", "ばん", "저녁/밤"));
        list.add(new CardData("夜", "よる", "밤"));
        list.add(new CardData("時", "じ", "~시"));
        list.add(new CardData("分", "ふん / ぶん", "~분"));
        list.add(new CardData("週", "しゅう", "주"));
        list.add(new CardData("年", "とし", "해/년"));
        // Basic Verbs
        list.add(new CardData("食べる", "たべる", "먹다"));
        list.add(new CardData("飲む", "のむ", "마시다"));
        list.add(new CardData("見る", "みる", "보다"));
        list.add(new CardData("聞く", "きく", "듣다"));
        list.add(new CardData("行く", "いく", "가다"));
        list.add(new CardData("来る", "くる", "오다"));
        list.add(new CardData("帰る", "かえる", "돌아가다/귀가하다"));
        list.add(new CardData("話す", "はなす", "말하다"));
        list.add(new CardData("読む", "よむ", "읽다"));
        list.add(new CardData("書く", "かく", "쓰다"));
        list.add(new CardData("買う", "かう", "사다"));
        list.add(new CardData("売る", "うる", "팔다"));
        list.add(new CardData("起きる", "おきる", "일어나다"));
        list.add(new CardData("寝る", "ねる", "자다"));
        list.add(new CardData("会う", "あう", "만나다"));
        list.add(new CardData("遊ぶ", "あそぶ", "놀다"));
        list.add(new CardData("泳ぐ", "およぐ", "헤엄치다"));
        list.add(new CardData("待つ", "まつ", "기다리다"));
        list.add(new CardData("持つ", "もつ", "들다/가지다"));
        list.add(new CardData("入る", "はいる", "들어가다"));
        list.add(new CardData("出る", "でる", "나가다/나오다"));
        return list;
    }

    public static List<CardData> getDailyLife() {
        List<CardData> list = new ArrayList<>();
        // Family
        list.add(new CardData("家族", "かぞく", "가족"));
        list.add(new CardData("私", "わたし", "나/저"));
        list.add(new CardData("父", "ちち", "아버지 (내 가족)"));
        list.add(new CardData("母", "はは", "어머니 (내 가족)"));
        list.add(new CardData("兄", "あに", "형/오빠 (내 가족)"));
        list.add(new CardData("姉", "あね", "누나/언니 (내 가족)"));
        list.add(new CardData("弟", "おとうと", "남동생"));
        list.add(new CardData("妹", "いもうと", "여동생"));
        list.add(new CardData("夫", "おっと", "남편"));
        list.add(new CardData("妻", "つま", "아내"));
        list.add(new CardData("男", "おとこ", "남자"));
        list.add(new CardData("女", "おんな", "여자"));
        list.add(new CardData("人", "ひと", "사람"));
        list.add(new CardData("子供", "こども", "아이"));
        // Food
        list.add(new CardData("ご飯", "ごはん", "밥"));
        list.add(new CardData("パン", "ぱん", "빵"));
        list.add(new CardData("水", "みず", "물"));
        list.add(new CardData("肉", "にく", "고기"));
        list.add(new CardData("魚", "さかな", "생선"));
        list.add(new CardData("野菜", "やさい", "야채"));
        list.add(new CardData("果物", "くだもの", "과일"));
        list.add(new CardData("卵", "たまご", "달걀"));
        list.add(new CardData("牛乳", "ぎゅうにゅう", "우유"));
        list.add(new CardData("お茶", "おちゃ", "차/녹차"));
        list.add(new CardData("酒", "さけ", "술"));
        list.add(new CardData("りんご", "りんご", "사과"));
        list.add(new CardData("バナナ", "ばなな", "바나나"));
        // Household
        list.add(new CardData("家", "いえ", "집"));
        list.add(new CardData("部屋", "へや", "방"));
        list.add(new CardData("机", "つくえ", "책상"));
        list.add(new CardData("椅子", "いす", "의자"));
        list.add(new CardData("窓", "まど", "창문"));
        list.add(new CardData("ドア", "どあ", "문"));
        list.add(new CardData("テレビ", "てれび", "텔레비전"));
        list.add(new CardData("電話", "でんわ", "전화"));
        list.add(new CardData("時計", "とけい", "시계"));
        list.add(new CardData("鍵", "かぎ", "열쇠"));
        list.add(new CardData("服", "ふく", "옷"));
        list.add(new CardData("靴", "くつ", "신발"));
        list.add(new CardData("鞄", "かばん", "가방"));
        list.add(new CardData("財布", "さいふ", "지갑"));
        list.add(new CardData("傘", "かさ", "우산"));
        list.add(new CardData("本", "ほん", "책"));
        list.add(new CardData("新聞", "しんぶん", "신문"));
        list.add(new CardData("車", "くるま", "차/자동차"));
        list.add(new CardData("自転車", "じてんしゃ", "자전거"));
        list.add(new CardData("犬", "いぬ", "개"));
        list.add(new CardData("猫", "ねこ", "고양이"));
        return list;
    }

    public static List<CardData> getTravelAndGreetings() {
        List<CardData> list = new ArrayList<>();
        // Greetings
        list.add(new CardData("おはよう", "おはよう", "좋은 아침입니다 (반말)"));
        list.add(new CardData("こんにちは", "こんにちは", "안녕하세요 (점심)"));
        list.add(new CardData("こんばんは", "こんばんは", "안녕하세요 (저녁)"));
        list.add(new CardData("さようなら", "さようなら", "안녕히 가세요 (작별)"));
        list.add(new CardData("ありがとう", "ありがとう", "고마워"));
        list.add(new CardData("すみません", "すみません", "죄송합니다/저기요"));
        list.add(new CardData("ごめんなさい", "ごめんなさい", "미안합니다"));
        list.add(new CardData("はい", "はい", "네"));
        list.add(new CardData("いいえ", "いいえ", "아니요"));
        list.add(new CardData("お願いします", "おねがいします", "부탁합니다"));
        list.add(new CardData("はじめまして", "はじめまして", "처음 뵙겠습니다"));
        list.add(new CardData("いただきます", "いただきます", "잘 먹겠습니다"));
        list.add(new CardData("ごちそうさま", "ごちそうさま", "잘 먹었습니다"));
        list.add(new CardData("お元気ですか", "おげんきですか", "잘 지내시나요?"));
        // Travel
        list.add(new CardData("駅", "えき", "역"));
        list.add(new CardData("電車", "でんしゃ", "전철"));
        list.add(new CardData("バス", "ばす", "버스"));
        list.add(new CardData("空港", "くうこう", "공항"));
        list.add(new CardData("飛行機", "ひこうき", "비행기"));
        list.add(new CardData("切符", "きっぷ", "표/티켓"));
        list.add(new CardData("ホテル", "ほてる", "호텔"));
        list.add(new CardData("地図", "ちず", "지도"));
        list.add(new CardData("写真", "しゃしん", "사진"));
        list.add(new CardData("パスポート", "ぱすぽーと", "여권"));
        list.add(new CardData("荷物", "にもつ", "짐"));
        list.add(new CardData("トイレ", "といれ", "화장실"));
        list.add(new CardData("入り口", "いりぐち", "입구"));
        list.add(new CardData("出口", "でぐち", "출구"));
        list.add(new CardData("右", "みぎ", "오른쪽"));
        list.add(new CardData("左", "ひだり", "왼쪽"));
        list.add(new CardData("上", "うえ", "위"));
        list.add(new CardData("下", "した", "아래"));
        list.add(new CardData("前", "まえ", "앞"));
        list.add(new CardData("後ろ", "うしろ", "뒤"));
        list.add(new CardData("遠い", "とおい", "멀다"));
        list.add(new CardData("近い", "ちかい", "가깝다"));
        list.add(new CardData("楽しい", "たのしい", "즐겁다"));
        list.add(new CardData("美味しい", "おいしい", "맛있다"));
        list.add(new CardData("いくら", "いくら", "얼마"));
        list.add(new CardData("どこ", "どこ", "어디"));
        list.add(new CardData("いつ", "いつ", "언제"));
        return list;
    }
}
