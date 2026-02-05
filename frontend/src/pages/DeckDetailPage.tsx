import { useEffect, useState } from 'react';
import { api, DeckApi } from '../libs/api';
import { speak } from '../libs/tts';
import Layout from '../components/Layout';
import { Link, useParams, useNavigate } from 'react-router-dom';
import type { Card } from '../types/card';
import type { Deck } from '../types/deck';
import type { User } from '../types/user';
import { useTranslation } from 'react-i18next';

export default function DeckDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [status, setStatus] = useState(t('common.loading'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch user to check ownership
    api
      .get<User>('/users/me')
      .then((res) => setCurrentUser(res.data))
      .catch(() => {});

    api
      .get<Deck>(`/decks/${id}`)
      .then((res) => setDeck(res.data))
      .catch(console.error);
    api
      .get<Card[]>(`/cards?deckId=${id}`)
      .then((res) => {
        setCards(res.data);
        setStatus(res.data.length ? '' : t('deck.no_cards'));
      })
      .catch(() => setStatus(t('deck.load_cards_fail')));
  }, [id, t]);

  const onFork = async () => {
    if (!confirm(t('deck.fork_confirm', { defaultValue: 'Copy this deck to your library?' }))) return;
    try {
      const res = await DeckApi.fork(id!);
      alert(t('deck.fork_success', { defaultValue: 'Deck copied successfully!' }));
      navigate(`/decks/${res.data.id}`);
    } catch (e) {
      console.error(e);
      alert(t('deck.fork_fail', { defaultValue: 'Failed to copy deck.' }));
    }
  };

  const onDelete = async () => {
    if (!confirm(t('common.delete_confirm', { defaultValue: 'Are you sure?' }))) return;
    try {
      await DeckApi.delete(id!);
      navigate('/decks');
    } catch (e) {
      console.error(e);
      alert(t('deck.fail_delete'));
    }
  };

  if (!deck)
    return (
      <Layout>
        <p className="muted">{t('common.loading')}</p>
      </Layout>
    );

  // Check ownership
  const isOwner = currentUser && deck.ownerId === currentUser.id;

  return (
    <Layout pageTitle={deck.name}>
      <section className="glass-card">
        <div className="card-header">
          <h2 className="card-title">{deck.name}</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            {/* Study Button: Available to everyone? Or only owner? Public decks can be studied?
                 Ideally, users should fork public decks to study them properly (save progress).
                 But let's allow studying public decks in "Guest Mode" or just hide it?
                 The prompt says "Fork functionality is essential because modifying original ruins it".
                 So for public decks, we should encourage Fork.
             */}

            {isOwner ? (
              <>
                <Link to={`/study?deckId=${id}`} className="primary-btn">
                  {t('deck.study_now')}
                </Link>
                <Link to={`/cards/create?deckId=${id}`} className="secondary-btn">
                  {t('deck.add_card')}
                </Link>
                <Link to={`/decks/${id}/edit`} className="secondary-btn">
                  {t('common.edit')}
                </Link>
                <button className="secondary-btn" onClick={onDelete} style={{ color: '#ff4d4f', borderColor: '#ff4d4f' }}>
                  {t('common.delete')}
                </button>
              </>
            ) : (
              <button className="primary-btn" onClick={onFork}>
                {t('deck.fork_btn', { defaultValue: 'Copy to My Decks' })}
              </button>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
          {deck.isPublic && (
            <span className="pill" style={{ background: '#52c41a', color: 'white' }}>
              Public
            </span>
          )}
          <p className="item-subtitle">{deck.description}</p>
        </div>

        {status && (
          <p className="muted" style={{ marginTop: 10 }}>
            {status}
          </p>
        )}

        {/* Search Input */}
        <div style={{ margin: '20px 0' }}>
          <input
            className="text-input"
            style={{ width: '100%', maxWidth: 400 }}
            placeholder={t('common.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="card-grid" style={{ marginTop: 14 }}>
          {cards
            .filter(
              (c) =>
                !searchQuery ||
                c.term?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.meaning?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((c) => (
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
                  </div>
                  {isOwner && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/cards/${c.id}/edit`} className="muted" style={{ fontSize: '0.8rem', textDecoration: 'underline' }}>
                        {t('common.edit')}
                      </Link>
                    </div>
                  )}
                </div>
              </article>
            ))}
        </div>
      </section>
    </Layout>
  );
}
