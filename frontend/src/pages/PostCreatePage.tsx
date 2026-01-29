import { useState, useEffect } from "react";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import SuccessModal from "../components/SuccessModal";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function PostCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isNotice, setIsNotice] = useState(false);

  useEffect(() => {
     api.get("/users/me").then(res => {
         const roles = res.data.roles || [];
         if (roles.includes("ROLE_MANAGER")) setIsManager(true);
     }).catch(() => {});
  }, []);

  const onCreate = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("isNotice", isNotice.toString());
      if (files) {
        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i]);
        }
      }

      await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowSuccess(true);
      setTimeout(() => navigate("/posts"), 1500);
    } catch (err) {
      console.error(err);
      setStatus("게시글 작성 실패. API 연결 상태를 확인하세요.");
    }
  };

  return (
    <Layout pageTitle="Write Post">
      <SuccessModal
        isOpen={showSuccess}
        message="Post Published!"
        onClose={() => navigate("/posts")}
      />
      <section className="glass-card">
        <div className="card-header">
          <h2 className="card-title">New Post</h2>
          <button className="secondary-btn" onClick={() => { setTitle(""); setContent(""); }}>
            Clear
          </button>
        </div>
        <div className="form-grid">
          <div className="input-field">
            <label htmlFor="post-title">제목</label>
            <input
              id="post-title"
              className="text-input"
              placeholder="제목을 입력"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {isManager && (
              <div className="input-field">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isNotice}
                        onChange={e => setIsNotice(e.target.checked)}
                        style={{ width: 18, height: 18, accentColor: '#ff6b6b' }}
                      />
                      <span style={{ color: '#ff6b6b', fontWeight: 600 }}>공지사항으로 등록 (Announcement)</span>
                  </label>
              </div>
          )}

          <div className="input-field">
            <label htmlFor="post-content">내용</label>
            <div className="quill-wrapper">
                <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    placeholder="내용을 입력하세요..."
                />
            </div>
          </div>
          <div className="input-field">
            <label htmlFor="post-files">첨부 파일</label>
            <input
              id="post-files"
              type="file"
              multiple
              className="text-input"
              onChange={(e) => setFiles(e.target.files)}
            />
          </div>
          <button className="primary-btn" onClick={onCreate}>
            게시글 발행
          </button>
          {status && <p className="muted">{status}</p>}
        </div>
      </section>
    </Layout>
  );
}
