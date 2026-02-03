import { useEffect, useState } from 'react';
import { api } from '../libs/api';
import { speak } from '../libs/tts';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Card } from '../types/card';

export default function CardsPage() {
  const { t } = useTranslation();
  const [cards, setCards] = useState<Card[]>([]);
  const [status, setStatus] = useState<string>('');

  // Search States
  const [query, setQuery] = useState('');

  // Re-writing state to support 3-way filter
  const [filterType, setFilterType] = useState<'ALL' | 'PENDING' | 'MEMORIZED'>('ALL');

  useEffect(() => {
    setStatus(t('common.loading'));
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (filterType === 'PENDING') params.append('memorized', 'false');
    if (filterType === 'MEMORIZED') params.append('memorized', 'true');

    api
      .get<Card[]>(`/cards?${params.toString()}`)
      .then((res) => {
        setCards(res.data);
        setStatus(res.data.length ? '' : t('cards.no_cards_found'));
      })
      .catch(() => setStatus(t('cards.fail_load')));
  }, [query, filterType, t]);

  return (
    <Layout pageTitle={t('cards.page_title')}>
      <section className="glass-card">
        <div className="card-header">
          <h2 className="card-title">{t('cards.title')}</h2>
          <Link to="/cards/create" className="primary-btn">
            {t('cards.new_card')}
          </Link>
        </div>

        <div style={{ display: 'flex', gap: 10, margin: '20px 0', flexWrap: 'wrap' }}>
          <input
            className="text-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder={t('cards.search_placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select className="text-input" style={{ width: 'auto' }} value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
            <option value="ALL">{t('cards.filter_all')}</option>
            <option value="PENDING">{t('cards.filter_pending')}</option>
            <option value="MEMORIZED">{t('cards.filter_memorized')}</option>
          </select>
        </div>

        <p className="muted">{status}</p>
        <div className="card-grid">
          {cards.map((c) => (
            <article key={c.id} className="item-tile">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 className="item-title">{c.term}</h3>
                    <button className="icon-btn" onClick={() => speak(c.term || '')} style={{ fontSize: '0.8rem', padding: '2px 6px' }}>
                      🔊
                    </button>
                  </div>
                  <p className="item-subtitle">{c.meaning}</p>
                  {c.isMemorized && (
                    <span className="pill" style={{ marginTop: 5, fontSize: '0.7rem' }}>
                      {t('cards.memorized')}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/cards/${c.id}/edit`} className="muted" style={{ fontSize: '0.8rem', textDecoration: 'underline' }}>
                    {t('common.edit')}
                  </Link>
                  <button
                    onClick={() => {
                      if (window.confirm(t('cards.delete_confirm'))) {
                        api
                          .delete(`/cards/${c.id}`)
                          .then(() => {
                            setCards(cards.filter((card) => card.id !== c.id));
                          })
                          .catch(() => alert(t('common.fail_delete')));
                      }
                    }}
                    className="muted"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline', padding: 0 }}>
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </Layout>
  );
}
