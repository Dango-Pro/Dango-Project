import { useEffect, useState } from 'react';
import { api } from '../libs/api';
import Layout from '../components/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Post } from '../types/post';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function PostEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isNotice, setIsNotice] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    api
      .get<Post>(`/posts/${id}`)
      .then((res) => {
        setTitle(res.data.title);
        setContent(res.data.content);
        setIsNotice(res.data.isNotice);
      })
      .catch((err) => {
        console.error(err);
        setStatus(t('post_detail.post_not_found_error'));
      });

    api
      .get('/users/me')
      .then((res) => {
        const roles = res.data.roles || [];
        if (roles.includes('ROLE_MANAGER')) setIsManager(true);
      })
      .catch(() => {});
  }, [id, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/posts/${id}`, { title, content, isNotice });
      navigate('/posts');
    } catch (err) {
      console.error(err);
      setStatus(t('common.fail_update'));
    }
  };

  return (
    <Layout pageTitle={t('post_detail.edit_post_title')}>
      <section className="glass-card">
        <h2 className="card-title">{t('post_detail.edit_post_title')}</h2>
        {status && <p className="muted">{status}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label htmlFor="post-title" style={{ display: 'block', marginBottom: 4 }} className="muted">
              {t('post.title')}
            </label>
            <input id="post-title" className="input-field text-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          {isManager && (
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isNotice}
                  onChange={(e) => setIsNotice(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#ff6b6b' }}
                />
                <span style={{ color: '#ff6b6b', fontWeight: 600 }}>{t('post.notice')}</span>
              </label>
            </div>
          )}

          <div>
            <label htmlFor="post-content" style={{ display: 'block', marginBottom: 4 }} className="muted">
              {t('post.content')}
            </label>
            <div className="quill-wrapper">
              <ReactQuill theme="snow" value={content} onChange={setContent} />
            </div>
          </div>
          <button type="submit" className="primary-btn" style={{ marginTop: 8 }}>
            {t('post_detail.submit_edit')}
          </button>
        </form>
      </section>
    </Layout>
  );
}
