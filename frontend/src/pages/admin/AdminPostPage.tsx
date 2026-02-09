import React, { useEffect, useState } from 'react';
import { AdminApi } from '../../libs/adminApi';
import type { AdminPost } from '../../libs/adminApi';

const AdminPostPage: React.FC = () => {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async (query?: string) => {
    setLoading(true);
    try {
      const res = await AdminApi.getPosts(query);
      setPosts(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '게시글 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts(searchQuery);
  };

  const handleToggleNotice = async (post: AdminPost) => {
    try {
      await AdminApi.toggleNotice(post.id, !post.isNotice);
      fetchPosts(searchQuery);
    } catch (err: any) {
      alert(err.response?.data?.message || '공지 설정에 실패했습니다.');
    }
  };

  const handleDelete = async (post: AdminPost) => {
    if (!confirm(`정말 "${post.title}" 게시글을 삭제하시겠습니까?`)) return;
    try {
      await AdminApi.deletePost(post.id);
      fetchPosts(searchQuery);
    } catch (err: any) {
      alert(err.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  return (
    <div className="admin-posts">
      <div className="page-header">
        <div className="header-left">
          <h1>📝 게시글 관리</h1>
          <p>게시글 조회 및 공지사항을 관리합니다</p>
        </div>
      </div>

      {/* Search */}
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="제목 또는 내용으로 검색..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-btn">검색</button>
      </form>

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
              <th>제목</th>
              <th>작성자</th>
              <th>좋아요</th>
              <th>공지</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="loading-cell">
                  <div className="spinner"></div>
                  <span>불러오는 중...</span>
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-cell">
                  {searchQuery ? '검색 결과가 없습니다.' : '등록된 게시글이 없습니다.'}
                </td>
              </tr>
            ) : (
              posts.map(post => (
                <tr key={post.id} className={post.isNotice ? 'notice-row' : ''}>
                  <td className="id-cell">{post.id}</td>
                  <td className="title-cell">
                    <div className="post-title">
                      {post.isNotice && <span className="notice-badge">📢</span>}
                      {post.title}
                    </div>
                  </td>
                  <td className="author-cell">{post.authorName || '-'}</td>
                  <td className="like-cell">
                    <span className="like-count">❤️ {post.likeCount || 0}</span>
                  </td>
                  <td>
                    <button 
                      className={`toggle-btn ${post.isNotice ? 'active' : ''}`}
                      onClick={() => handleToggleNotice(post)}
                    >
                      {post.isNotice ? '공지 해제' : '공지 설정'}
                    </button>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-action btn-delete" onClick={() => handleDelete(post)}>
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .admin-posts {
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
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .search-input {
          flex: 1;
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

        .search-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .search-btn:hover {
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
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

        .notice-row td {
          background: rgba(245, 158, 11, 0.05);
        }

        .notice-row:hover td {
          background: rgba(245, 158, 11, 0.08);
        }

        .id-cell {
          color: rgba(255, 255, 255, 0.4);
          font-size: 12px;
          width: 60px;
        }

        .title-cell {
          max-width: 350px;
        }

        .post-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .notice-badge {
          font-size: 16px;
        }

        .author-cell {
          color: #60a5fa;
        }

        .like-cell {
          text-align: center;
        }

        .like-count {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
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

        .toggle-btn {
          padding: 6px 12px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 6px;
          color: #fbbf24;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toggle-btn:hover {
          background: rgba(245, 158, 11, 0.25);
        }

        .toggle-btn.active {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.3);
          color: #34d399;
        }

        .toggle-btn.active:hover {
          background: rgba(16, 185, 129, 0.25);
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
      `}</style>
    </div>
  );
};

export default AdminPostPage;