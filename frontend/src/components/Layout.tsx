import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Toast from './Toast';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
  pageTitle?: string;
  subtitle?: string;
}

export default function Layout({ children }: LayoutProps) {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const { token, logout, user } = useAuth();

  // Check if user has admin role
  const isAdmin = user?.roles?.some((r: any) => 
    r === 'ROLE_ADMIN' || r.name === 'ROLE_ADMIN' || (typeof r === 'object' && r.toString() === 'ROLE_ADMIN')
  );

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleLogout = () => {
    // Remove confirmation, just logout with toast
    setToastMessage(t('auth.logout_success'));
    setShowToast(true);
    setTimeout(() => {
      logout();
    }, 1000); 
  };

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/dashboard', label: t('nav.dashboard') },
    { to: '/decks', label: t('nav.my_decks') },
    { to: '/study', label: t('nav.study') },
    { to: '/chat', label: 'AI Chat' },
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
          <Toast 
            isOpen={showToast} 
            message={toastMessage} 
            type="success" 
            onClose={() => setShowToast(false)} 
          />
          <div className="brand">
            <img src="/dango.svg" alt="Dango Logo" className="brand-logo" />
            <span style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", sans-serif', color: '#d9534f' }}>DANGO</span>
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
            {isAdmin && (
              <Link
                to="/admin"
                className="nav-link admin-link"
                style={{
                  borderColor: pathname.startsWith('/admin') ? 'rgba(102, 126, 234, 0.6)' : undefined,
                  background: pathname.startsWith('/admin') ? 'rgba(102, 126, 234, 0.2)' : undefined,
                  color: pathname.startsWith('/admin') ? '#667eea' : '#6c757d',
                  fontWeight: pathname.startsWith('/admin') ? 'bold' : undefined,
                  fontSize: '12px',
                  padding: '4px 10px',
                }}>
                ⚙️ Admin
              </Link>
            )}
          </div>
        </header>

        <main className="content-area">{children}</main>

        <footer className="footer" style={{
          padding: '30px 20px',
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e9ecef',
          textAlign: 'center',
          color: '#000',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          {/* 서비스 이름: Flex를 활용해 아이콘과 텍스트의 수평/수직 열을 완벽히 맞춤 */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{ fontSize: '18px', marginRight: '8px', display: 'flex', alignItems: 'center' }}>🍡</span>
            <strong style={{ fontSize: '15px', letterSpacing: '-0.3px' }}>
              반복 간격 알고리즘 활용 일본어 지식 카드 관리 및 학습 플랫폼
            </strong>
          </div>

          {/* 팀원 정보: 이모지와 텍스트 열 맞춤 */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '12px',
            fontSize: '13px'
          }}>
            <span style={{ margin: '0 10px' }}>👤 <b>조장</b> 박제하</span>
            <span style={{ color: '#dee2e6' }}>|</span>
            <span style={{ margin: '0 10px' }}>👥 <b>조원</b> 이산하, 임문현, 전민종</span>
          </div>

          {/* 버전 및 날짜: Latest update. 만 크림슨 적용 */}
          <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '12px' }}>
            <span style={{
              backgroundColor: '#e9ecef',
              padding: '2px 8px',
              borderRadius: '4px',
              marginRight: '12px'
            }}>
              Version 1.03
            </span>
            <span style={{ color: '#000' }}>
              <span style={{ color: 'crimson', fontWeight: 'bold' }}>최신 업데이트 일자 :&nbsp;&nbsp;</span> 2026.02.04. 18:17
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
