import { useEffect, useState } from "react";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import type { Card } from "../types/card";
import type { Deck } from "../types/deck";

export default function CardEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deckId, setDeckId] = useState<string>("");
  const [decks, setDecks] = useState<Deck[]>([]);
  const [content, setContent] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchData = async () => {
        try {
            const decksRes = await api.get<Deck[]>("/decks");
            const decksData = decksRes.data;
            setDecks(decksData);

            const cardRes = await api.get<Card>(`/cards/${id}`);
            const card = cardRes.data;

            setDeckId(card.deckId ? String(card.deckId) : "");

            let parsedContent = {};
            try {
                if (card.contentJson) parsedContent = JSON.parse(card.contentJson);
            } catch (e) {
                console.error("Failed to parse contentJson", e);
            }

            // Fallback for legacy cards without contentJson
            if (Object.keys(parsedContent).length === 0) {
                // Determine fields based on deck
                const deck = decksData.find(d => d.id === card.deckId);
                const fields = deck?.fieldNames && deck.fieldNames.length > 0 ? deck.fieldNames : ["Front", "Back"];

                parsedContent = {};
                if (fields.length > 0) parsedContent[fields[0]] = card.term;
                if (fields.length > 1) parsedContent[fields[1]] = card.meaning;
            }
            setContent(parsedContent);

        } catch (err) {
            console.error(err);
            setStatus("Failed to load data.");
        }
    };
    fetchData();
  }, [id]);

  const getCurrentFields = (dId: string) => {
      const d = decks.find(d => d.id === Number(dId));
      return d?.fieldNames && d.fieldNames.length > 0 ? d.fieldNames : ["Front", "Back"];
  };

  const handleDeckChange = (newDeckId: string) => {
      const oldFields = getCurrentFields(deckId);
      const newFields = getCurrentFields(newDeckId);

      if (newFields.length < oldFields.length) {
          if (!window.confirm("필드 수가 줄어들어 일부 정보가 삭제될 수 있습니다. 계속하시겠습니까?")) {
              return;
          }
      }

      const newContent: Record<string, string> = {};
      newFields.forEach((field, i) => {
          if (i < oldFields.length) {
              const oldKey = oldFields[i];
              newContent[field] = content[oldKey] || "";
          } else {
              newContent[field] = "";
          }
      });

      setContent(newContent);
      setDeckId(newDeckId);
  };

  const handleContentChange = (field: string, val: string) => {
      setContent(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentFields = getCurrentFields(deckId);
    const term = content[currentFields[0]] || "";
    const meaning = currentFields.length > 1 ? content[currentFields[1]] : "";

    try {
      await api.put(`/cards/${id}`, {
          term,
          meaning,
          deckId: deckId ? Number(deckId) : null,
          content
      });
      if (deckId) {
          navigate(`/decks/${deckId}`);
      } else {
          navigate("/cards");
      }
    } catch (err) {
      console.error(err);
      setStatus("수정에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
      if (!window.confirm("Are you sure you want to delete this card?")) {
          return;
      }
      try {
          await api.delete(`/cards/${id}`);
          if (deckId) {
              navigate(`/decks/${deckId}`);
          } else {
              navigate("/cards");
          }
      } catch (err) {
          console.error(err);
          setStatus("Failed to delete card.");
      }
  };

  const currentFields = getCurrentFields(deckId);

  return (
    <Layout pageTitle="Edit Card">
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <section className="glass-card" style={{ padding: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
             <h2 className="card-title" style={{ margin: 0 }}>Edit Card</h2>
             <button type="button" className="nav-btn" onClick={handleDelete} style={{ color: '#ff4d4f', borderColor: '#ff4d4f', fontSize: '0.9rem', padding: '6px 12px' }}>
               Delete Card
             </button>
          </div>

          {status && <p className="muted" style={{ textAlign: "center" }}>{status}</p>}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            <div className="input-group">
               <label htmlFor="card-deck" className="input-label">
                  Deck
               </label>
               <select
                 id="card-deck"
                 className="input-field"
                 value={deckId}
                 onChange={e => handleDeckChange(e.target.value)}
                 style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: "12px 16px" }}
               >
                  <option value="" style={{ color: "black" }}>No Deck (Unassigned - Basic)</option>
                  {decks.map(d => (
                      <option key={d.id} value={d.id} style={{ color: "black" }}>{d.name}</option>
                  ))}
               </select>
            </div>

            {currentFields.map((field, idx) => (
                <div key={idx} className="input-group">
                  <label className="input-label">
                    {field}
                  </label>
                  {idx === 0 ? (
                      <input
                        className="input-field"
                        value={content[field] || ""}
                        onChange={(e) => handleContentChange(field, e.target.value)}
                        required
                        style={{ padding: "12px 16px", fontSize: "1.1rem" }}
                      />
                  ) : (
                      <textarea
                        className="input-field"
                        rows={idx === 1 ? 3 : 2}
                        value={content[field] || ""}
                        onChange={(e) => handleContentChange(field, e.target.value)}
                        style={{ resize: "vertical" }}
                      />
                  )}
                </div>
            ))}

            <button type="submit" className="primary-btn" style={{ marginTop: 10, padding: "14px", fontSize: "1.1rem" }}>
              Save Changes
            </button>
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
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
        .input-field:focus {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.5);
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
