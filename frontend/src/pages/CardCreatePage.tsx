import { useEffect, useState } from "react";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Deck } from "../types/deck";

export default function CardCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedDeckId = searchParams.get("deckId");

  const [deckId, setDeckId] = useState(preSelectedDeckId || localStorage.getItem("lastDeckId") || "");
  const [decks, setDecks] = useState<Deck[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get<Deck[]>("/decks").then(res => setDecks(res.data)).catch(console.error);
  }, []);

  const selectedDeck = decks.find(d => d.id === Number(deckId));
  const fieldNames = selectedDeck?.fieldNames && selectedDeck.fieldNames.length > 0
      ? selectedDeck.fieldNames
      : ["Front", "Back"];

  const handleContentChange = (field: string, val: string) => {
      setContent(prev => ({ ...prev, [field]: val }));
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const term = content[fieldNames[0]] || "";
    const meaning = fieldNames.length > 1 ? content[fieldNames[1]] : "";

    try {
      if (deckId) localStorage.setItem("lastDeckId", String(deckId));
      await api.post("/cards", {
          term,
          meaning,
          deckId: deckId ? Number(deckId) : null,
      });
      if (deckId) {
          navigate(`/decks/${deckId}`);
      } else {
          navigate("/cards");
      }
    } catch (err) {
      console.error(err);
      setStatus("Failed to create card.");
    }
  };

  return (
    <Layout pageTitle="Create Card">
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <section className="glass-card" style={{ padding: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
             <h2 className="card-title" style={{ margin: 0 }}>New Flash Card</h2>
             <button className="secondary-btn" onClick={() => setContent({})} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
               Clear
             </button>
          </div>

          <form onSubmit={onCreate} style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            <div className="input-group">
               <label htmlFor="card-deck" className="input-label">Assign to Deck</label>
               <select
                 id="card-deck"
                 value={deckId}
                 onChange={e => setDeckId(e.target.value)}
               >
                  {decks.map(d => (
                  ))}
               </select>
            </div>

            {fieldNames.map((field, idx) => (
                <div key={idx} className="input-group">
                  <label className="input-label">{field}</label>
                  {idx === 0 ? (
                      <input
                        placeholder={`Enter ${field}`}
                        value={content[field] || ""}
                        onChange={(e) => handleContentChange(field, e.target.value)}
                        required
                      />
                  ) : (
                      <textarea
                        rows={idx === 1 ? 3 : 2}
                        placeholder={`Enter ${field}`}
                        value={content[field] || ""}
                        onChange={(e) => handleContentChange(field, e.target.value)}
                      />
                  )}
                </div>
            ))}

            <button type="submit" className="primary-btn" style={{ marginTop: 10, padding: "14px", fontSize: "1.1rem" }}>
              Add Card
            </button>
            {status && <p className="muted" style={{ textAlign: "center" }}>{status}</p>}
          </form>
        </section>
      </div>
      <style>{`
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .input-label {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
      `}</style>
    </Layout>
  );
}
