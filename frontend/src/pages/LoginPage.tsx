import { useState } from 'react';
import { api } from '../libs/api';
import Layout from '../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const { login } = useAuth(); // Destructure login from useAuth

  const onLogin = async () => {
    try {
      const res = await api.post('/auth/login', { username: id, password: pw });
      const { accessToken, refreshToken } = res.data;
      
      // Use the login function from AuthContext to update global state
      login(accessToken, refreshToken);
      
      setToastMessage(t('auth.login_success'));
      setToastType('success');
      setShowToast(true);
      
      // Auto redirect without waiting for user interaction
      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      console.error(err);
      setToastMessage(t('auth.login_fail'));
      setToastType('error');
      setShowToast(true);
    }
  };

  return (
    <Layout pageTitle={t('auth.login_title')}>
      <Toast 
        isOpen={showToast} 
        message={toastMessage} 
        type={toastType}
        onClose={() => setShowToast(false)} 
      />
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
