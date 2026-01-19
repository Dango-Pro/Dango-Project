import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import type { Deck } from "../types/deck";

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([]);

  useEffect(() => {
      .then((res) => {
        setDecks(res.data);
      })
      .catch((err) => {
        console.error(err);
      });

  return (
      <div className="glass-card" style={{ marginBottom: 20 }}>
        <div className="card-header">
           <div style={{ display: 'flex', gap: 10 }}>
           </div>
        </div>
        <p className="muted">{status}</p>

        <div className="card-grid" style={{ marginTop: 20 }}>
          {decks.map((deck) => (
             <article key={deck.id} className="item-tile">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <h3 className="item-title">{deck.name}</h3>
                        <p className="item-subtitle">{deck.description}</p>
                    </div>
                    <Link to={`/study?deckId=${deck.id}`} className="primary-btn" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                    </Link>
                </div>
                <div style={{ marginTop: 10 }}>
                </div>
             </article>
          ))}
        </div>
      </div>

      <div className="glass-card">
         <div className="card-header">
         </div>
      </div>
    </Layout>
  );
}
