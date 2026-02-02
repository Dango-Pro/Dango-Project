import { useState } from 'react';
import { api } from '../libs/api';
import Layout from '../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import SuccessModal from '../components/SuccessModal';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const onLogin = async () => {
    try {
      const res = await api.post('/auth/login', { username: id, password: pw });
      const { accessToken, refreshToken } = res.data;
      localStorage.setItem('token', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      setShowSuccess(true);
      setTimeout(() => navigate('/'), 1500); // Auto redirect
    } catch (err) {
      console.error(err);
      setStatus(t('auth.login_fail'));
    }
  };

  return (
    <Layout pageTitle={t('auth.login_title')}>
      <SuccessModal isOpen={showSuccess} message={t('auth.login_success')} onClose={() => navigate('/')} />
      <section className="glass-card">
        <div className="card-header">
          <h2 className="card-title" style={{ color: '#111' }}>
            {t('auth.login_title')}
          </h2>
          <button className="secondary-btn" onClick={() => setId('demo')}>
            {t('auth.quick_fill')}
          </button>
        </div>
        <div className="form-grid">
          <div className="input-field">
            <label htmlFor="login-id">{t('auth.id_label')}</label>
            <input
              id="login-id"
              className="text-input"
              placeholder={t('auth.username_placeholder')}
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>
          <div className="input-field">
            <label htmlFor="login-pw">{t('auth.pw_label')}</label>
            <input
              id="login-pw"
              className="text-input"
              type="password"
              placeholder={t('auth.pw_placeholder')}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </div>
          <button className="primary-btn" onClick={onLogin}>
            {t('auth.login_btn')}
          </button>
          {status && (
            <p className="muted" style={{ color: '#222' }}>
              {status}
            </p>
          )}

          <div style={{ marginTop: 30, paddingTop: 20, borderTop: '1px solid rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <p className="muted" style={{ marginBottom: 10, color: '#222' }}>
              {t('auth.no_account')}
            </p>
            <Link
              to="/register"
              className="secondary-btn"
              style={{ display: 'inline-block', width: '100%', textAlign: 'center', textDecoration: 'none' }}>
              {t('auth.create_account')}
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
