import React, { useEffect, useState, useMemo } from 'react';
import { AdminApi } from '../../libs/adminApi';
import type { AdminUser } from '../../libs/adminApi';

const AdminUserPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({ username: '', password: '', roles: 'ROLE_USER', status: 'ACTIVE' });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async (pageNum: number = 0) => {
    setLoading(true);
    try {
      const res = await AdminApi.getUsers(pageNum, 100); // 검색을 위해 더 많이 가져옴
      setUsers(res.data.content);
      setTotalPages(res.data.totalPages);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.response?.data?.message || '회원 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 클라이언트 사이드 필터링
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.username?.toLowerCase().includes(query) ||
      user.nickname?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingUser(null);
    setFormData({ username: '', password: '', roles: 'ROLE_USER', status: 'ACTIVE' });
    setShowModal(true);
  };

  const openEditModal = (user: AdminUser) => {
    setModalMode('edit');
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      roles: user.roles?.[0] || 'ROLE_USER',
      status: user.status || 'ACTIVE'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        username: formData.username,
        password: formData.password || undefined,
        roles: [formData.roles],
        status: formData.status
      };

      if (modalMode === 'create') {
        await AdminApi.createUser(payload as any);
      } else if (editingUser) {
        await AdminApi.updateUser(editingUser.id, payload as any);
      }
      setShowModal(false);
      fetchUsers(page);
    } catch (err: any) {
      alert(err.response?.data?.message || '작업에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`정말 "${user.username}" 회원을 삭제하시겠습니까?`)) return;
    try {
      await AdminApi.deleteUser(user.id);
      fetchUsers(page);
    } catch (err: any) {
      alert(err.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  const getRoleBadge = (roles: string[]) => {
    if (roles?.includes('ROLE_ADMIN')) return { label: '관리자', class: 'role-admin' };
    if (roles?.includes('ROLE_MANAGER')) return { label: '매니저', class: 'role-manager' };
    return { label: '일반', class: 'role-user' };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return { label: '활성', class: 'status-active' };
      case 'INACTIVE': return { label: '비활성', class: 'status-inactive' };
      case 'BANNED': return { label: '정지', class: 'status-banned' };
      default: return { label: status, class: '' };
    }
  };

  return (
    <div className="admin-users">
      <div className="page-header">
        <div className="header-left">
          <h1>👥 회원 관리</h1>
          <p>등록된 회원을 조회하고 관리합니다</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <span>+</span> 회원 추가
        </button>
      </div>

      {/* Search */}
      <div className="search-form">
        <input
          type="text"
          placeholder="계정 또는 닉네임으로 검색..."
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
              <th>계정</th>
              <th>닉네임</th>
              <th>권한</th>
              <th>상태</th>
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
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-cell">
                  {searchQuery ? '검색 결과가 없습니다.' : '등록된 회원이 없습니다.'}
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => {
                const role = getRoleBadge(user.roles);
                const status = getStatusBadge(user.status);
                return (
                  <tr key={user.id}>
                    <td className="id-cell">{user.id}</td>
                    <td className="username-cell">{user.username}</td>
                    <td>{user.nickname || '-'}</td>
                    <td><span className={`badge ${role.class}`}>{role.label}</span></td>
                    <td><span className={`badge ${status.class}`}>{status.label}</span></td>
                    <td className="actions-cell">
                      <button className="btn-action btn-edit" onClick={() => openEditModal(user)}>수정</button>
                      <button className="btn-action btn-delete" onClick={() => handleDelete(user)}>삭제</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && !searchQuery && (
        <div className="pagination">
          <button 
            disabled={page === 0} 
            onClick={() => fetchUsers(page - 1)}
            className="page-btn"
          >
            이전
          </button>
          <span className="page-info">{page + 1} / {totalPages}</span>
          <button 
            disabled={page >= totalPages - 1} 
            onClick={() => fetchUsers(page + 1)}
            className="page-btn"
          >
            다음
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{modalMode === 'create' ? '회원 추가' : '회원 수정'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>아이디 (이메일)</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  required
                  disabled={modalMode === 'edit'}
                />
              </div>
              <div className="form-group">
                <label>비밀번호 {modalMode === 'edit' && '(변경 시에만 입력)'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  required={modalMode === 'create'}
                />
              </div>
              <div className="form-group">
                <label>권한</label>
                <select
                  value={formData.roles}
                  onChange={e => setFormData({...formData, roles: e.target.value})}
                >
                  <option value="ROLE_USER">일반 사용자</option>
                  <option value="ROLE_MANAGER">매니저</option>
                  <option value="ROLE_ADMIN">관리자</option>
                </select>
              </div>
              <div className="form-group">
                <label>상태</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="ACTIVE">활성</option>
                  <option value="INACTIVE">비활성</option>
                  <option value="BANNED">정지</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>취소</button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? '처리 중...' : (modalMode === 'create' ? '추가' : '저장')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-users {
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

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
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

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
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
        }

        .username-cell {
          font-weight: 500;
          color: #fff;
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

        .role-admin {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
        }

        .role-manager {
          background: rgba(254, 202, 87, 0.15);
          color: #feca57;
        }

        .role-user {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
        }

        .status-active {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
        }

        .status-inactive {
          background: rgba(156, 163, 175, 0.15);
          color: #9ca3af;
        }

        .status-banned {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
        }

        .actions-cell {
          display: flex;
          gap: 8px;
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

        .btn-edit {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
        }

        .btn-edit:hover {
          background: rgba(59, 130, 246, 0.3);
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

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: linear-gradient(135deg, #1e2a3a, #1a1f2e);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 32px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .modal-content h2 {
          margin: 0 0 24px 0;
          font-size: 20px;
          font-weight: 600;
          color: #fff;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .form-group select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='white' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
        }

        .form-group select option {
          background: #1a1f2e;
          color: #fff;
          padding: 12px;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #3b82f6;
          background: rgba(255, 255, 255, 0.08);
        }

        .form-group input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 28px;
        }

        .btn-cancel {
          flex: 1;
          padding: 12px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .btn-submit {
          flex: 1;
          padding: 12px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-submit:hover:not(:disabled) {
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default AdminUserPage;