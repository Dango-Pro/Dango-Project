import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { api } from '../libs/api';
import type { Post } from '../types/post';
import { useTranslation } from 'react-i18next';

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
      .get<Post[]>('/posts?notice=true')
      .then((res) => {
        setPosts(res.data.slice(0, 5));
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
        <Link to="/posts" className="muted" style={{ fontSize: '0.85rem', textDecoration: 'underline', color: '#222' }}>
          {t('home.view_all')}
        </Link>
      </div>
    </div>
  );
};

const LoginWidget = () => {
  const { t } = useTranslation();
  const token = localStorage.getItem('token');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) return;
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.accessToken);
      if (res.data.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken);
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError(t('auth.login_fail'));
    }
  };

  if (token) {
    return (
      <div
        className="glass-card"
        style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <h3 className="card-title" style={{ marginBottom: '10px', color: '#111' }}>
          {t('home.welcome_back')}
        </h3>
        <p className="muted" style={{ marginBottom: '20px', color: '#222' }}>
          {t('home.logged_in_msg')}
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/dashboard" className="primary-btn">
            {t('nav.dashboard')}
          </Link>
          <button
            className="secondary-btn"
            onClick={() => {
              if (window.confirm(t('common.confirm') + '?')) {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.reload();
              }
            }}>
            {t('nav.logout')}
          </button>
        </div>
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
  const shortcuts = [
    { label: t('nav.my_decks'), to: '/decks' },
    { label: t('nav.study'), to: '/study' },
    { label: t('nav.community'), to: '/posts' },
  ];

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

      {/* Middle Section: Notices */}
      <div style={{ marginBottom: '30px' }}>
        <NoticeWidget />
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
