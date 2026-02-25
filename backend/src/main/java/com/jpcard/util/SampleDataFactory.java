package com.jpcard.util;

import java.util.ArrayList;
import java.util.List;

public class SampleDataFactory {

    public record CardData(String term, String reading, String meaning) {
    }

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

    // ===== TEST ACCOUNT DATA =====

    public static List<CardData> getN5Kanji() {
        List<CardData> list = new ArrayList<>();
        list.add(new CardData("山", "やま", "산"));
        list.add(new CardData("川", "かわ", "강"));
        list.add(new CardData("田", "た", "논/밭"));
        list.add(new CardData("日", "ひ / にち", "해/날"));
        list.add(new CardData("月", "つき / げつ", "달"));
        list.add(new CardData("火", "ひ / か", "불/화요일"));
        list.add(new CardData("水", "みず / すい", "물/수요일"));
        list.add(new CardData("木", "き / もく", "나무/목요일"));
        list.add(new CardData("金", "かね / きん", "돈/금요일"));
        list.add(new CardData("土", "つち / ど", "흙/토요일"));
        list.add(new CardData("大", "おお / だい", "크다"));
        list.add(new CardData("小", "ちい / しょう", "작다"));
        list.add(new CardData("中", "なか / ちゅう", "가운데"));
        list.add(new CardData("上", "うえ / じょう", "위"));
        list.add(new CardData("下", "した / か", "아래"));
        list.add(new CardData("左", "ひだり / さ", "왼쪽"));
        list.add(new CardData("右", "みぎ / う", "오른쪽"));
        list.add(new CardData("口", "くち / こう", "입"));
        list.add(new CardData("目", "め / もく", "눈"));
        list.add(new CardData("耳", "みみ / じ", "귀"));
        return list;
    }

    public static List<CardData> getN4Grammar() {
        List<CardData> list = new ArrayList<>();
        list.add(new CardData("〜てもいい", "〜てもいい", "~해도 된다"));
        list.add(new CardData("〜てはいけない", "〜てはいけない", "~하면 안 된다"));
        list.add(new CardData("〜なければならない", "〜なければならない", "~해야 한다"));
        list.add(new CardData("〜たことがある", "〜たことがある", "~한 적이 있다"));
        list.add(new CardData("〜たり〜たりする", "〜たり〜たりする", "~하거나 ~하다"));
        list.add(new CardData("〜ようにする", "〜ようにする", "~하도록 하다"));
        list.add(new CardData("〜ようになる", "〜ようになる", "~하게 되다"));
        list.add(new CardData("〜ことにする", "〜ことにする", "~하기로 하다"));
        list.add(new CardData("〜ことになる", "〜ことになる", "~하게 되다 (결정)"));
        list.add(new CardData("〜そうだ(様態)", "〜そうだ", "~할 것 같다 (추측)"));
        list.add(new CardData("〜そうだ(伝聞)", "〜そうだ", "~라고 한다 (전문)"));
        list.add(new CardData("〜らしい", "〜らしい", "~인 것 같다"));
        list.add(new CardData("〜はずだ", "〜はずだ", "~할 것이다/~일 터이다"));
        list.add(new CardData("〜ために", "〜ために", "~하기 위해서"));
        list.add(new CardData("〜のに", "〜のに", "~인데도 불구하고"));
        list.add(new CardData("〜ば〜ほど", "〜ば〜ほど", "~하면 할수록"));
        list.add(new CardData("〜てあげる", "〜てあげる", "~해 주다"));
        list.add(new CardData("〜てもらう", "〜てもらう", "~해 받다"));
        list.add(new CardData("〜てくれる", "〜てくれる", "~해 주다 (상대방이)"));
        list.add(new CardData("〜させる", "〜させる", "~시키다 (사역)"));
        return list;
    }

    public static List<CardData> getN3Reading() {
        List<CardData> list = new ArrayList<>();
        list.add(new CardData("経験", "けいけん", "경험"));
        list.add(new CardData("環境", "かんきょう", "환경"));
        list.add(new CardData("影響", "えいきょう", "영향"));
        list.add(new CardData("関係", "かんけい", "관계"));
        list.add(new CardData("意見", "いけん", "의견"));
        list.add(new CardData("説明", "せつめい", "설명"));
        list.add(new CardData("準備", "じゅんび", "준비"));
        list.add(new CardData("連絡", "れんらく", "연락"));
        list.add(new CardData("予定", "よてい", "예정"));
        list.add(new CardData("相談", "そうだん", "상담"));
        list.add(new CardData("紹介", "しょうかい", "소개"));
        list.add(new CardData("参加", "さんか", "참가"));
        list.add(new CardData("利用", "りよう", "이용"));
        list.add(new CardData("確認", "かくにん", "확인"));
        list.add(new CardData("注意", "ちゅうい", "주의"));
        list.add(new CardData("比較", "ひかく", "비교"));
        list.add(new CardData("増加", "ぞうか", "증가"));
        list.add(new CardData("減少", "げんしょう", "감소"));
        list.add(new CardData("発展", "はってん", "발전"));
        list.add(new CardData("改善", "かいぜん", "개선"));
        return list;
    }

    public static List<CardData> getAdjectives() {
        List<CardData> list = new ArrayList<>();
        list.add(new CardData("嬉しい", "うれしい", "기쁘다"));
        list.add(new CardData("悲しい", "かなしい", "슬프다"));
        list.add(new CardData("楽しい", "たのしい", "즐겁다"));
        list.add(new CardData("難しい", "むずかしい", "어렵다"));
        list.add(new CardData("優しい", "やさしい", "친절하다/상냥하다"));
        list.add(new CardData("厳しい", "きびしい", "엄격하다"));
        list.add(new CardData("忙しい", "いそがしい", "바쁘다"));
        list.add(new CardData("涼しい", "すずしい", "시원하다"));
        list.add(new CardData("暖かい", "あたたかい", "따뜻하다"));
        list.add(new CardData("冷たい", "つめたい", "차갑다"));
        list.add(new CardData("明るい", "あかるい", "밝다"));
        list.add(new CardData("暗い", "くらい", "어둡다"));
        list.add(new CardData("新しい", "あたらしい", "새롭다"));
        list.add(new CardData("古い", "ふるい", "오래되다/낡다"));
        list.add(new CardData("広い", "ひろい", "넓다"));
        list.add(new CardData("狭い", "せまい", "좁다"));
        list.add(new CardData("深い", "ふかい", "깊다"));
        list.add(new CardData("浅い", "あさい", "얕다"));
        return list;
    }

    public static List<CardData> getBusinessJapanese() {
        List<CardData> list = new ArrayList<>();
        list.add(new CardData("お世話になっております", "おせわになっております", "항상 신세를 지고 있습니다"));
        list.add(new CardData("承知しました", "しょうちしました", "알겠습니다 (정중)"));
        list.add(new CardData("申し訳ございません", "もうしわけございません", "대단히 죄송합니다"));
        list.add(new CardData("ご確認ください", "ごかくにんください", "확인해 주세요"));
        list.add(new CardData("ご検討ください", "ごけんとうください", "검토해 주세요"));
        list.add(new CardData("お手数ですが", "おてすうですが", "번거로우시겠지만"));
        list.add(new CardData("お忙しいところ", "おいそがしいところ", "바쁘신 중에"));
        list.add(new CardData("ご連絡いたします", "ごれんらくいたします", "연락 드리겠습니다"));
        list.add(new CardData("打ち合わせ", "うちあわせ", "미팅/회의"));
        list.add(new CardData("議題", "ぎだい", "의제/안건"));
        list.add(new CardData("資料", "しりょう", "자료"));
        list.add(new CardData("提出", "ていしゅつ", "제출"));
        list.add(new CardData("報告", "ほうこく", "보고"));
        list.add(new CardData("締め切り", "しめきり", "마감/기한"));
        list.add(new CardData("担当", "たんとう", "담당"));
        return list;
    }

    public static List<CardData> getCulturalExpressions() {
        List<CardData> list = new ArrayList<>();
        list.add(new CardData("花見", "はなみ", "벚꽃놀이"));
        list.add(new CardData("花火", "はなび", "불꽃놀이"));
        list.add(new CardData("お正月", "おしょうがつ", "새해/설날"));
        list.add(new CardData("七夕", "たなばた", "칠석"));
        list.add(new CardData("お盆", "おぼん", "오봉(추석과 비슷)"));
        list.add(new CardData("紅葉", "もみじ", "단풍"));
        list.add(new CardData("温泉", "おんせん", "온천"));
        list.add(new CardData("着物", "きもの", "기모노/전통의상"));
        list.add(new CardData("浴衣", "ゆかた", "유카타"));
        list.add(new CardData("神社", "じんじゃ", "신사"));
        list.add(new CardData("お寺", "おてら", "절/사찰"));
        list.add(new CardData("茶道", "さどう", "다도"));
        list.add(new CardData("武道", "ぶどう", "무도"));
        list.add(new CardData("空手", "からて", "가라데"));
        list.add(new CardData("柔道", "じゅうどう", "유도"));
        return list;
    }

    public static List<CardData> getKatakanaLoanwords() {
        List<CardData> list = new ArrayList<>();
        list.add(new CardData("コンピューター", "こんぴゅーたー", "컴퓨터"));
        list.add(new CardData("インターネット", "いんたーねっと", "인터넷"));
        list.add(new CardData("スマートフォン", "すまーとふぉん", "스마트폰"));
        list.add(new CardData("アプリケーション", "あぷりけーしょん", "어플리케이션"));
        list.add(new CardData("プログラム", "ぷろぐらむ", "프로그램"));
        list.add(new CardData("デザイン", "でざいん", "디자인"));
        list.add(new CardData("エネルギー", "えねるぎー", "에너지"));
        list.add(new CardData("ボランティア", "ぼらんてぃあ", "자원봉사/볼런티어"));
        list.add(new CardData("コミュニケーション", "こみゅにけーしょん", "커뮤니케이션"));
        list.add(new CardData("レストラン", "れすとらん", "레스토랑"));
        list.add(new CardData("アレルギー", "あれるぎー", "알레르기"));
        list.add(new CardData("リサイクル", "りさいくる", "리사이클/재활용"));
        list.add(new CardData("マネジメント", "まねじめんと", "매니지먼트/관리"));
        list.add(new CardData("プレゼンテーション", "ぷれぜんてーしょん", "프레젠테이션/발표"));
        list.add(new CardData("カレンダー", "かれんだー", "달력/캘린더"));
        return list;
    }

    public static List<CardData> getDailyConversation() {
        List<CardData> list = new ArrayList<>();
        list.add(new CardData("ちょっと待ってください", "ちょっとまってください", "잠깐만 기다려 주세요"));
        list.add(new CardData("もう一度お願いします", "もういちどおねがいします", "한 번 더 부탁드립니다"));
        list.add(new CardData("分かりました", "わかりました", "알겠습니다"));
        list.add(new CardData("分かりません", "わかりません", "모르겠습니다"));
        list.add(new CardData("大丈夫です", "だいじょうぶです", "괜찮습니다"));
        list.add(new CardData("気をつけて", "きをつけて", "조심하세요"));
        list.add(new CardData("久しぶり", "ひさしぶり", "오랜만이야"));
        list.add(new CardData("お疲れ様です", "おつかれさまです", "수고하셨습니다"));
        list.add(new CardData("よろしくお願いします", "よろしくおねがいします", "잘 부탁드립니다"));
        list.add(new CardData("失礼します", "しつれいします", "실례합니다"));
        list.add(new CardData("何時ですか", "なんじですか", "몇 시입니까?"));
        list.add(new CardData("今何をしていますか", "いまなにをしていますか", "지금 뭐 하고 있어요?"));
        list.add(new CardData("どうしましたか", "どうしましたか", "무슨 일이에요?"));
        list.add(new CardData("いくらですか", "いくらですか", "얼마에요?"));
        list.add(new CardData("これをください", "これをください", "이것 주세요"));
        list.add(new CardData("お会計お願いします", "おかいけいおねがいします", "계산 부탁드립니다"));
        list.add(new CardData("すみません、道を教えてください", "すみません、みちをおしえてください", "실례합니다, 길 좀 알려주세요"));
        list.add(new CardData("写真を撮ってもいいですか", "しゃしんをとってもいいですか", "사진 찍어도 될까요?"));
        return list;
    }
}
