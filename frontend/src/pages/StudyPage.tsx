import { useEffect, useState } from "react";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import FlashCard from "../components/FlashCard";
import type { Card } from "../types/card";
import type { Deck } from "../types/deck";
import { useSearchParams, Link } from "react-router-dom";
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

export default function StudyPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const deckId = searchParams.get("deckId");

  const [cards, setCards] = useState<Card[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

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
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const currentCard = cards[currentIndex];

  // 카드가 바뀔 때마다 앞면으로 초기화 (다음 카드에서 답이 보이지 않도록)
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const handleReview = async (rating: string) => {
    if (!currentCard) return;
    try {
        await api.post("/study/review", { cardId: currentCard.id, rating });

        // 카드 앞면으로 돌아가는 모션 재생 (0.6초)
        setIsFlipped(false);
        await new Promise(resolve => setTimeout(resolve, 600));

        // If 'FAIL', re-queue the card at the end of the session
        let nextCards = [...cards];
        if (rating === 'FAIL') {
            nextCards.push(currentCard);
        }

        if (currentIndex < nextCards.length - 1) {
            setCards(nextCards); // Update queue if we added something (or just to be safe)
            setCurrentIndex(prev => prev + 1);
        } else {
            setCards([]); // Trigger session complete
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
                        <button className="secondary-btn" onClick={() => window.location.href = '/dashboard'}>{t("study.finish_btn")}</button>
                        <button className="primary-btn" onClick={() => fetchCards(true)}>{t("study.study_more")}</button>
                    </div>
                </>
            ) : (
                <>
                    <h2 className="card-title">{t("study.caught_up")}</h2>
                    <p className="muted">{t("study.no_due_cards")}</p>
                    <div style={{ marginTop: 20 }}>
                        <button className="secondary-btn" onClick={() => window.location.href = '/dashboard'}>{t("study.return_dashboard")}</button>
                    </div>
                </>
            )}
         </section>
      </Layout>
    );
  }

  return (
    <Layout pageTitle={t("study.title")}>
      {/* Counters */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 10, fontSize: '0.9rem', color: '#333' }}>
         <span>{t("study.due_label")}: {stats.dueCardsCount}</span>
         <span>|</span>
         <span>{t("study.new_label")}: {stats.newCardsCount}</span>
      </div>

      <FlashCard
        key={currentCard.id}
        card={currentCard}
        isFlipped={isFlipped}
        onFlip={() => setIsFlipped(!isFlipped)}
        onReview={handleReview}
      />
    </Layout>
  );
}
