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

      if (files) {
        for (let i = 0; i < files.length; i++) {
        }
      }

      });
      setShowSuccess(true);
      setTimeout(() => navigate("/posts"), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => navigate("/posts")}
      />
      <section className="glass-card">
        <div className="card-header">
          <button className="secondary-btn" onClick={() => { setTitle(""); setContent(""); }}>
          </button>
        </div>
        <div className="form-grid">
          <div className="input-field">
            <input
              id="post-title"
              className="text-input"
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
                  </label>
              </div>
          )}

          <div className="input-field">
            <div className="quill-wrapper">
                <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                />
            </div>
          </div>
          <div className="input-field">
            <input
              id="post-files"
              type="file"
              multiple
              className="text-input"
              onChange={(e) => setFiles(e.target.files)}
            />
          </div>
          <button className="primary-btn" onClick={onCreate}>
          </button>
          {status && <p className="muted">{status}</p>}
        </div>
      </section>
    </Layout>
  );
}
