import { useEffect, useState } from "react";
import { api } from "../libs/api";
import { speak } from "../libs/tts";
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
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setCards([]); // Trigger session complete
        }
    } catch (err) {
        console.error(err);
    }
  };

  if (loading) return <Layout pageTitle="Study Mode"><p className="muted">Loading...</p></Layout>;

  // Deck Selection View
  if (!deckId) {
      return (
        <Layout pageTitle="Select Deck">
            <div className="glass-card">
                <h2 className="card-title" style={{ marginBottom: 20 }}>Choose a Deck to Study</h2>
                {decks.length === 0 ? (
                    <p className="muted">No decks found. <Link to="/decks/create" style={{ textDecoration: "underline" }}>Create one?</Link></p>
                ) : (
                    <div className="card-grid">
                        {decks.map(d => (
                            <Link key={d.id} to={`/study?deckId=${d.id}`} className="item-tile" style={{ display: 'block', textDecoration: 'none' }}>
                                <h3 className="item-title">{d.name}</h3>
                                <p className="item-subtitle">{d.description}</p>
                                <div style={{ marginTop: 10, color: '#1890ff', fontSize: '0.9rem' }}>
                                    Start Session &rarr;
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
      <Layout pageTitle="Study Mode">
         <section className="glass-card" style={{ textAlign: "center", padding: "40px 20px" }}>
            {stats.limitReached ? (
                <>
                    <h2 className="card-title">Daily Goal Reached! ({stats.newCardsStudiedToday}/{stats.dailyLimit})</h2>
                    <p className="muted">Great job! You've hit your daily limit for new cards.</p>
                    <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center' }}>
                        <button className="secondary-btn" onClick={() => window.location.href = '/dashboard'}>Finish</button>
                        <button className="primary-btn" onClick={() => fetchCards(true)}>Study More (+10)</button>
                    </div>
                </>
            ) : (
                <>
                    <h2 className="card-title">All caught up!</h2>
                    <p className="muted">No cards due for review right now.</p>
                    <div style={{ marginTop: 20 }}>
                        <button className="secondary-btn" onClick={() => window.location.href = '/dashboard'}>Return to Dashboard</button>
                    </div>
                </>
            )}
         </section>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Study Mode">
      {/* Counters */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 10, fontSize: '0.9rem', color: '#ccc' }}>
         <span>Due: {stats.dueCardsCount}</span>
         <span>|</span>
         <span>New: {stats.newCardsCount}</span>
      </div>

      <div className="study-container">
        <div
          className={`flash-card ${isFlipped ? "flipped" : ""}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="card-face card-front">
            <span className="card-label">TERM</span>
            <h2>{currentCard.term}</h2>
            <button
              className="icon-btn"
              onClick={(e) => { e.stopPropagation(); speak(currentCard.term); }}
              style={{ position: 'absolute', top: 16, right: 16 }}
            >
              🔊
            </button>
            <p className="click-hint">Click to flip</p>
          </div>
          <div className="card-face card-back">
            <span className="card-label">MEANING</span>
            <h2>{currentCard.meaning}</h2>
            <button
              className="icon-btn"
              onClick={(e) => { e.stopPropagation(); speak(currentCard.meaning, "en-US"); }}
              style={{ position: 'absolute', top: 16, right: 16 }}
            >
              🔊
            </button>
          </div>
        </div>

        {!isFlipped ? (
            <div className="controls" style={{ marginTop: 20 }}>
               <p className="muted">Tap card to see meaning</p>
            </div>
        ) : (
            <div className="action-row" style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
               <button className="nav-btn" style={{ borderColor: '#ff4d4f', color: '#ff4d4f' }} onClick={() => handleReview("FAIL")}>
                 Again (&lt;1m)
               </button>
               <button className="nav-btn" style={{ borderColor: '#faad14', color: '#faad14' }} onClick={() => handleReview("HARD")}>
                 Hard (12h)
               </button>
               <button className="nav-btn" style={{ borderColor: '#52c41a', color: '#52c41a' }} onClick={() => handleReview("GOOD")}>
                 Good (1d)
               </button>
               <button className="nav-btn" style={{ borderColor: '#1890ff', color: '#1890ff' }} onClick={() => handleReview("EASY")}>
                 Easy (4d)
               </button>
            </div>
        )}
      </div>

      <style>{`
        .study-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        .flash-card {
          width: 100%;
          max-width: 400px;
          height: 250px;
          position: relative;
          perspective: 1000px;
          cursor: pointer;
        }
        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          transition: transform 0.6s;
          background: rgba(20, 20, 20, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 20px;
          text-align: center;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
        }
        .card-front {
          transform: rotateY(0deg);
        }
        .flipped .card-front {
          transform: rotateY(180deg);
        }
        .card-back {
          transform: rotateY(180deg);
        }
        .flipped .card-back {
          transform: rotateY(0deg);
        }
        .card-label {
          position: absolute;
          top: 16px;
          left: 16px;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .click-hint {
          position: absolute;
          bottom: 16px;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.3);
        }
        .controls {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .nav-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nav-btn:hover {
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </Layout>
  );
}
