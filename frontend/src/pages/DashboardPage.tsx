import { useEffect, useState } from 'react';
import { api } from '../libs/api';
import Layout from '../components/Layout';
import StudyHeatmap from '../components/StudyHeatmap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface DashboardStats {
  totalCards: number;
  memorizedCards: number;
  totalDecks: number;
  totalPosts: number;
  totalLikes: number;
  dueCards: number;
}

interface DeckProgressItem {
  deckId: number;
  deckName: string;
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  suspendedCards: number;
}

interface ExtendedStats {
  reviewsToday: number;
  accuracyPercent: number;
  streakDays: number;
  deckProgress: DeckProgressItem[];
  weeklyTrend: { date: string; day: string; count: number }[];
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [extended, setExtended] = useState<ExtendedStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<DashboardStats>('/stats/dashboard'),
      api.get<ExtendedStats>('/stats/extended'),
    ])
      .then(([dashRes, extRes]) => {
        setStats(dashRes.data);
        setExtended(extRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Layout pageTitle={t('nav.dashboard')}>
        <p className="muted">{t('common.loading')}</p>
      </Layout>
    );
  if (!stats)
    return (
      <Layout pageTitle={t('nav.dashboard')}>
        <p>{t('dashboard.load_error')}</p>
      </Layout>
    );

  const memorizedPercent = stats.totalCards > 0 ? Math.round((stats.memorizedCards / stats.totalCards) * 100) : 0;
  const maxWeekly = extended ? Math.max(...extended.weeklyTrend.map((d) => d.count), 1) : 1;

  return (
    <Layout pageTitle={t('nav.dashboard')}>
      {/* 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Progress overview */}
          <div className="glass-card">
            <h2 className="card-title">{t('dashboard.progress_title')}</h2>
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span>{t('dashboard.memorized_label')}</span>
                <span>
                  {memorizedPercent}% ({stats.memorizedCards}/{stats.totalCards})
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: 10,
                  background: '#f0f0f0',
                  borderRadius: 5,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${memorizedPercent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #f48fb1, #ec407a)',
                    transition: 'width 0.5s ease',
                    borderRadius: 5,
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: 30 }}>
              <h3 className="item-title" style={{ fontSize: '1rem', marginBottom: 10 }}>
                {t('dashboard.study_activity')}
              </h3>
              <StudyHeatmap />
            </div>
          </div>

          {/* Stat tiles */}
          <div className="card-grid">
            <div
              className="item-tile"
              style={{
                textAlign: 'center',
                background: 'rgba(236, 64, 122, 0.08)',
                borderColor: 'rgba(236, 64, 122, 0.2)',
              }}
            >
              <h3 className="item-title" style={{ fontSize: '2rem', color: '#ec407a' }}>
                {stats.dueCards}
              </h3>
              <p className="item-subtitle">{t('dashboard.cards_due')}</p>
              <Link
                to="/study"
                style={{
                  marginTop: 10,
                  display: 'inline-block',
                  fontSize: '0.8rem',
                  textDecoration: 'underline',
                  color: 'inherit',
                }}
              >
                {t('dashboard.start_review')}
              </Link>
            </div>
            <div className="item-tile" style={{ textAlign: 'center' }}>
              <h3 className="item-title" style={{ fontSize: '2rem' }}>
                {stats.totalDecks}
              </h3>
              <p className="item-subtitle">{t('dashboard.decks_created')}</p>
              <Link
                to="/decks"
                style={{
                  marginTop: 10,
                  display: 'inline-block',
                  fontSize: '0.8rem',
                  textDecoration: 'underline',
                  color: 'inherit',
                }}
              >
                {t('dashboard.manage_decks')}
              </Link>
            </div>
            <div className="item-tile" style={{ textAlign: 'center' }}>
              <h3 className="item-title" style={{ fontSize: '2rem' }}>
                {stats.totalCards}
              </h3>
              <p className="item-subtitle">{t('dashboard.total_cards')}</p>
              <Link
                to="/cards"
                style={{
                  marginTop: 10,
                  display: 'inline-block',
                  fontSize: '0.8rem',
                  textDecoration: 'underline',
                  color: 'inherit',
                }}
              >
                {t('dashboard.browse_all')}
              </Link>
            </div>
            <div className="item-tile" style={{ textAlign: 'center' }}>
              <h3 className="item-title" style={{ fontSize: '2rem' }}>
                {stats.totalPosts}
              </h3>
              <p className="item-subtitle">{t('dashboard.posts_shared')}</p>
              <Link
                to="/posts"
                style={{
                  marginTop: 10,
                  display: 'inline-block',
                  fontSize: '0.8rem',
                  textDecoration: 'underline',
                  color: 'inherit',
                }}
              >
                {t('dashboard.view_community')}
              </Link>
            </div>
            <div className="item-tile" style={{ textAlign: 'center' }}>
              <h3 className="item-title" style={{ fontSize: '2rem' }}>
                {stats.totalLikes}
              </h3>
              <p className="item-subtitle">{t('dashboard.community_likes')}</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Today's Summary */}
          {extended && (
            <div className="glass-card">
              <h2 className="card-title">{t('dashboard.today_summary')}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 20 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#ec407a' }}>
                    {extended.reviewsToday}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: 4 }}>
                    {t('dashboard.reviews_today')}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#26a69a' }}>
                    {extended.accuracyPercent}%
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: 4 }}>
                    {t('dashboard.accuracy')}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#FF8A00' }}>
                    🔥 {extended.streakDays}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: 4 }}>
                    {t('dashboard.streak')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Deck Progress */}
          {extended && extended.deckProgress.length > 0 && (
            <div className="glass-card">
              <h2 className="card-title">{t('dashboard.deck_progress')}</h2>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {extended.deckProgress.map((deck) => {
                  return (
                    <div key={deck.deckId}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.85rem',
                          marginBottom: 4,
                        }}
                      >
                        <span style={{ fontWeight: 600, maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {deck.deckName}
                        </span>
                        <span style={{ color: '#888' }}>
                          {deck.reviewCards}/{deck.totalCards}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          height: 8,
                          borderRadius: 4,
                          overflow: 'hidden',
                          background: '#f0f0f0',
                        }}
                      >
                        {deck.reviewCards > 0 && (
                          <div
                            style={{
                              width: `${(deck.reviewCards / deck.totalCards) * 100}%`,
                              background: '#26a69a',
                            }}
                            title={`${t('dashboard.status_review')}: ${deck.reviewCards}`}
                          />
                        )}
                        {deck.learningCards > 0 && (
                          <div
                            style={{
                              width: `${(deck.learningCards / deck.totalCards) * 100}%`,
                              background: '#ffb74d',
                            }}
                            title={`${t('dashboard.status_learning')}: ${deck.learningCards}`}
                          />
                        )}
                        {deck.newCards > 0 && (
                          <div
                            style={{
                              width: `${(deck.newCards / deck.totalCards) * 100}%`,
                              background: '#90caf9',
                            }}
                            title={`${t('dashboard.status_new')}: ${deck.newCards}`}
                          />
                        )}
                        {deck.suspendedCards > 0 && (
                          <div
                            style={{
                              width: `${(deck.suspendedCards / deck.totalCards) * 100}%`,
                              background: '#bdbdbd',
                            }}
                            title={`${t('dashboard.status_suspended')}: ${deck.suspendedCards}`}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
                {/* Legend */}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.75rem', color: '#888', marginTop: 4 }}>
                  <span>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#26a69a', marginRight: 4, verticalAlign: 'middle' }} />
                    {t('dashboard.status_review')}
                  </span>
                  <span>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#ffb74d', marginRight: 4, verticalAlign: 'middle' }} />
                    {t('dashboard.status_learning')}
                  </span>
                  <span>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#90caf9', marginRight: 4, verticalAlign: 'middle' }} />
                    {t('dashboard.status_new')}
                  </span>
                  <span>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#bdbdbd', marginRight: 4, verticalAlign: 'middle' }} />
                    {t('dashboard.status_suspended')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Weekly Trend */}
          {extended && (
            <div className="glass-card">
              <h2 className="card-title">{t('dashboard.weekly_trend')}</h2>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 8,
                  height: 120,
                  marginTop: 20,
                  padding: '0 4px',
                }}
              >
                {extended.weeklyTrend.map((day) => {
                  const barHeight = maxWeekly > 0 ? (day.count / maxWeekly) * 100 : 0;
                  return (
                    <div
                      key={day.date}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666' }}>
                        {day.count > 0 ? day.count : ''}
                      </span>
                      <div
                        style={{
                          width: '100%',
                          maxWidth: 36,
                          height: `${Math.max(barHeight, 3)}%`,
                          background:
                            day.count > 0
                              ? 'linear-gradient(180deg, #f48fb1, #ec407a)'
                              : '#f0f0f0',
                          borderRadius: 4,
                          transition: 'height 0.3s ease',
                          minHeight: 4,
                        }}
                      />
                      <span style={{ fontSize: '0.7rem', color: '#999' }}>{day.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
