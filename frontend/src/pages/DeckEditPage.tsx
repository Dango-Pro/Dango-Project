import { useEffect, useState } from "react";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { type Deck } from "../types/deck";

export default function DeckEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    api.get<Deck>(`/decks/${id}`).then(res => {
        setName(res.data.name);
        setDescription(res.data.description || "");
    }).catch(err => {
        console.error(err);
        setStatus("Failed to load deck.");
    });
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/decks/${id}`, { name, description });
      navigate(`/decks/${id}`);
    } catch (err) {
      console.error(err);
      setStatus("Failed to update deck.");
    }
  };

  const handleDelete = async () => {
      if (!window.confirm("Are you sure you want to delete this deck? All cards in it will be lost/unassigned.")) {
          return;
      }
      try {
          await api.delete(`/decks/${id}`);
          navigate("/decks");
      } catch (err) {
          console.error(err);
          setStatus("Failed to delete deck.");
      }
  };

  return (
    <Layout pageTitle="Edit Deck">
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <section className="glass-card" style={{ padding: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
             <h2 className="card-title" style={{ margin: 0 }}>Edit Deck</h2>
             <button type="button" className="nav-btn" onClick={handleDelete} style={{ color: '#ff4d4f', borderColor: '#ff4d4f', fontSize: '0.9rem', padding: '6px 12px' }}>
               Delete Deck
             </button>
          </div>

          {status && <p className="muted" style={{ textAlign: "center" }}>{status}</p>}

          <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="input-group">
              <label htmlFor="deck-name" className="input-label">
                Deck Name
              </label>
              <input
                id="deck-name"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ padding: "12px 16px", fontSize: "1.1rem" }}
              />
            </div>
            <div className="input-group">
              <label htmlFor="deck-desc" className="input-label">
                Description
              </label>
              <textarea
                id="deck-desc"
                className="input-field"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>

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
