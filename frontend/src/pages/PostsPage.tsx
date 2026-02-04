import { useEffect, useState } from 'react';
import { api } from '../libs/api';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Post, PostCategory } from '../types/post';

export default function PostsPage() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');

  const [activeTab, setActiveTab] = useState<PostCategory | 'ALL'>('ALL');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api
        .get<{ id: number }>('/users/me')
        .then((res) => setCurrentUserId(res.data.id))
        .catch(() => setCurrentUserId(null));
    }
  }, []);

  useEffect(() => {
    setStatus(t('common.loading'));
    const params = new URLSearchParams();
    if (query) params.append('q', query);

    api
      .get<Post[]>(`/posts?${params.toString()}`)
      .then((res) => {
        setPosts(res.data);
        setStatus(res.data.length ? '' : t('post_detail.no_posts_found'));
      })
      .catch(() => setStatus(t('post_detail.fail_load_posts')));
  }, [query, t]);

  const filteredPosts = activeTab === 'ALL'
    ? posts
    : posts.filter((post) => post.category === activeTab);

  return (
    <Layout pageTitle={t('post_detail.posts_title')}>
      <section className="glass-card">
        <div className="card-header">
          <h2 className="card-title">{t('post_detail.posts_title')}</h2>
          <Link to="/posts/create" className="primary-btn">
            {t('post.new_post')}
          </Link>
        </div>

        {/* 탭 메뉴 */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <TabButton label="전체" active={activeTab === 'ALL'} onClick={() => setActiveTab('ALL')} />
          <TabButton label="자유" active={activeTab === 'FREE'} onClick={() => setActiveTab('FREE')} />
          <TabButton label="질문" active={activeTab === 'QNA'} onClick={() => setActiveTab('QNA')} />
          <TabButton label="스터디" active={activeTab === 'STUDY'} onClick={() => setActiveTab('STUDY')} />
        </div>

        <p className="muted">{status}</p>

        <div className="card-grid">
          {filteredPosts.map((p) => (
            <article key={p.id} className="item-tile">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <Link to={`/posts/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 className="item-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                      {/* 카테고리 뱃지 */}
                      <span style={{
                        fontSize: '0.7em',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: p.category === 'STUDY' ? '#2563eb' : (p.category === 'QNA' ? '#ea580c' : 'rgba(255,255,255,0.15)'),
                        color: 'white',
                        fontWeight: 'bold',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        {p.category === 'STUDY' ? '스터디' : (p.category === 'QNA' ? '질문' : '자유')}
                      </span>

                      {/* 모집중 뱃지 */}
                      {p.category === 'STUDY' && p.recruitmentStatus === 'OPEN' && (
                        <span style={{ fontSize: '0.7em', border: '1px solid #4ade80', color: '#4ade80', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold' }}>
                          모집중
                        </span>
                      )}

                      {p.isNotice && <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>[{t('home.notice_tag')}]</span>}
                      {p.title}
                    </h3>
                  </Link>

                  <div className="item-subtitle" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                    <span style={{ marginRight: 10 }}>{t('post_detail.by_author', { name: p.authorName || t('post_detail.unknown_author') })}</span>
                  </div>

                  <div style={{ marginTop: 8, display: 'flex', gap: 10, fontSize: '0.85rem', alignItems: 'center' }} className="muted">
                    <button
                      className="secondary-btn"
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                      onClick={() => {
                        api.post(`/posts/${p.id}/like`)
                          .then((res) => setPosts(posts.map((post) => (post.id === p.id ? res.data : post))))
                          .catch(console.error);
                      }}>
                      ♥ {p.likeCount}
                    </button>
                    <Link to={`/posts/${p.id}`} className="muted" style={{ textDecoration: 'underline' }}>
                      {t('post_detail.view_comments')}
                    </Link>
                  </div>
                </div>

                {/* 수정/삭제 버튼 */}
                {currentUserId && p.authorId === currentUserId && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/posts/${p.id}/edit`} className="muted" style={{ fontSize: '0.8rem', textDecoration: 'underline' }}>
                      {t('common.edit')}
                    </Link>
                    <button
                      onClick={() => {
                        if (window.confirm(t('post_detail.delete_post_confirm'))) {
                          api.delete(`/posts/${p.id}`)
                            .then(() => setPosts(posts.filter((post) => post.id !== p.id)))
                            .catch(() => alert(t('post_detail.fail_delete_post')));
                        }
                      }}
                      className="muted"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline', padding: 0 }}>
                      {t('common.delete')}
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <div style={{ marginTop: 20 }}>
          <input
            className="input-field"
            style={{ width: '100%' }}
            placeholder={t('post_detail.search_placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </section>
    </Layout>
  );
}

// ★ 수정된 탭 버튼 스타일 (더 밝고 선명하게)
const TabButton = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button
      type="button"
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        // 활성 상태: 완전 검정(#000000), 비활성 상태: 회색(#888888)
        color: active ? '#000000' : '#888888',
        fontWeight: active ? 'bold' : '500',
        cursor: 'pointer',
        fontSize: '1.05rem',
        padding: '8px 10px',
        // 밑줄도 검은색으로 통일
        borderBottom: active ? '3px solid #000000' : '3px solid transparent',
        transition: 'all 0.2s ease',
      }}
      // 마우스 올렸을 때: 무조건 검은색으로 진하게
      onMouseEnter={(e) => { e.currentTarget.style.color = '#000000'; }}
      // 마우스 뗐을 때: 활성이면 검은색 유지, 비활성이면 다시 회색으로 복귀
      onMouseLeave={(e) => { e.currentTarget.style.color = active ? '#000000' : '#888888'; }}
    >
      {label}
    </button>
);