import { useEffect, useState } from 'react';
import { api } from '../libs/api';
import Layout from '../components/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import type { PostCategory, StudyType } from "../types/post";

export default function PostEditPage() {
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
    } catch (err) { alert('수정 실패'); }
  };

  return (
    <Layout pageTitle="게시글 수정">
      <section className="glass-card">
        <h2 className="card-title">게시글 수정</h2>
        <form onSubmit={handleSubmit} className="form-grid">

          <div className="input-field">
            <label>카테고리</label>
            <select className="text-input" value={category} onChange={e => setCategory(e.target.value as PostCategory)}>
                <option value="FREE">자유</option>
                <option value="QNA">질문</option>
                <option value="STUDY">스터디 모집</option>
            </select>
          </div>

          {category === 'STUDY' && (
             <div style={{ padding: 15, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd', display: 'grid', gap: 10 }}>
                <div className="input-field">
                    <label>진행 방식</label>
                    <select className="text-input" value={studyType} onChange={e => setStudyType(e.target.value as StudyType)}>
                        <option value="ONLINE">온라인</option>
                        <option value="OFFLINE">오프라인</option>
                        <option value="HYBRID">혼합</option>
                    </select>
                </div>
                <div className="input-field">
                    <label>연락처 링크</label>
                    <input className="text-input" value={contactLink} onChange={e => setContactLink(e.target.value)} />
                </div>
             </div>
          )}

          <div className="input-field">
            <label>제목</label>
            <input className="text-input" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div className="input-field">
            <label>내용</label>
            <div className="quill-wrapper">
              <ReactQuill theme="snow" value={content} onChange={setContent} style={{height: 300}} />
            </div>
          </div>

          {isManager && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={isNotice} onChange={e => setIsNotice(e.target.checked)} />
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>공지사항</span>
            </label>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" className="secondary-btn" onClick={() => navigate(-1)}>취소</button>
            <button type="submit" className="primary-btn">수정 완료</button>
          </div>
        </form>
      </section>
    </Layout>
  );
}