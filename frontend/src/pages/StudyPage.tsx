import { useEffect, useState } from "react";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import FlashCard from "../components/FlashCard";
import type { Card } from "../types/card";
import type { Deck } from "../types/deck";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import "../App.css";
import { useTranslation } from "react-i18next";

interface StudySessionResponse {
  cards: Card[];
  limitReached: boolean;
  newCardsCount: number;
  dueCardsCount: number;
  newCardsStudiedToday: number;
  dailyLimit: number;
}

// 내 버전: 복습 주기 프리뷰 인터페이스
interface IntervalPreview {
  failMinutes: number;
  hardMinutes: number;
  goodMinutes: number;
  easyMinutes: number;
}

// 내 버전: FAIL 카드 최대 재시도 횟수
const MAX_FAIL_RETRIES = 3;

export default function StudyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate(); // 내 버전: SPA 라우팅 유지
  const [searchParams] = useSearchParams();
  const deckId = searchParams.get("deckId");

  const [cards, setCards] = useState<Card[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // 내 버전: 프리뷰 및 실패 카운트 상태
  const [intervalPreview, setIntervalPreview] = useState<IntervalPreview | null>(null);
  const [failCounts, setFailCounts] = useState<Map<number, number>>(new Map());

  const [stats, setStats] = useState({
      limitReached: false,
      newCardsCount: 0,
      dueCardsCount: 0,
      newCardsStudiedToday: 0,
      dailyLimit: 20
  });

  useEffect(() => {
    if (deckId) {
        fetchCards(false);
    } else {
        fetchDecks();
    }
  }, [deckId]);

  // 내 버전: 현재 카드가 바뀔 때마다 interval preview 가져오기
  useEffect(() => {
    if (cards.length > 0 && currentIndex < cards.length) {
      const cardId = cards[currentIndex].id;
      api.get<IntervalPreview>(`/study/preview?cardId=${cardId}`)
        .then(res => setIntervalPreview(res.data))
        .catch(() => setIntervalPreview(null));
    } else {
      setIntervalPreview(null);
    }
  }, [cards, currentIndex]);

  // 상대 버전: 카드가 바뀔 때마다 앞면으로 초기화 (안전장치)
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const fetchDecks = () => {
      setLoading(true);
      api.get<Deck[]>("/decks")
         .then(res => setDecks(res.data))
         .catch(console.error)
         .finally(() => setLoading(false));
  };

  const fetchCards = (studyMore: boolean) => {
    setLoading(true);

    const params = new URLSearchParams();
    if (deckId) params.append("deckId", deckId);
    params.append("studyMore", String(studyMore));

    api
      .get<StudySessionResponse>(`/study/due?${params.toString()}`)
      .then((res) => {
        setCards(res.data.cards);
        setStats({
            limitReached: res.data.limitReached,
            newCardsCount: res.data.newCardsCount,
            dueCardsCount: res.data.dueCardsCount,
            newCardsStudiedToday: res.data.newCardsStudiedToday,
            dailyLimit: res.data.dailyLimit
        });
        setCurrentIndex(0);
        setIsFlipped(false);
        setIntervalPreview(null);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const currentCard = cards[currentIndex];

  const handleReview = async (rating: string) => {
    if (!currentCard) return;
    try {
        await api.post("/study/review", { cardId: currentCard.id, rating });

        // 상대 버전: 카드 앞면으로 돌아가는 모션 재생 대기 (0.6초)
        setIsFlipped(false);
        await new Promise(resolve => setTimeout(resolve, 600));

        let nextCards = [...cards];

        if (rating === 'FAIL') {
            // 내 버전: 재시도 횟수 카운트 & MAX_FAIL_RETRIES 이하일 때만 추가
            const newFailCounts = new Map(failCounts);
            const count = (newFailCounts.get(currentCard.id) ?? 0) + 1;
            newFailCounts.set(currentCard.id, count);
            setFailCounts(newFailCounts);

            if (count < MAX_FAIL_RETRIES) {
                nextCards.push(currentCard);
            }
        }

        // 내 버전: 현재 카드를 큐에서 제거하는 방식 채택
        // (상대 버전의 key={currentCard.id} 덕분에 애니메이션은 문제없이 동작합니다)
        const remaining = nextCards.filter((_, idx) => idx !== currentIndex);
        if (remaining.length > 0) {
            setCards(remaining);
            setCurrentIndex(prev => Math.min(prev, remaining.length - 1));
        } else {
            setCards([]); // 세션 완료
        }
    } catch (err) {
        console.error(err);
    }
  };

  if (loading) return <Layout pageTitle={t("study.title")}><p className="muted">{t("common.loading")}</p></Layout>;

  // Deck Selection View
  if (!deckId) {
      return (
        <Layout pageTitle={t("study.choose_deck")}>
            <div className="glass-card">
                <h2 className="card-title" style={{ marginBottom: 20 }}>{t("study.choose_deck")}</h2>
                {decks.length === 0 ? (
                    <p className="muted">{t("study.no_decks")} <Link to="/decks/create" style={{ textDecoration: "underline" }}>{t("study.create_deck_link")}</Link></p>
                ) : (
                    <div className="card-grid">
                        {decks.map(d => (
                            <Link key={d.id} to={`/study?deckId=${d.id}`} className="item-tile" style={{ display: 'block', textDecoration: 'none' }}>
                                <h3 className="item-title">{d.name}</h3>
                                <p className="item-subtitle">{d.description}</p>
                                <div style={{ marginTop: 10, color: '#1890ff', fontSize: '0.9rem' }}>
                                    {t("study.start_session")} &rarr;
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
      );
  }

  // Session Complete View
  if (cards.length === 0) {
    return (
      <Layout pageTitle={t("study.title")}>
         <section className="glass-card" style={{ textAlign: "center", padding: "40px 20px" }}>
            {stats.limitReached ? (
                <>
                    <h2 className="card-title">{t("study.daily_goal")} ({stats.newCardsStudiedToday}/{stats.dailyLimit})</h2>
                    <p className="muted">{t("study.daily_goal_msg")}</p>
                    <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center' }}>
                        {/* 내 버전: useNavigate 라우팅 방식 적용 */}
                        <button className="secondary-btn" onClick={() => navigate('/dashboard')}>{t("study.finish_btn")}</button>
                        <button className="primary-btn" onClick={() => fetchCards(true)}>{t("study.study_more")}</button>
                    </div>
                </>
            ) : (
                <>
                    <h2 className="card-title">{t("study.caught_up")}</h2>
                    <p className="muted">{t("study.no_due_cards")}</p>
                    <div style={{ marginTop: 20 }}>
                        <button className="secondary-btn" onClick={() => navigate('/dashboard')}>{t("study.return_dashboard")}</button>
                    </div>
                </>
            )}
         </section>
      </Layout>
    );
  }

  return (
    <Layout pageTitle={t("study.title")}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 10, fontSize: '0.9rem', color: '#333' }}>
         <span>{t("study.due_label")}: {stats.dueCardsCount}</span>
         <span>|</span>
         <span>{t("study.new_label")}: {stats.newCardsCount}</span>
      </div>

      <FlashCard
        key={currentCard.id} /* 상대 버전: 카드 변경 시 마운트/애니메이션 강제 리셋 */
        card={currentCard}
        isFlipped={isFlipped}
        onFlip={() => setIsFlipped(!isFlipped)}
        onReview={handleReview}
        intervalPreview={intervalPreview} /* 내 버전: 복습 주기 프리뷰 전달 */
      />
    </Layout>
  );
}