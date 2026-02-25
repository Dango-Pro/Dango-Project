import { useEffect, useState } from 'react';
import { api } from '../libs/api';
import Layout from '../components/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Card } from '../types/card';
import type { Deck } from '../types/deck';

export default function CardEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [deckId, setDeckId] = useState<string>('');
  const [decks, setDecks] = useState<Deck[]>([]);
  const [content, setContent] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const decksRes = await api.get<Deck[]>('/decks');
        const decksData = decksRes.data;
        setDecks(decksData);

        const cardRes = await api.get<Card>(`/cards/${id}`);
        const card = cardRes.data;

        setDeckId(card.deckId ? String(card.deckId) : '');

        let initialContent = card.content || {};

        // If content is empty but legacy fields exist (though interface marks them optional)
        if (Object.keys(initialContent).length === 0 && (card.term || card.meaning)) {
          const deck = decksData.find((d) => d.id === card.deckId);
          const fields = deck?.fieldNames && deck.fieldNames.length > 0 ? deck.fieldNames : ['Front', 'Back'];

          const newContent: Record<string, string> = {};
          if (fields.length > 0 && card.term) newContent[fields[0]] = card.term;
          if (fields.length > 1 && card.meaning) newContent[fields[1]] = card.meaning;
          initialContent = newContent;
        }

        setContent(initialContent);
      } catch (err) {
        console.error(err);
        setStatus(t('cards.fail_load_data'));
      }
    };
    fetchData();
  }, [id, t]);

  const getCurrentFields = (dId: string) => {
    const d = decks.find((d) => d.id === Number(dId));
    return d?.fieldNames && d.fieldNames.length > 0 ? d.fieldNames : ['Front', 'Back'];
  };

  const handleDeckChange = (newDeckId: string) => {
    const oldFields = getCurrentFields(deckId);
    const newFields = getCurrentFields(newDeckId);

    if (newFields.length < oldFields.length) {
      if (!window.confirm(t('cards.field_reduce_confirm'))) {
        return;
      }
    }

    const newContent: Record<string, string> = {};
    newFields.forEach((field, i) => {
      if (i < oldFields.length) {
        const oldKey = oldFields[i];
        newContent[field] = content[oldKey] || '';
      } else {
        newContent[field] = '';
      }
    });

    setContent(newContent);
    setDeckId(newDeckId);
  };

  const handleContentChange = (field: string, val: string) => {
    setContent((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentFields = getCurrentFields(deckId);
    const term = content[currentFields[0]] || '';
    const meaning = currentFields.length > 1 ? content[currentFields[1]] : '';

    try {
      await api.put(`/cards/${id}`, {
        term,
        meaning,
        deckId: deckId ? Number(deckId) : null,
        content,
      });
      if (deckId) {
        navigate(`/decks/${deckId}`);
      } else {
        navigate('/cards');
      }
    } catch (err) {
      console.error(err);
      setStatus(t('common.fail_update'));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('cards.delete_card_confirm'))) {
      return;
    }
    try {
      await api.delete(`/cards/${id}`);
      if (deckId) {
        navigate(`/decks/${deckId}`);
      } else {
        navigate('/cards');
      }
    } catch (err) {
      console.error(err);
      setStatus(t('cards.fail_delete'));
    }
  };

  const currentFields = getCurrentFields(deckId);

  return (
    <Layout pageTitle={t('cards.edit_page_title')}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <section className="glass-card" style={{ padding: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
            <h2 className="card-title" style={{ margin: 0 }}>
              {t('cards.edit_card')}
            </h2>
            <button
              type="button"
              className="nav-btn"
              onClick={handleDelete}
              style={{ color: '#ff4d4f', borderColor: '#ff4d4f', fontSize: '0.9rem', padding: '6px 12px' }}>
              {t('cards.delete_card')}
            </button>
          </div>

          {status && (
            <p className="muted" style={{ textAlign: 'center' }}>
              {status}
            </p>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="input-group">
              <label htmlFor="card-deck" className="input-label">
                {t('cards.deck_label')}
              </label>
              <select
                id="card-deck"
                className="input-field"
                value={deckId}
                onChange={(e) => handleDeckChange(e.target.value)}
                style={{ padding: '12px 16px' }}>
                <option value="">{t('cards.no_deck_option')}</option>
                {decks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {currentFields.map((field, idx) => (
              <div key={idx} className="input-group">
                <label className="input-label">{field}</label>
                {idx === 0 ? (
                  <input
                    className="input-field"
                    value={content[field] || ''}
                    onChange={(e) => handleContentChange(field, e.target.value)}
                    required
                    style={{ padding: '12px 16px', fontSize: '1.1rem' }}
                  />
                ) : (
                  <textarea
                    className="input-field"
                    rows={idx === 1 ? 3 : 2}
                    value={content[field] || ''}
                    onChange={(e) => handleContentChange(field, e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                )}
              </div>
            ))}

            <button type="submit" className="primary-btn" style={{ marginTop: 10, padding: '14px', fontSize: '1.1rem' }}>
              {t('cards.save_changes')}
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
          color: #555;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
        .input-field:focus {
          background: #fff;
          border-color: #ffb7b2;
        }
        .nav-btn {
          background: none;
          border: 1px solid #ccc;
          color: #555;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nav-btn:hover {
          background: rgba(0,0,0,0.05);
        }
      `}</style>
    </Layout>
  );
}
