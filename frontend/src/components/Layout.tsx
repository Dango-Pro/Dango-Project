import type { ReactNode } from 'react';

import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface LayoutProps {
  children: ReactNode;
  pageTitle?: string;
  subtitle?: string;
}

export default function Layout({ children }: LayoutProps) {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    if (confirm(t('common.confirm') + '?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
  };

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/dashboard', label: t('nav.dashboard') },
    { to: '/decks', label: t('nav.my_decks') },
    { to: '/study', label: t('nav.study') },
    { to: '/posts', label: t('nav.community') },
    { to: '/user', label: t('nav.mypage') },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="app-shell">
      <div className="app-frame">
        <header className="top-nav">
          <div className="brand">
            <span className="brand-dot" /> JP Card Studio
          </div>
          <div className="nav-links">
            <div className="lang-switcher" style={{ marginRight: '20px', display: 'flex', gap: '5px' }}>
              <button
                onClick={() => changeLanguage('ko')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: i18n.language === 'ko' ? '#333' : '#aaa',
                  fontWeight: i18n.language === 'ko' ? 'bold' : 'normal',
                  cursor: 'pointer',
                }}>
                KO
              </button>
              <button
                onClick={() => changeLanguage('en')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: i18n.language === 'en' ? '#333' : '#aaa',
                  fontWeight: i18n.language === 'en' ? 'bold' : 'normal',
                  cursor: 'pointer',
                }}>
                EN
              </button>
              <button
                onClick={() => changeLanguage('ja')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: i18n.language === 'ja' ? '#333' : '#aaa',
                  fontWeight: i18n.language === 'ja' ? 'bold' : 'normal',
                  cursor: 'pointer',
                }}>
                JA
              </button>
            </div>
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="nav-link"
                style={{
                  borderColor: pathname === link.to ? 'rgba(255, 183, 178, 0.6)' : undefined,
                  background: pathname === link.to ? 'rgba(255, 183, 178, 0.25)' : undefined,
                  color: pathname === link.to ? '#d9534f' : undefined,
                  fontWeight: pathname === link.to ? 'bold' : undefined,
                }}>
                {link.label}
              </Link>
            ))}
            {!token ? (
              <Link
                to="/login"
                className="nav-link"
                style={{
                  borderColor: pathname === '/login' ? 'rgba(255, 183, 178, 0.6)' : undefined,
                  background: pathname === '/login' ? 'rgba(255, 183, 178, 0.25)' : undefined,
                  color: pathname === '/login' ? '#d9534f' : undefined,
                  fontWeight: pathname === '/login' ? 'bold' : undefined,
                }}>
                {t('nav.login')}
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="nav-link"
                style={{
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                }}>
                {t('nav.logout')}
              </button>
            )}
          </div>
        </header>

        <main className="content-area">{children}</main>

        <footer className="footer">
          <span className="muted">반복 간격 알고리즘 활용한 일본어 지식 카드 관리 및 학습 플렛폼, 조장: 박제하 조원: 이산하, 임문현, 전민종</span>
          <span className="muted" style={{ whiteSpace: 'nowrap' }}>
            version. 1.01
          </span>
        </footer>
      </div>
    </div>
  );
}
