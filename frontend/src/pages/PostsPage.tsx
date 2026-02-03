import { useEffect, useState } from 'react';
import { api } from '../libs/api';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Post } from '../types/post';

export default function PostsPage() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');

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

  return (
    <Layout pageTitle={t('post_detail.posts_title')}>
      <section className="glass-card">
        <div className="card-header">
          <h2 className="card-title">{t('post_detail.posts_title')}</h2>
          <Link to="/posts/create" className="primary-btn">
            {t('post.new_post')}
          </Link>
        </div>

        <p className="muted">{status}</p>
        <div className="card-grid">
          {posts.map((p) => (
            <article key={p.id} className="item-tile">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <Link to={`/posts/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 className="item-title">
                      {p.isNotice && <span style={{ color: '#ff6b6b', marginRight: 8, fontWeight: 'bold' }}>{t('home.notice_tag')}</span>}
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
                        api
                          .post(`/posts/${p.id}/like`)
                          .then((res) => {
                            setPosts(posts.map((post) => (post.id === p.id ? res.data : post)));
                          })
                          .catch(console.error);
                      }}>
                      ♥ {p.likeCount}
                    </button>
                    <Link to={`/posts/${p.id}`} className="muted" style={{ textDecoration: 'underline' }}>
                      {t('post_detail.view_comments')}
                    </Link>
                  </div>
                </div>
                {currentUserId && p.authorId === currentUserId && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/posts/${p.id}/edit`} className="muted" style={{ fontSize: '0.8rem', textDecoration: 'underline' }}>
                      {t('common.edit')}
                    </Link>
                    <button
                      onClick={() => {
                        if (window.confirm(t('post_detail.delete_post_confirm'))) {
                          api
                            .delete(`/posts/${p.id}`)
                            .then(() => {
                              setPosts(posts.filter((post) => post.id !== p.id));
                            })
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
