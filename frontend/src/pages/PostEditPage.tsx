import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../libs/api';
import Layout from '../components/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import type { PostCategory, StudyType } from "../types/post";

export default function PostEditPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('FREE');
  const [studyType, setStudyType] = useState<StudyType>('ONLINE');
  const [contactLink, setContactLink] = useState('');
  const [isNotice, setIsNotice] = useState(false);
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    // 사용자 권한 확인
    api.get('/users/me').then((res) => {
        if (res.data.roles?.includes('ROLE_MANAGER')) setIsManager(true);
    }).catch(() => {});

    // 글 정보 불러오기
    api.get(`/posts/${id}`).then((res) => {
        const p = res.data;
        setTitle(p.title);
        setContent(p.content);
        setCategory(p.category);
        setIsNotice(p.isNotice);
        if (p.category === 'STUDY') {
            setStudyType(p.studyType || 'ONLINE');
            setContactLink(p.contactLink || '');
        }
    }).catch((err) => console.error(err));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 수정 API 호출 (백엔드 DTO에 맞춰 데이터 전송)
      await api.put(`/posts/${id}`, {
          title, content, isNotice, category,
          studyType: category === 'STUDY' ? studyType : null,
          contactLink: category === 'STUDY' ? contactLink : null
      });
      navigate('/posts');
    } catch (err) { alert(t("post.edit_fail")); }
  };

  return (
    <Layout pageTitle={t("post.edit_page_title")}>
      <section className="glass-card">
        <h2 className="card-title">{t("post.edit_page_title")}</h2>
        <form onSubmit={handleSubmit} className="form-grid">

          <div className="input-field">
            <label>{t("post.category_label")}</label>
            <select className="text-input" value={category} onChange={e => setCategory(e.target.value as PostCategory)}>
                <option value="FREE">{t("post.category_free")}</option>
                <option value="QNA">{t("post.category_qna")}</option>
                <option value="STUDY">{t("post.category_study")}</option>
            </select>
          </div>

          {category === 'STUDY' && (
             <div style={{ padding: 15, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd', display: 'grid', gap: 10 }}>
                <div className="input-field">
                    <label>{t("post.study_type_label")}</label>
                    <select className="text-input" value={studyType} onChange={e => setStudyType(e.target.value as StudyType)}>
                        <option value="ONLINE">{t("post_detail.study_type_online")}</option>
                        <option value="OFFLINE">{t("post_detail.study_type_offline")}</option>
                        <option value="HYBRID">{t("post_detail.study_type_hybrid")}</option>
                    </select>
                </div>
                <div className="input-field">
                    <label>{t("post.contact_link_label")}</label>
                    <input className="text-input" placeholder={t("post.contact_link_placeholder")} value={contactLink} onChange={e => setContactLink(e.target.value)} />
                </div>
             </div>
          )}

          <div className="input-field">
            <label>{t("post.title")}</label>
            <input className="text-input" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div className="input-field">
            <label>{t("post.content")}</label>
            <div className="quill-wrapper">
              <ReactQuill theme="snow" value={content} onChange={setContent} style={{height: 300}} />
            </div>
          </div>

          {isManager && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={isNotice} onChange={e => setIsNotice(e.target.checked)} />
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{t("post.notice")}</span>
            </label>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" className="secondary-btn" onClick={() => navigate(-1)}>{t("common.cancel")}</button>
            <button type="submit" className="primary-btn">{t("post_detail.submit_edit")}</button>
          </div>
        </form>
      </section>
    </Layout>
  );
}