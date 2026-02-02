import { useEffect, useState } from 'react';
import { api } from '../libs/api';
import Layout from '../components/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { type Deck } from '../types/deck';

export default function DeckEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    api
      .get<Deck>(`/decks/${id}`)
      .then((res) => {
        setName(res.data.name);
        setDescription(res.data.description || '');
        setIsPublic(res.data.isPublic || false);
      })
      .catch((err) => {
        console.error(err);
        setStatus(t('deck.fail_load_deck'));
      });
  }, [id, t]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/decks/${id}`, { name, description, isPublic });
      navigate(`/decks/${id}`);
    } catch (err) {
      console.error(err);
      setStatus(t('deck.fail_update_deck'));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('deck.delete_deck_confirm'))) {
      return;
    }
    try {
      await api.delete(`/decks/${id}`);
      navigate('/decks');
    } catch (err) {
      console.error(err);
      setStatus(t('deck.fail_delete_deck'));
    }
  };

  return (
    <Layout pageTitle={t('deck.edit_deck_title')}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <section className="glass-card" style={{ padding: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
            <h2 className="card-title" style={{ margin: 0 }}>
              {t('deck.edit_deck_title')}
            </h2>
            <button
              type="button"
              className="nav-btn"
              onClick={handleDelete}
              style={{ color: '#ff4d4f', borderColor: '#ff4d4f', fontSize: '0.9rem', padding: '6px 12px' }}>
              {t('deck.delete_deck')}
            </button>
          </div>

          {status && (
            <p className="muted" style={{ textAlign: 'center' }}>
              {status}
            </p>
          )}

          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="input-group">
              <label htmlFor="deck-name" className="input-label">
                {t('deck.deck_name')}
              </label>
              <input
                id="deck-name"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ padding: '12px 16px', fontSize: '1.1rem' }}
              />
            </div>
            <div className="input-group">
              <label htmlFor="deck-desc" className="input-label">
                {t('deck.description')}
              </label>
              <textarea
                id="deck-desc"
                className="input-field"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                id="is-public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <label htmlFor="is-public" className="input-label" style={{ cursor: 'pointer', marginBottom: 0 }}>
                {t('deck.make_public')}
              </label>
              <span className="muted" style={{ fontSize: '0.8rem' }}>
                {t('deck.visible_to_community')}
              </span>
            </div>

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
