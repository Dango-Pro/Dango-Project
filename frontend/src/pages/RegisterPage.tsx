import { useState } from "react";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import SuccessModal from "../components/SuccessModal";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const onRegister = async () => {
    try {
      await api.post("/auth/signup", {
        username: id,
        password: pw,
      });
      setShowSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      setMessage("가입에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <Layout pageTitle="Sign Up">
      <SuccessModal
        isOpen={showSuccess}
        message="Sign Up Successful!"
        onClose={() => navigate("/login")}
      />
      <section className="glass-card">
        <div className="card-header">
          <h2 className="card-title">Create Account</h2>
        </div>

        <div className="form-grid">
          <div className="input-field">
            <label htmlFor="signup-id">아이디</label>
            <input
              id="signup-id"
              className="text-input"
              placeholder="아이디를 입력"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>
          <div className="input-field">
            <label htmlFor="signup-pw">비밀번호</label>
            <input
              id="signup-pw"
              className="text-input"
              type="password"
              placeholder="안전한 비밀번호"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="primary-btn" onClick={onRegister}>
              회원가입 완료
            </button>
            <button className="secondary-btn" onClick={() => setId("")}>초기화</button>
          </div>
          {message && <p className="muted">{message}</p>}
        </div>
      </section>
    </Layout>
  );
}
