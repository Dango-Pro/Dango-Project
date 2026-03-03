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
  const [forkingId, setForkingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');

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

  const handleFork = async (deckId: number) => {
    if (!window.confirm(t('deck.fork_confirm'))) return;
    setForkingId(deckId);
    try {
      await DeckApi.fork(deckId);
      setToast(t('deck.fork_success'));
      setTimeout(() => setToast(''), 3000);
      setActiveTab('my'); // 포크 후 내 단어장 탭으로 전환
    } catch (e) {
      console.error(e);
      setToast(t('deck.fork_fail'));
      setTimeout(() => setToast(''), 3000);
    } finally {
      setForkingId(null);
    }
  };

  return (
    <Layout pageTitle={t('nav.my_decks')}>
      {/* 토스트 알림 */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          background: '#333', color: '#fff', padding: '10px 24px', borderRadius: 8,
          zIndex: 9999, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          {toast}
        </div>
      )}

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

        {/* Tabs & Search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: '20px 0', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 15 }}>
          <div style={{ display: 'flex', gap: 10 }}>
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
          
          {/* Search Input */}
          <input
            className="text-input"
            style={{ width: '100%', maxWidth: 400 }}
            placeholder="단어장 이름 또는 설명 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <p className="muted">{status}</p>

        <div className="card-grid" style={{ marginTop: 20 }}>
          {decks
            .filter(deck => 
              !searchQuery || 
              deck.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
              deck.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((deck) => (
            <article key={deck.id} className="item-tile">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 className="item-title"
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    title={deck.name}>
                    {deck.name}
                  </h3>
                  <p className="item-subtitle"
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                    title={deck.description ?? ''}>
                    {deck.description}
                  </p>
                  {deck.isPublic && (
                    <span className="pill" style={{ fontSize: '0.7rem', marginTop: 5 }}>
                      {t('decks.public')}
                    </span>
                  )}
                </div>

                {activeTab === 'my' ? (
                  <Link
                    to={`/study?deckId=${deck.id}`}
                    className="primary-btn"
                    style={{ padding: '8px 16px', fontSize: '0.9rem', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {t('decks.study_btn')}
                  </Link>
                ) : (
                  <button
                    className="secondary-btn"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', flexShrink: 0, whiteSpace: 'nowrap', borderRadius: '20px' }}
                    onClick={() => handleFork(deck.id)}
                    disabled={forkingId === deck.id}
                    title={t('deck.fork_btn')}
                  >
                    {forkingId === deck.id ? '...' : '+ 담기'}
                  </button>
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
