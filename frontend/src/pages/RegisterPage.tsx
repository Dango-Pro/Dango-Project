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
    }
  };

  return (
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => navigate("/login")}
      />
      <section className="glass-card">
        <div className="card-header">
        </div>

        <div className="form-grid">
          <div className="input-field">
            <input
              id="signup-id"
              className="text-input"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>
          <div className="input-field">
            <input
              id="signup-pw"
              className="text-input"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="primary-btn" onClick={onRegister}>
            </button>
          </div>
          {message && <p className="muted">{message}</p>}
        </div>
      </section>
    </Layout>
  );
}
