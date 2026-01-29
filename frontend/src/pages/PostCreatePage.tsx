import { useState, useEffect } from "react";
import { api } from "../libs/api";
import { postService } from "../services/postService";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import SuccessModal from "../components/SuccessModal";
import ReactQuill from "react-quill-new";
import { useTranslation } from "react-i18next";
import "react-quill-new/dist/quill.snow.css";

export default function PostCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isNotice, setIsNotice] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
     api.get("/users/me").then(res => {
         const roles = res.data.roles || [];
         if (roles.includes("ROLE_MANAGER")) setIsManager(true);
     }).catch(() => {});
  }, []);

  const validate = () => {
      const newErrors: { [key: string]: string } = {};
      if (!title.trim()) newErrors.title = t("post.validation.title");
      if (!content.trim()) newErrors.content = t("post.validation.content");

      if (files) {
          for (let i = 0; i < files.length; i++) {
              const f = files[i];
              if (f.size > 5 * 1024 * 1024) {
                  newErrors.files = t("post.validation.file_size");
              }
              const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "text/plain"];
              if (!allowed.includes(f.type)) {
                  newErrors.files = t("post.validation.file_type");
              }
          }
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const onCreate = async () => {
    if (!validate()) return;
    try {
      await postService.createPost({
        title,
        content,
        isNotice,
        files
      });
      setShowSuccess(true);
      setTimeout(() => navigate("/posts"), 1500);
    } catch (err) {
      console.error(err);
      setStatus(t("post.fail"));
    }
  };

  return (
    <Layout pageTitle={t("post.create_title")}>
      <SuccessModal
        isOpen={showSuccess}
        message={t("post.success")}
        onClose={() => navigate("/posts")}
      />
      <section className="glass-card">
        <div className="card-header">
          <h2 className="card-title">{t("post.new_post")}</h2>
          <button className="secondary-btn" onClick={() => { setTitle(""); setContent(""); }}>
            {t("post.clear")}
          </button>
        </div>
        <div className="form-grid">
          <div className="input-field">
            <label htmlFor="post-title">{t("post.title")}</label>
            <input
              id="post-title"
              className="text-input"
              placeholder={t("post.title_placeholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && <span style={{color: '#ff6b6b', fontSize: '0.85rem', marginTop: '0.25rem'}}>{errors.title}</span>}
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
                      <span style={{ color: '#ff6b6b', fontWeight: 600 }}>{t("post.notice")}</span>
                  </label>
              </div>
          )}

          <div className="input-field">
            <label htmlFor="post-content">{t("post.content")}</label>
            <div className="quill-wrapper">
                <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    placeholder={t("post.content_placeholder")}
                />
            </div>
            {errors.content && <span style={{color: '#ff6b6b', fontSize: '0.85rem', marginTop: '0.25rem'}}>{errors.content}</span>}
          </div>
          <div className="input-field">
            <label htmlFor="post-files">{t("post.files")}</label>
            <input
              id="post-files"
              type="file"
              multiple
              className="text-input"
              onChange={(e) => setFiles(e.target.files)}
            />
             {errors.files && <span style={{color: '#ff6b6b', fontSize: '0.85rem', marginTop: '0.25rem'}}>{errors.files}</span>}
          </div>
          <button className="primary-btn" onClick={onCreate}>
            {t("post.publish")}
          </button>
          {status && <p className="muted">{status}</p>}
        </div>
      </section>
    </Layout>
  );
}
