import { useEffect, useState } from "react";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import type { Card } from "../types/card";
import type { Deck } from "../types/deck";
import { useSearchParams, Link } from "react-router-dom";
import "../App.css";

interface StudySessionResponse {
  cards: Card[];
  limitReached: boolean;
  newCardsCount: number;
  dueCardsCount: number;
  newCardsStudiedToday: number;
  dailyLimit: number;
}

export default function StudyPage() {
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

  const handleReview = async (rating: string) => {
    if (!currentCard) return;
    try {
        await api.post("/study/review", { cardId: currentCard.id, rating });

        setIsFlipped(false);
            setCurrentIndex(prev => prev + 1);
        } else {
            setCards([]); // Trigger session complete
        }
    } catch (err) {
        console.error(err);
    }
  };


  // Deck Selection View
  if (!deckId) {
      return (
            <div className="glass-card">
                {decks.length === 0 ? (
                ) : (
                    <div className="card-grid">
                        {decks.map(d => (
                            <Link key={d.id} to={`/study?deckId=${d.id}`} className="item-tile" style={{ display: 'block', textDecoration: 'none' }}>
                                <h3 className="item-title">{d.name}</h3>
                                <p className="item-subtitle">{d.description}</p>
                                <div style={{ marginTop: 10, color: '#1890ff', fontSize: '0.9rem' }}>
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
         <section className="glass-card" style={{ textAlign: "center", padding: "40px 20px" }}>
            {stats.limitReached ? (
                <>
                    <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center' }}>
                    </div>
                </>
            ) : (
                <>
                    <div style={{ marginTop: 20 }}>
                    </div>
                </>
            )}
         </section>
      </Layout>
    );
  }

  return (
      {/* Counters */}
         <span>|</span>
      </div>

    </Layout>
  );
}
