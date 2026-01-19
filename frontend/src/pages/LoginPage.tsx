import { useState } from "react";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import { Link, useNavigate } from "react-router-dom";
import SuccessModal from "../components/SuccessModal";

export default function LoginPage() {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const onLogin = async () => {
    try {
      const res = await api.post("/auth/login", { username: id, password: pw });
      const { accessToken, refreshToken } = res.data;
      localStorage.setItem("token", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      setShowSuccess(true);
      setTimeout(() => navigate("/"), 1500); // Auto redirect
    } catch (err) {
      console.error(err);
    }
  };

  return (
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => navigate("/")}
      />
      <section className="glass-card">
        <div className="card-header">
        </div>
        <div className="form-grid">
          <div className="input-field">
            <input
              id="login-id"
              className="text-input"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>
          <div className="input-field">
            <input
              id="login-pw"
              className="text-input"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </div>
          <button className="primary-btn" onClick={onLogin}>
          </button>
          {status && <p className="muted">{status}</p>}

          <div style={{ marginTop: 30, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
             <Link to="/register" className="secondary-btn" style={{ display: 'inline-block', width: '100%', textAlign: 'center', textDecoration: 'none' }}>
             </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
