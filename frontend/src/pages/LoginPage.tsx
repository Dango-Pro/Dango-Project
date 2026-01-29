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
      setStatus("로그인에 실패했습니다. 입력값을 확인하세요.");
    }
  };

  return (
    <Layout pageTitle="Login">
      <SuccessModal
        isOpen={showSuccess}
        message="Login Successful!"
        onClose={() => navigate("/")}
      />
      <section className="glass-card">
        <div className="card-header">
          <h2 className="card-title">Login</h2>
          <button className="secondary-btn" onClick={() => setId("demo")}>빠른 입력</button>
        </div>
        <div className="form-grid">
          <div className="input-field">
            <label htmlFor="login-id">아이디</label>
            <input
              id="login-id"
              className="text-input"
              placeholder="username"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>
          <div className="input-field">
            <label htmlFor="login-pw">비밀번호</label>
            <input
              id="login-pw"
              className="text-input"
              type="password"
              placeholder="••••••••"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </div>
          <button className="primary-btn" onClick={onLogin}>
            로그인
          </button>
          {status && <p className="muted">{status}</p>}

          <div style={{ marginTop: 30, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
             <p className="muted" style={{ marginBottom: 10 }}>Don't have an account?</p>
             <Link to="/register" className="secondary-btn" style={{ display: 'inline-block', width: '100%', textAlign: 'center', textDecoration: 'none' }}>
                Create an Account
             </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
