import React, { useEffect, useState } from 'react';
import { AdminApi } from '../../libs/adminApi';
import type { AdminStats } from '../../libs/adminApi';

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await AdminApi.getStats();
        setStats(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || '통계를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = stats ? [
    { label: '전체 사용자', value: stats.totalUsers, icon: '👥', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
    { label: '전체 덱', value: stats.totalDecks, icon: '🃏', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
    { label: '전체 카드', value: stats.totalCards, icon: '📇', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
    { label: '게시글', value: stats.totalPosts, icon: '📝', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    { label: '학습 기록', value: stats.totalStudyLogs, icon: '📚', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
    { label: '공개 덱', value: stats.publicDecks, icon: '🌐', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
    { label: '공지사항', value: stats.notices, icon: '📢', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
  ] : [];

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <h1>📊 대시보드</h1>
        <p>시스템 현황을 한눈에 확인하세요</p>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <span>통계를 불러오는 중...</span>
        </div>
      )}

      {error && (
        <div className="error-state">
          <span>⚠️ {error}</span>
        </div>
      )}

      {stats && (
        <>
          <div className="stats-grid">
            {statCards.map((card, idx) => (
              <div 
                key={idx} 
                className="stat-card"
                style={{ '--card-color': card.color, '--card-bg': card.bg } as React.CSSProperties}
              >
                <div className="stat-icon">{card.icon}</div>
                <div className="stat-content">
                  <span className="stat-value">{card.value.toLocaleString()}</span>
                  <span className="stat-label">{card.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard-sections">
            <div className="dashboard-card">
              <h3>🖥️ 시스템 상태</h3>
              <div className="status-list">
                <div className="status-item">
                  <span className="status-dot online"></span>
                  <span>API 서버</span>
                  <span className="status-badge online">정상</span>
                </div>
                <div className="status-item">
                  <span className="status-dot online"></span>
                  <span>데이터베이스</span>
                  <span className="status-badge online">정상</span>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <h3>📈 빠른 통계</h3>
              <div className="quick-stats">
                <div className="quick-stat">
                  <span className="quick-stat-value">{stats.publicDecks}</span>
                  <span className="quick-stat-label">공개된 덱</span>
                </div>
                <div className="quick-stat">
                  <span className="quick-stat-value">{stats.notices}</span>
                  <span className="quick-stat-label">공지사항</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .admin-dashboard {
          color: #fff;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .page-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #fff, rgba(255,255,255,0.7));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .page-header p {
          margin: 0;
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
        }

        .loading-state, .error-state {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        .error-state {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: #feca57;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: var(--card-bg);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          border-color: var(--card-color);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .stat-icon {
          font-size: 36px;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--card-color);
        }

        .stat-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 4px;
        }

        .dashboard-sections {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .dashboard-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 24px;
        }

        .dashboard-card h3 {
          margin: 0 0 20px 0;
          font-size: 16px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
        }

        .status-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.online {
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }

        .status-item span:nth-child(2) {
          flex: 1;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge.online {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .quick-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .quick-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
        }

        .quick-stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #feca57;
        }

        .quick-stat-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboardPage;