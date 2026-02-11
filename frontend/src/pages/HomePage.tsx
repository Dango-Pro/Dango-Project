import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import Toast from '../components/Toast';
import { api } from '../libs/api';
import type { Post } from '../types/post';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Carousel = () => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const slides = [
    '/26dc3940-d441-4480-9171-20361974c915.jpg',
    '/26dc3940-d441-4480-9171-20361974c915.jpg',
    '/26dc3940-d441-4480-9171-20361974c915.jpg',
    '/26dc3940-d441-4480-9171-20361974c915.jpg',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div style={{ position: 'relative', height: '100%', minHeight: '300px', borderRadius: '24px', overflow: 'hidden', background: '#000' }}>
      {slides.map((src, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: idx === current ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
          }}>
          <img src={src} alt={`Slide ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', bottom: 20, left: 20, background: 'rgba(0,0,0,0.5)', padding: '10px 20px', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#fff', margin: 0 }}>
              {t('home.event')} {idx + 1}
            </h2>
          </div>
        </div>
      ))}
      <div style={{ position: 'absolute', bottom: '16px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '8px' }}>
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: idx === current ? '#fff' : 'rgba(255,255,255,0.3)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  );
};

const NoticeWidget = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ content?: Post[] } | Post[]>('/posts?size=30')
      .then((res) => {
        const data = res.data as any;
        const list = Array.isArray(data) ? data : (data?.content ?? []);
        setPosts(list.filter((p: Post) => p.isNotice).slice(0, 5));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 className="card-title" style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#111' }}>
        {t('home.notices_title')}
      </h3>
      <div style={{ flex: 1 }}>
        {loading ? (
          <p className="muted" style={{ color: '#222' }}>
            {t('common.loading')}
          </p>
        ) : (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {posts.length === 0 && <li style={{ color: '#111' }}>{t('home.no_notices')}</li>}
            {posts.map((p) => (
              <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link
                  to={`/posts/${p.id}`}
                  style={{
                    textDecoration: 'none',
                    color: '#111',
                    fontSize: '0.95rem',
                    flex: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginRight: '10px',
                  }}>
                  <span style={{ color: '#ff6b6b', marginRight: '6px', fontWeight: 'bold' }}>{t('home.notice_tag')}</span>
                  {p.title}
                </Link>
                <span className="muted" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', color: '#222' }}>
                  {t('home.new_tag')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ marginTop: '16px', textAlign: 'right' }}>
        <Link to="/posts?tab=notice" className="muted" style={{ fontSize: '0.85rem', textDecoration: 'underline', color: '#222' }}>
          {t('home.view_all')}
        </Link>
      </div>
    </div>
  );
};

const CommunityWidget = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ content?: Post[] } | Post[]>('/posts?size=30')
      .then((res) => {
        const data = res.data as any;
        const list = Array.isArray(data) ? data : (data?.content ?? []);
        setPosts(list.filter((p: Post) => !p.isNotice).slice(0, 5));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 className="card-title" style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#111' }}>
        {t('nav.community')}
      </h3>
      <div style={{ flex: 1 }}>
        {loading ? (
          <p className="muted" style={{ color: '#222' }}>
            {t('common.loading')}
          </p>
        ) : (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {posts.length === 0 && <li style={{ color: '#111' }}>{t('home.no_posts')}</li>}
            {posts.map((p) => (
              <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link
                  to={`/posts/${p.id}`}
                  style={{
                    textDecoration: 'none',
                    color: '#111',
                    fontSize: '0.95rem',
                    flex: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginRight: '10px',
                  }}>
                  {p.title}
                </Link>
                <span className="muted" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', color: '#666' }}>
                  {p.authorName || 'Anonymous'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ marginTop: '16px', textAlign: 'right' }}>
        <Link to="/posts" className="muted" style={{ fontSize: '0.85rem', textDecoration: 'underline', color: '#222' }}>
          {t('home.view_all')}
        </Link>
      </div>
    </div>
  );
};

const LoginWidget = () => {
  const { t } = useTranslation();
  const { token, user, login, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [stats, setStats] = useState({ dueDecks: 0, dueCards: 0, loading: true });

  useEffect(() => {
    if (token) {
      // 오늘 학습해야 할 덱과 카드 수 가져오기
      api.get('/decks/my').then(async res => {
        const decks = res.data || [];
        let dueDecks = 0;
        let dueCards = 0;
        
        // 각 덱의 due 카드 확인
        await Promise.all(decks.map(async (deck: any) => {
          try {
            const dueRes = await api.get(`/study/due?deckId=${deck.id}`);
            const cards = dueRes.data?.cards || [];
            if (cards.length > 0) {
              dueDecks++;
              dueCards += cards.length;
            }
          } catch {
            // 에러 시 무시
          }
        }));
        
        setStats({ dueDecks, dueCards, loading: false });
      }).catch(() => {
        setStats({ dueDecks: 0, dueCards: 0, loading: false });
      });
    }
  }, [token]);

  const handleLogin = async () => {
    if (!username || !password) return;
    try {
      const res = await api.post('/auth/login', { username, password });
      login(res.data.accessToken, res.data.refreshToken);
    } catch (err) {
      console.error(err);
      setError(t('auth.login_fail'));
    }
  };

  // 아바타 이니셜 생성
  const getInitials = () => {
    const name = user?.nickname || user?.username || 'U';
    return name.charAt(0).toUpperCase();
  };

  // 랜덤 그라데이션 색상
  const getAvatarGradient = () => {
    const gradients = [
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #43e97b, #38f9d7)',
      'linear-gradient(135deg, #fa709a, #fee140)',
    ];
    const hash = (user?.id || 0) % gradients.length;
    return gradients[hash];
  };

  if (token && user) {
    return (
      <div className="profile-card">
        <Toast 
          isOpen={showToast} 
          message={toastMessage} 
          type="success" 
          onClose={() => setShowToast(false)} 
        />
        
        {/* 프로필 헤더 */}
        <div className="profile-header">
          <div className="profile-avatar" style={{ background: getAvatarGradient() }}>
            {getInitials()}
          </div>
          <div className="profile-info">
            <h3 className="profile-name">{user?.nickname || user?.username}</h3>
            <span className="profile-role">
              {user?.roles?.includes('ROLE_ADMIN') ? '👑 관리자' : '📚 학습자'}
            </span>
          </div>
        </div>

        {/* 오늘의 학습 할당량 */}
        <div className="profile-stats">
          <div className="stats-header">📅 오늘의 학습</div>
          {stats.loading ? (
            <div className="stats-loading">확인 중...</div>
          ) : stats.dueCards === 0 ? (
            <div className="stats-complete">
              <span className="complete-icon">✅</span>
              <span>오늘 학습 완료!</span>
            </div>
          ) : (
            <div className="stats-content">
              <div className="stat-item">
                <span className="stat-value">{stats.dueDecks}</span>
                <span className="stat-label">덱</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-value">{stats.dueCards}</span>
                <span className="stat-label">카드</span>
              </div>
            </div>
          )}
        </div>

        {/* 빠른 액션 */}
        <div className="profile-actions">
          <Link to="/dashboard" className="action-btn primary">
            <span>📊</span> {t('nav.dashboard')}
          </Link>
          <Link to="/study" className="action-btn secondary">
            <span>📖</span> 학습하기
          </Link>
        </div>

        {/* 로그아웃 */}
        <button
          className="logout-btn"
          onClick={() => {
            setToastMessage(t('auth.logout_success'));
            setShowToast(true);
            logout();
          }}>
          로그아웃
        </button>

        <style>{`
          .profile-card {
            height: 100%;
            display: flex;
            flex-direction: column;
            padding: 24px;
            background: linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85));
            backdrop-filter: blur(10px);
            border-radius: 24px;
            border: 1px solid rgba(255,255,255,0.5);
            box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          }

          .profile-header {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 20px;
          }

          .profile-avatar {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 700;
            color: #fff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }

          .profile-info {
            flex: 1;
          }

          .profile-name {
            margin: 0;
            font-size: 18px;
            font-weight: 700;
            color: #1a1a2e;
          }

          .profile-role {
            font-size: 12px;
            color: #666;
          }

          .profile-stats {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 14px;
            background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1));
            border-radius: 14px;
            margin-bottom: 18px;
          }

          .stats-header {
            font-size: 12px;
            font-weight: 600;
            color: #667eea;
            margin-bottom: 10px;
          }

          .stats-loading {
            font-size: 13px;
            color: #888;
            padding: 8px 0;
          }

          .stats-complete {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #10b981;
            font-weight: 600;
            padding: 6px 0;
          }

          .complete-icon {
            font-size: 18px;
          }

          .stats-content {
            display: flex;
            align-items: center;
            gap: 24px;
          }

          .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
          }

          .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #667eea;
          }

          .stat-label {
            font-size: 11px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .stat-divider {
            width: 1px;
            height: 36px;
            background: rgba(0,0,0,0.1);
          }

          .profile-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
            flex: 1;
          }

          .action-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s ease;
          }

          .action-btn.primary {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: #fff;
            box-shadow: 0 4px 12px rgba(102,126,234,0.3);
          }

          .action-btn.primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102,126,234,0.4);
          }

          .action-btn.secondary {
            background: rgba(102,126,234,0.1);
            color: #667eea;
            border: 1px solid rgba(102,126,234,0.2);
          }

          .action-btn.secondary:hover {
            background: rgba(102,126,234,0.15);
          }

          .logout-btn {
            margin-top: auto;
            padding: 10px;
            background: transparent;
            border: none;
            color: #999;
            font-size: 13px;
            cursor: pointer;
            transition: color 0.2s;
          }

          .logout-btn:hover {
            color: #ff6b6b;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ height: '100%' }}>
      <h3 className="card-title" style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#111' }}>
        {t('home.quick_login')}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          className="text-input"
          placeholder={t('auth.username_placeholder')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        <input
          className="text-input"
          type="password"
          placeholder={t('auth.password_placeholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        <button className="primary-btn" onClick={handleLogin}>
          {t('auth.login_btn')}
        </button>
        {error && <p style={{ color: '#ff6b6b', fontSize: '0.85rem', margin: 0 }}>{error}</p>}
        <div style={{ textAlign: 'center', fontSize: '0.85rem' }}>
          <Link to="/register" className="muted" style={{ textDecoration: 'underline', color: '#222' }}>
            {t('auth.create_account')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const shortcuts = [
    { label: t('nav.my_decks'), to: '/decks' },
    { label: t('nav.study'), to: '/study' },
    { label: t('nav.community'), to: '/posts' },
  ];

  // 관리자/매니저 권한이 있는 경우 관리자 버튼 추가
  const isAdmin = user?.roles?.some((r: any) => {
    const roleName = typeof r === 'string' ? r : r.name || r.toString();
    return roleName === 'ROLE_ADMIN' || roleName === 'ROLE_MANAGER';
  });

  if (isAdmin) {
    shortcuts.push({ label: '⚙️ Admin', to: '/admin' });
  }

  return (
    <Layout>
      {/* Top Section: Carousel (3) + Login (1) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '3fr 1fr',
          gap: '20px',
          marginBottom: '20px',
          height: '350px', // Fixed height for alignment
        }}>
        <Carousel />
        <LoginWidget />
      </div>

      {/* Middle Section: Notices & Community */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <NoticeWidget />
        <CommunityWidget />
      </div>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '20px',
        }}>
        {shortcuts.map((s) => (
          <Link key={s.to} to={s.to} className="secondary-btn" style={{ padding: '10px 24px', minWidth: '120px', textAlign: 'center' }}>
            {s.label}
          </Link>
        ))}
      </div>
    </Layout>
  );
}
