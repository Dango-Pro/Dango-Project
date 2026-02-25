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
  const [algorithmType, setAlgorithmType] = useState('SM2');
  const [dailyNewCardLimit, setDailyNewCardLimit] = useState(20);


  useEffect(() => {
    api
      .get<Deck>(`/decks/${id}`)
      .then((res) => {
        setName(res.data.name);
        setDescription(res.data.description || '');
        setIsPublic(res.data.isPublic || false);
        setAlgorithmType(res.data.algorithmType || 'SM2');
        setDailyNewCardLimit(res.data.dailyNewCardLimit || 20);
      })
      .catch((err) => {
        console.error(err);
        setStatus(t('deck.fail_load_deck'));
      });
  }, [id, t]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/decks/${id}`, { name, description, isPublic, algorithmType, dailyNewCardLimit });
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
            
            <div className="input-group">
              <label htmlFor="daily-limit" className="input-label">
                {t('deck.daily_new_cards_limit')}
              </label>
              <input
                id="daily-limit"
                type="number"
                className="input-field"
                value={dailyNewCardLimit}
                onChange={(e) => setDailyNewCardLimit(e.target.valueAsNumber)}
                min={0}
                style={{ padding: '12px 16px', fontSize: '1.1rem' }}
              />
              <span className="muted" style={{ fontSize: '0.8rem' }}>
                {t('deck.daily_new_cards_limit_desc')}
              </span>
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

            <div className="input-group" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label className="input-label" style={{ marginBottom: 0 }}>
                  {t('deck.algorithm_label')}
                </label>
                <div
                  className="info-icon"
                  style={{
                    cursor: 'help',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#ccc',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  ?
                  <div className="tooltip-box">
                    <p style={{ fontWeight: 'bold', marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: 4 }}>
                      {t('deck.algorithm_label')}
                    </p>
                    <ul style={{ paddingLeft: 16, margin: 0, listStyle: 'disk', textAlign: 'left' }}>
                      <li style={{ marginBottom: 4 }}>
                        <strong>SM-2:</strong> {t('deck.algo_desc_sm2')}
                      </li>
                      <li style={{ marginBottom: 4 }}>
                        <strong>FSRS:</strong> {t('deck.algo_desc_fsrs')}
                      </li>
                      <li style={{ marginBottom: 4 }}>
                        <strong>Half-Life Regression:</strong> {t('deck.algo_desc_hlr')}
                      </li>
                      <li style={{ marginBottom: 4 }}>
                        <strong>Leitner:</strong> {t('deck.algo_desc_leitner')}
                      </li>
                      <li>
                        <strong>Sprint:</strong> {t('deck.algo_desc_sprint')}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <select
                className="input-field"
                value={algorithmType}
                onChange={(e) => setAlgorithmType(e.target.value)}
                style={{ padding: '12px 16px', fontSize: '1rem' }}>
                <option value="SM2">{t('deck.algo_sm2')}</option>
                <option value="FSRS">{t('deck.algo_fsrs')}</option>
                <option value="HALF_LIFE_REGRESSION">{t('deck.algo_hlr')}</option>
                <option value="LEITNER_SYSTEM">{t('deck.algo_leitner')}</option>
                <option value="SPRINT">{t('deck.algo_sprint')}</option>
              </select>
              <span className="muted" style={{ fontSize: '0.8rem', marginTop: 5 }}>
                {t('deck.algorithm_helper')}
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
          color: #444;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
        .info-icon {
          position: relative;
        }
        .tooltip-box {
          visibility: hidden;
          opacity: 0;
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
          background: rgba(0, 0, 0, 0.85);
          color: #fff;
          padding: 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          line-height: 1.4;
          z-index: 100;
          transition: opacity 0.2s;
          pointer-events: none;
          margin-bottom: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .tooltip-box::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.85) transparent transparent transparent;
        }

        .info-icon:hover .tooltip-box {
          visibility: visible;
          opacity: 1;
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
          background: rgba(0,0,0,0.05);
        }
        .muted {
          color: #666;
        }
      `}</style>
    </Layout>
  );
}
