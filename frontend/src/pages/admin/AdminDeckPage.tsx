import React, { useEffect, useState, useMemo } from 'react';
import { AdminApi } from '../../libs/adminApi';
import type { AdminDeck } from '../../libs/adminApi';

const AdminDeckPage: React.FC = () => {
  const [decks, setDecks] = useState<AdminDeck[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDecks = async (pageNum: number = 0) => {
    setLoading(true);
    try {
      const res = await AdminApi.getDecks(pageNum, 100); // 검색을 위해 더 많이 가져옴
      setDecks(res.data.content);
      setTotalPages(res.data.totalPages);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.response?.data?.message || '덱 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  // 클라이언트 사이드 필터링
  const filteredDecks = useMemo(() => {
    if (!searchQuery.trim()) return decks;
    const query = searchQuery.toLowerCase();
    return decks.filter(deck => 
      deck.name?.toLowerCase().includes(query) ||
      deck.description?.toLowerCase().includes(query) ||
      deck.ownerUsername?.toLowerCase().includes(query)
    );
  }, [decks, searchQuery]);

  const handleDelete = async (deck: AdminDeck) => {
    if (!confirm(`정말 "${deck.name}" 덱을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
    try {
      await AdminApi.deleteDeck(deck.id);
      fetchDecks(page);
    } catch (err: any) {
      alert(err.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  return (
    <div className="admin-decks">
      <div className="page-header">
        <div className="header-left">
          <h1>🃏 덱 관리</h1>
          <p>생성된 모든 덱을 조회하고 관리합니다</p>
        </div>
      </div>

      {/* Search */}
      <div className="search-form">
        <input
          type="text"
          placeholder="덱 이름, 설명 또는 소유자로 검색..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {error && (
        <div className="error-state">
          <span>⚠️ {error}</span>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>덱 이름</th>
              <th>설명</th>
              <th>소유자</th>
              <th>카드 수</th>
              <th>공개</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="loading-cell">
                  <div className="spinner"></div>
                  <span>불러오는 중...</span>
                </td>
              </tr>
            ) : filteredDecks.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-cell">
                  {searchQuery ? '검색 결과가 없습니다.' : '등록된 덱이 없습니다.'}
                </td>
              </tr>
            ) : (
              filteredDecks.map(deck => (
                <tr key={deck.id}>
                  <td className="id-cell">{deck.id}</td>
                  <td className="name-cell">
                    <div className="deck-name">{deck.name}</div>
                  </td>
                  <td className="desc-cell">
                    {deck.description || <span className="empty-text">-</span>}
                  </td>
                  <td className="owner-cell">{deck.ownerUsername}</td>
                  <td className="count-cell">
                    <span className="card-count">{deck.cardCount || 0}</span>
                  </td>
                  <td>
                    <span className={`badge ${deck.isPublic ? 'public' : 'private'}`}>
                      {deck.isPublic ? '공개' : '비공개'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-action btn-delete" onClick={() => handleDelete(deck)}>
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && !searchQuery && (
        <div className="pagination">
          <button 
            disabled={page === 0} 
            onClick={() => fetchDecks(page - 1)}
            className="page-btn"
          >
            이전
          </button>
          <span className="page-info">{page + 1} / {totalPages}</span>
          <button 
            disabled={page >= totalPages - 1} 
            onClick={() => fetchDecks(page + 1)}
            className="page-btn"
          >
            다음
          </button>
        </div>
      )}

      <style>{`
        .admin-decks {
          color: #fff;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .header-left h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #fff, rgba(255,255,255,0.7));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-left p {
          margin: 0;
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
        }

        .search-form {
          margin-bottom: 24px;
        }

        .search-input {
          width: 100%;
          max-width: 400px;
          padding: 12px 18px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: rgba(255, 255, 255, 0.08);
        }

        .error-state {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          color: #fca5a5;
          margin-bottom: 24px;
        }

        .table-container {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          overflow: hidden;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          padding: 16px 20px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .data-table td {
          padding: 16px 20px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .data-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }

        .id-cell {
          color: rgba(255, 255, 255, 0.4);
          font-size: 12px;
          width: 60px;
        }

        .name-cell {
          max-width: 200px;
        }

        .deck-name {
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .desc-cell {
          max-width: 250px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .empty-text {
          color: rgba(255, 255, 255, 0.3);
        }

        .owner-cell {
          color: #60a5fa;
        }

        .count-cell {
          text-align: center;
        }

        .card-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          padding: 4px 10px;
          background: rgba(139, 92, 246, 0.15);
          color: #a78bfa;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
        }

        .loading-cell, .empty-cell {
          text-align: center;
          padding: 48px 20px !important;
          color: rgba(255, 255, 255, 0.4);
        }

        .loading-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
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

        .badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .badge.public {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
        }

        .badge.private {
          background: rgba(156, 163, 175, 0.15);
          color: #9ca3af;
        }

        .actions-cell {
          width: 80px;
        }

        .btn-action {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-delete {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
        }

        .btn-delete:hover {
          background: rgba(239, 68, 68, 0.3);
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 24px;
        }

        .page-btn {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .page-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.15);
        }

        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .page-info {
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default AdminDeckPage;