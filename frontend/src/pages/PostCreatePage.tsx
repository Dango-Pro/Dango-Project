import { useState, useEffect } from "react";
import { api } from "../libs/api";
import { postService } from "../services/postService";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import { useTranslation } from "react-i18next";
import type { PostCategory, StudyType } from "../types/post";
import "react-quill-new/dist/quill.snow.css";

export default function PostCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [category, setCategory] = useState<PostCategory>("FREE");
  const [studyType, setStudyType] = useState<StudyType>("ONLINE");
  const [contactLink, setContactLink] = useState("");
  const [isNotice, setIsNotice] = useState(false);
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
     api.get("/users/me").then(res => {
         if (res.data.roles?.includes("ROLE_MANAGER")) setIsManager(true);
     }).catch(() => {});
  }, []);

  const onCreate = async () => {
    if (!title.trim() || !content.trim()) return alert("제목과 내용을 입력해주세요.");
    try {
      await postService.createPost({
        title, content, isNotice, files, category,
        studyType: category === "STUDY" ? studyType : undefined,
        contactLink: category === "STUDY" ? contactLink : undefined,
      });
      navigate("/posts");
    } catch (err) { alert("작성 실패"); }
  };

  return (
    <Layout pageTitle="글쓰기">
      <section className="glass-card">
        <div className="card-header">
          <h2 className="card-title">새 게시글 작성</h2>
        </div>

        <div className="form-grid">
          {/* 카테고리 선택 */}
          <div className="input-field">
            <label>카테고리</label>
            <div style={{ display: 'flex', gap: 10 }}>
                {['FREE', 'QNA', 'STUDY'].map((cat) => (
                    <button
                        key={cat}
                        className={category === cat ? "primary-btn" : "secondary-btn"}
                        onClick={() => setCategory(cat as PostCategory)}
                        style={{ flex: 1, padding: '10px' }}
                    >
                        {cat === 'FREE' ? '자유' : (cat === 'QNA' ? '질문' : '⚡ 스터디 모집')}
                    </button>
                ))}
            </div>
          </div>

          {/* 스터디 전용 옵션 */}
          {category === "STUDY" && (
            <div style={{ padding: 20, backgroundColor: '#f0f9ff', borderRadius: 16, border: '1px solid #bae6fd', display: 'grid', gap: 16 }}>
              <h4 style={{ margin: 0, color: '#0369a1' }}>📢 스터디 모집 정보</h4>
              <div className="two-column">
                  <div className="input-field">
                    <label>진행 방식</label>
                    <select className="text-input" value={studyType} onChange={e => setStudyType(e.target.value as StudyType)}>
                      <option value="ONLINE">온라인 (Zoom/Discord)</option>
                      <option value="OFFLINE">오프라인 (대면)</option>
                      <option value="HYBRID">온/오프라인 혼합</option>
                    </select>
                  </div>
                  <div className="input-field">
                    <label>오픈채팅/연락처 링크</label>
                    <input className="text-input" placeholder="https://open.kakao.com/..." value={contactLink} onChange={e => setContactLink(e.target.value)} />
                  </div>
              </div>
            </div>
          )}

          <div className="input-field">
            <label>제목</label>
            <input className="text-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="제목을 입력하세요" />
          </div>

          <div className="input-field">
            <label>내용</label>
            <div className="quill-wrapper">
                <ReactQuill theme="snow" value={content} onChange={setContent} style={{ height: 300 }} />
            </div>
          </div>

          <div className="input-field">
            <label>파일 첨부</label>
            <input type="file" multiple className="text-input" onChange={e => setFiles(e.target.files)} />
          </div>

          {isManager && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={isNotice} onChange={e => setIsNotice(e.target.checked)} />
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>공지사항으로 등록</span>
              </label>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button className="secondary-btn" onClick={() => navigate("/posts")}>취소</button>
            <button className="primary-btn" onClick={onCreate}>등록하기</button>
          </div>
        </div>
      </section>
    </Layout>
  );
}