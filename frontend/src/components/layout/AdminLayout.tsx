import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 관리자/매니저 권한 체크
  React.useEffect(() => {
    const hasAccess = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_MANAGER');
    if (user && !hasAccess) {
      navigate('/');
    }
  }, [user, navigate]);

  const navItems = [
    { path: '/admin', label: '대시보드', icon: '📊', exact: true },
    { path: '/admin/users', label: '회원 관리', icon: '👥' },
    { path: '/admin/decks', label: '덱 관리', icon: '🃏' },
    { path: '/admin/notices', label: '게시글 관리', icon: '📝' },
  ];

  return (
    <div className="admin-layout">
      {/* 관리자 헤더 */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-logo">
            <span className="admin-logo-icon">🛡️</span>
            <span className="admin-logo-text">Admin Panel</span>
          </div>
          <div className="admin-header-right">
            <span className="admin-user-badge">
              {user?.nickname || user?.username || 'Admin'}
            </span>
            <button 
              className="admin-exit-btn"
              onClick={() => navigate('/')}
            >
              사이트로 돌아가기
            </button>
          </div>
        </div>
      </header>

      <div className="admin-body">
        {/* 왼쪽 사이드바 */}
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `admin-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span className="admin-nav-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <div className="admin-version">v1.0.0</div>
          </div>
        </aside>

        {/* 오른쪽 콘텐츠 영역 */}
        <main className="admin-main">
          <Outlet />
        </main>
      </div>

      <style>{`
        .admin-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
        }

        .admin-header {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0 24px;
          height: 64px;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .admin-header-content {
          max-width: 1600px;
          margin: 0 auto;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .admin-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-logo-icon {
          font-size: 28px;
        }

        .admin-logo-text {
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(135deg, #ff6b6b, #feca57);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .admin-header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .admin-user-badge {
          padding: 6px 14px;
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(254, 202, 87, 0.2));
          border: 1px solid rgba(255, 107, 107, 0.3);
          border-radius: 20px;
          color: #feca57;
          font-size: 13px;
          font-weight: 500;
        }

        .admin-exit-btn {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .admin-exit-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
        }

        .admin-body {
          flex: 1;
          display: flex;
        }

        .admin-sidebar {
          width: 260px;
          background: rgba(255, 255, 255, 0.02);
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          padding: 24px 0;
        }

        .admin-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 0 12px;
        }

        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .admin-nav-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.9);
        }

        .admin-nav-item.active {
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.15), rgba(254, 202, 87, 0.15));
          color: #feca57;
          border: 1px solid rgba(254, 202, 87, 0.2);
        }

        .admin-nav-icon {
          font-size: 20px;
        }

        .admin-nav-label {
          flex: 1;
        }

        .admin-sidebar-footer {
          padding: 16px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .admin-version {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.3);
          text-align: center;
        }

        .admin-main {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            width: 80px;
          }
          
          .admin-nav-label,
          .admin-logo-text {
            display: none;
          }

          .admin-nav-item {
            justify-content: center;
            padding: 14px;
          }

          .admin-nav-icon {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;