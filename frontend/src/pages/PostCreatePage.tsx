import { useState, useEffect, useRef } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    if (!title.trim() || !content.trim()) return alert(t("post.validation_title_content"));
    try {
      const res = await postService.createPost({
        title, content, isNotice, files, category,
        studyType: category === "STUDY" ? studyType : undefined,
        contactLink: category === "STUDY" ? contactLink : undefined,
      });
      const createdId = res.data?.id;
      if (createdId) {
        navigate(`/posts/${createdId}`);
      } else {
        navigate("/posts");
      }
    } catch (err) { alert(t("post.create_fail")); }
  };

  return (
    <Layout pageTitle={t("post.write_page_title")}>
      <section className="glass-card">
        <div className="card-header">
          <h2 className="card-title">{t("post.create_page_title")}</h2>
        </div>

        <div className="form-grid">
          <div className="input-field">
            <label>{t("post.category_label")}</label>
            <div style={{ display: 'flex', gap: 10 }}>
                {['FREE', 'QNA', 'STUDY'].map((cat) => (
                    <button
                        key={cat}
                        className={category === cat ? "primary-btn" : "secondary-btn"}
                        onClick={() => setCategory(cat as PostCategory)}
                        style={{ flex: 1, padding: '10px' }}
                    >
                        {cat === 'FREE' ? t("post.category_free") : (cat === 'QNA' ? t("post.category_qna") : `⚡ ${t("post.category_study")}`)}
                    </button>
                ))}
            </div>
          </div>

          {category === "STUDY" && (
            <div style={{ padding: 20, backgroundColor: '#f0f9ff', borderRadius: 16, border: '1px solid #bae6fd', display: 'grid', gap: 16 }}>
              <h4 style={{ margin: 0, color: '#0369a1' }}>📢 {t("post.study_info_title")}</h4>
              <div className="two-column">
                  <div className="input-field">
                    <label>{t("post.study_type_label")}</label>
                    <select className="text-input" value={studyType} onChange={e => setStudyType(e.target.value as StudyType)}>
                      <option value="ONLINE">{t("post.study_type_online_desc")}</option>
                      <option value="OFFLINE">{t("post.study_type_offline_desc")}</option>
                      <option value="HYBRID">{t("post.study_type_hybrid_desc")}</option>
                    </select>
                  </div>
                  <div className="input-field">
                    <label>{t("post.contact_link_label")}</label>
                    <input className="text-input" placeholder={t("post.contact_link_placeholder")} value={contactLink} onChange={e => setContactLink(e.target.value)} />
                  </div>
              </div>
            </div>
          )}

          <div className="input-field">
            <label>{t("post.title")}</label>
            <input className="text-input" value={title} onChange={e => setTitle(e.target.value)} placeholder={t("post.title_placeholder_short")} />
          </div>

          <div className="input-field">
            <label>{t("post.content")}</label>
            <div className="quill-wrapper">
                <ReactQuill theme="snow" value={content} onChange={setContent} style={{ height: 300 }} />
            </div>
          </div>

          <div className="input-field">
            <label>{t("post.file_attach")}</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                className="text-input"
                style={{ display: "none" }}
                onChange={e => setFiles(e.target.files)}
              />
              <button type="button" className="secondary-btn" onClick={() => fileInputRef.current?.click()}>
                {t("post.select_file")}
              </button>
              <span className="muted" style={{ fontSize: "0.9rem" }}>
                {files && files.length > 0
                  ? Array.from(files).map(f => f.name).join(", ")
                  : t("post.no_file_selected")}
              </span>
            </div>
            <p className="muted" style={{ marginTop: 6, fontSize: "0.85rem" }}>{t("post.validation.file_size")}</p>
          </div>

          {isManager && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={isNotice} onChange={e => setIsNotice(e.target.checked)} />
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{t("post.notice")}</span>
              </label>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button className="secondary-btn" onClick={() => navigate("/posts")}>{t("common.cancel")}</button>
            <button className="primary-btn" onClick={onCreate}>{t("post.register_btn")}</button>
          </div>
        </div>
      </section>
    </Layout>
  );
}