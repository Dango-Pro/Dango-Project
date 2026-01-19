import { useEffect, useState } from "react";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import type { Deck } from "../types/deck";

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [status, setStatus] = useState("Loading decks...");

  useEffect(() => {
    api
      .get<Deck[]>("/decks")
      .then((res) => {
        setDecks(res.data);
        setStatus(res.data.length ? "Select a deck to study" : "No decks yet. Create one!");
      })
      .catch((err) => {
        console.error(err);
        setStatus("Failed to load decks.");
      });
  }, []);

  return (
    <Layout pageTitle="Decks">
      <div className="glass-card" style={{ marginBottom: 20 }}>
        <div className="card-header">
           <h2 className="card-title">My Decks</h2>
           <div style={{ display: 'flex', gap: 10 }}>
             <Link to="/cards/create" className="secondary-btn">New Card</Link>
             <Link to="/decks/create" className="primary-btn">Create Deck</Link>
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
                        Study
                    </Link>
                </div>
                <div style={{ marginTop: 10 }}>
                   <Link to={`/decks/${deck.id}`} className="muted" style={{ textDecoration: 'underline', fontSize: '0.9rem' }}>View Details / Cards</Link>
                </div>
             </article>
          ))}
        </div>
      </div>

      <div className="glass-card">
         <div className="card-header">
           <h3 className="item-title">All Cards</h3>
           <Link to="/cards" className="muted" style={{ textDecoration: 'underline' }}>View all cards without deck</Link>
         </div>
      </div>
    </Layout>
  );
}
