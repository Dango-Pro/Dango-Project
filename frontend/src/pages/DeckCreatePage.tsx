import { useState, useEffect } from "react";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import { type CardTemplate } from "../types/template";

export default function DeckCreatePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");

  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newFields, setNewFields] = useState<string[]>(["Front", "Back"]);

  useEffect(() => {
    api.get<CardTemplate[]>("/templates").then(res => {
        setTemplates(res.data);
        const last = localStorage.getItem("lastTemplateId");
        if (last && res.data.find(t => t.id === Number(last))) {
             setSelectedTemplateId(Number(last));
        } else if (res.data.length > 0) {
             setSelectedTemplateId(res.data[0].id);
        }
    }).catch(console.error);
  }, []);

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) return;
    try {
        const res = await api.post("/templates", { name: newTemplateName, fieldNames: newFields });
        setTemplates([...templates, res.data]);
        setSelectedTemplateId(res.data.id);
        localStorage.setItem("lastTemplateId", String(res.data.id));
        setIsCreatingTemplate(false);
        setNewTemplateName("");
        setNewFields(["Front", "Back"]);
    } catch (err) {
        console.error(err);
        setStatus("Failed to create template.");
    }
  };

  const addField = () => setNewFields([...newFields, ""]);
  const updateField = (idx: number, val: string) => {
      const updated = [...newFields];
      updated[idx] = val;
      setNewFields(updated);
  };
  const removeField = (idx: number) => {
      setNewFields(newFields.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedTemplateId) localStorage.setItem("lastTemplateId", String(selectedTemplateId));
      await api.post("/decks", { name, description, templateId: selectedTemplateId });
      navigate("/decks");
    } catch (err) {
      console.error(err);
      setStatus("Failed to create deck.");
    }
  };

  return (
    <Layout pageTitle="Create Deck">
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <section className="glass-card" style={{ padding: 40 }}>
          <h2 className="card-title" style={{ textAlign: "center", marginBottom: 30 }}>Design Your Deck</h2>
          {status && <p className="muted" style={{ textAlign: "center" }}>{status}</p>}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="input-group">
              <label htmlFor="deck-name" className="input-label">
                Deck Name
              </label>
              <input
                id="deck-name"
                className="input-field"
                placeholder="e.g., JLPT N5 Vocabulary"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ padding: "12px 16px", fontSize: "1.1rem" }}
              />
            </div>
            <div className="input-group">
              <label htmlFor="deck-desc" className="input-label">
                Description <span className="muted">(Optional)</span>
              </label>
              <textarea
                id="deck-desc"
                className="input-field"
                rows={4}
                placeholder="What is this deck about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>

            {/* Template Selection */}
            <div className="input-group">
                <label className="input-label">Card Template</label>
                {!isCreatingTemplate ? (
                    <div style={{ display: "flex", gap: 10 }}>
                        <select
                            className="input-field"
                            style={{ flex: 1 }}
                            value={selectedTemplateId || ""}
                            onChange={e => setSelectedTemplateId(Number(e.target.value))}
                        >
                            {templates.map(t => <option key={t.id} value={t.id} style={{ color: "black" }}>{t.name} ({t.fieldNames.join(", ")})</option>)}
                        </select>
                        <button type="button" className="secondary-btn" onClick={() => setIsCreatingTemplate(true)}>New</button>
                    </div>
                ) : (
                    <div className="glass-card" style={{ background: "rgba(0,0,0,0.2)", padding: 15 }}>
                        <div style={{ marginBottom: 10 }}>
                            <label className="input-label" style={{ fontSize: "0.8rem" }}>Template Name</label>
                            <input
                                className="input-field"
                                value={newTemplateName}
                                onChange={e => setNewTemplateName(e.target.value)}
                                placeholder="My Custom Template"
                            />
                        </div>
                        <label className="input-label" style={{ fontSize: "0.8rem" }}>Fields</label>
                        {newFields.map((f, i) => (
                            <div key={i} style={{ display: "flex", gap: 5, marginBottom: 5 }}>
                                <input
                                    className="input-field"
                                    value={f}
                                    onChange={e => updateField(i, e.target.value)}
                                    placeholder={`Field ${i+1}`}
                                />
                                <button type="button" className="secondary-btn" onClick={() => removeField(i)}>X</button>
                            </div>
                        ))}
                        <button type="button" className="secondary-btn" onClick={addField} style={{ width: "100%", marginBottom: 10 }}>+ Add Field</button>

                        <div style={{ display: "flex", gap: 10 }}>
                            <button type="button" className="primary-btn" onClick={handleCreateTemplate}>Save Template</button>
                            <button type="button" className="secondary-btn" onClick={() => setIsCreatingTemplate(false)}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>

            <button type="submit" className="primary-btn" style={{ marginTop: 10, padding: "14px", fontSize: "1.1rem" }}>
              Create Deck
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
      `}</style>
    </Layout>
  );
}
