import { useEffect, useState } from 'react';
import { DeckApi } from '../libs/api';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import type { Deck } from '../types/deck';
import { useTranslation } from 'react-i18next';

export default function DecksPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');
  const [decks, setDecks] = useState<Deck[]>([]);
  const [status, setStatus] = useState(t('common.loading'));

  useEffect(() => {
    fetchDecks();
  }, [activeTab, t]);

  const fetchDecks = () => {
    setStatus(t('common.loading'));
    const apiCall = activeTab === 'my' ? DeckApi.listMy() : DeckApi.listPublic();

    apiCall
      .then((res) => {
        setDecks(res.data);
        setStatus(res.data.length ? t('decks.select_msg') : t('decks.no_decks_msg'));
      })
      .catch((err) => {
        console.error(err);
        setStatus(t('decks.load_fail'));
      });
  };

  return (
    <Layout pageTitle={t('nav.my_decks')}>
      <div className="glass-card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h2 className="card-title">{t('nav.my_decks')}</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/cards/create" className="secondary-btn">
              {t('decks.new_card_btn')}
            </Link>
            <Link to="/decks/create" className="primary-btn">
              {t('decks.create_deck_btn')}
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 10, margin: '20px 0', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 10 }}>
          <button
            onClick={() => setActiveTab('my')}
            className={activeTab === 'my' ? 'primary-btn' : 'secondary-btn'}
            style={{ borderRadius: 20, fontWeight: 'bold' }}>
            {t('decks.my_tab')}
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={activeTab === 'public' ? 'primary-btn' : 'secondary-btn'}
            style={{ borderRadius: 20, fontWeight: 'bold' }}>
            {t('decks.public_tab')}
          </button>
        </div>

        <p className="muted">{status}</p>

        <div className="card-grid" style={{ marginTop: 20 }}>
          {decks.map((deck) => (
            <article key={deck.id} className="item-tile">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 className="item-title">{deck.name}</h3>
                  <p className="item-subtitle">{deck.description}</p>
                  {deck.isPublic && (
                    <span className="pill" style={{ fontSize: '0.7rem', marginTop: 5 }}>
                      {t('decks.public')}
                    </span>
                  )}
                </div>
                {activeTab === 'my' && (
                  <Link to={`/study?deckId=${deck.id}`} className="primary-btn" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                    {t('decks.study_btn')}
                  </Link>
                )}
              </div>
              <div style={{ marginTop: 10 }}>
                <Link to={`/decks/${deck.id}`} className="muted" style={{ textDecoration: 'underline', fontSize: '0.9rem' }}>
                  {t('decks.view_details')}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="glass-card">
        <div className="card-header">
          <h3 className="item-title">{t('decks.all_cards')}</h3>
          <Link to="/cards" className="muted" style={{ textDecoration: 'underline' }}>
            {t('decks.view_no_deck')}
          </Link>
        </div>
      </div>
    </Layout>
  );
}
