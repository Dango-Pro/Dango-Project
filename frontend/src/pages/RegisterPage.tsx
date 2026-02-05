import { useState } from "react";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [nickname, setNickname] = useState("");
  const [pw, setPw] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const onRegister = async () => {
    try {
      await api.post("/auth/signup", {
        username: id,
        nickname: nickname,
        password: pw,
      });
      
      setToastMessage(t("auth.register_success"));
      setToastType('success');
      setShowToast(true);
      
      // Auto redirect without waiting for user interaction
      setTimeout(() => navigate("/login"), 500);
    } catch (err) {
      console.error(err);
      setToastMessage(t("auth.register_fail"));
      setToastType('error');
      setShowToast(true);
    }
  };

  return (
    <Layout pageTitle={t("auth.register_title")}>
      <Toast
        isOpen={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
      <section className="glass-card">
        <div className="card-header">
          <h2 className="card-title">{t("auth.create_account_title")}</h2>
        </div>

        <div className="form-grid">
          <div className="input-field">
            <label htmlFor="signup-id">{t("auth.id_label")}</label>
            <input
              id="signup-id"
              className="text-input"
              placeholder={t("auth.username_placeholder")}
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>
          <div className="input-field">
            <label htmlFor="signup-nickname">{t("auth.nickname_label")}</label>
            <input
              id="signup-nickname"
              className="text-input"
              placeholder={t("auth.nickname_placeholder")}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          <div className="input-field">
            <label htmlFor="signup-pw">{t("auth.pw_label")}</label>
            <input
              id="signup-pw"
              className="text-input"
              type="password"
              placeholder={t("auth.pw_placeholder")}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="primary-btn" onClick={onRegister}>
              {t("auth.complete_register")}
            </button>
            <button className="secondary-btn" onClick={() => setId("")}>{t("common.reset")}</button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
