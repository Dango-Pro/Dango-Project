import { useEffect, useState } from "react";
import { api } from "../libs/api";
import { speak } from "../libs/tts";
import Layout from "../components/Layout";
import { Link, useParams } from "react-router-dom";
import type { Card } from "../types/card";
import type { Deck } from "../types/deck";

export default function DeckDetailPage() {
  const { id } = useParams();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    api.get<Deck>(`/decks/${id}`).then(res => setDeck(res.data)).catch(console.error);
    api.get<Card[]>(`/cards?deckId=${id}`).then(res => {
        setCards(res.data);
        setStatus(res.data.length ? "" : "No cards in this deck.");
    }).catch(() => setStatus("Failed to load cards."));
  }, [id]);

  if (!deck) return <Layout><p className="muted">Loading deck...</p></Layout>;

  return (
    <Layout pageTitle={deck.name}>
      <section className="glass-card">
        <div className="card-header">
          <h2 className="card-title">{deck.name}</h2>
          <div style={{ display: 'flex', gap: 10 }}>
             <Link to={`/study?deckId=${id}`} className="primary-btn" style={{ background: 'linear-gradient(135deg, #1890ff, #096dd9)', borderColor: 'transparent' }}>
               Study Now
             </Link>
             <Link to={`/cards/create?deckId=${id}`} className="secondary-btn">
               Add Card
             </Link>
             <Link to={`/decks/${id}/edit`} className="secondary-btn">
               Edit
             </Link>
          </div>
        </div>
        <p className="item-subtitle" style={{ marginBottom: 20 }}>{deck.description}</p>

        {status && <p className="muted" style={{marginTop: 10}}>{status}</p>}

        <div className="card-grid" style={{ marginTop: 14 }}>
          {cards.map((c) => (
            <article key={c.id} className="item-tile">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                     <h3 className="item-title">{c.term}</h3>
                     <button className="icon-btn" onClick={() => speak(c.term)} style={{ fontSize: "0.8rem", padding: "2px 6px" }}>🔊</button>
                  </div>
                  <p className="item-subtitle">{c.meaning}</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                   <Link to={`/cards/${c.id}/edit`} className="muted" style={{ fontSize: "0.8rem", textDecoration: "underline" }}>Edit</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </Layout>
  );
}
