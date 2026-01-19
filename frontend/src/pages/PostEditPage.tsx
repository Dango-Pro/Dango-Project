import { useEffect, useState } from "react";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import type { Post } from "../types/post";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function PostEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isNotice, setIsNotice] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [status, setStatus] = useState("");

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
        setStatus("게시글을 찾을 수 없습니다.");
      });

    api.get("/users/me").then(res => {
         const roles = res.data.roles || [];
         if (roles.includes("ROLE_MANAGER")) setIsManager(true);
    }).catch(() => {});
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/posts/${id}`, { title, content, isNotice });
      navigate("/posts");
    } catch (err) {
      console.error(err);
      setStatus("수정에 실패했습니다.");
    }
  };

  return (
    <Layout pageTitle="Edit Post">
      <section className="glass-card">
        <h2 className="card-title">Edit Post</h2>
        {status && <p className="muted">{status}</p>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label htmlFor="post-title" style={{ display: "block", marginBottom: 4 }} className="muted">
              제목 (Title)
            </label>
            <input
              id="post-title"
              className="input-field text-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {isManager && (
              <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isNotice}
                        onChange={e => setIsNotice(e.target.checked)}
                        style={{ width: 18, height: 18, accentColor: '#ff6b6b' }}
                      />
                      <span style={{ color: '#ff6b6b', fontWeight: 600 }}>공지사항 (Announcement)</span>
                  </label>
              </div>
          )}

          <div>
            <label htmlFor="post-content" style={{ display: "block", marginBottom: 4 }} className="muted">
              내용 (Content)
            </label>
            <div className="quill-wrapper">
                <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                />
            </div>
          </div>
          <button type="submit" className="primary-btn" style={{ marginTop: 8 }}>
            수정 완료
          </button>
        </form>
      </section>
    </Layout>
  );
}
