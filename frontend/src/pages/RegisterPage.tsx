import { useState } from "react";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    email: "",
    phone: "",
    birthdate: "",
    gender: "",
    authCode: "", // 인증번호 입력값
  });

  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
  });

  const [message, setMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSent, setIsSent] = useState(false); // 인증번호 발송 여부

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setAgreements((prev) => ({ ...prev, [name]: checked }));
  };

  // ✅ [수정완료] 인증번호 요청 (로직 통합 & 오류 해결)
  const onRequestAuthCode = async () => {
    if (!formData.email) {
      alert(t("auth.enter_email_alert"));
      return;
    }

    try {
      await api.post("/auth/email-code", { email: formData.email });
      alert(t("auth.auth_sent_alert"));
      setIsSent(true);
    } catch (err) {
      console.error("이메일 발송 실패:", err);
      alert(t("auth.auth_fail_alert"));
    }
  };

  const onRegister = async () => {
    setMessage(null);

    // Validation
    if (!agreements.terms || !agreements.privacy) {
      setMessage(t("auth.agree_all_required"));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage(t("auth.password_mismatch"));
      return;
    }
    if (!formData.username || !formData.password || !formData.name || !formData.email || !formData.phone) {
      setMessage(t("auth.fill_all_required"));
      return;
    }

    try {
      await api.post("/auth/signup", {
        username: formData.username,
        password: formData.password,
        nickname: formData.name, // 이름 = 닉네임
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        birthdate: formData.birthdate || null,
        gender: formData.gender || null,
        agreedToTerms: agreements.terms,
        agreedToPrivacy: agreements.privacy,
        verificationCode: formData.authCode,
      });
      setShowSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.message || t("auth.register_fail"));
    }
  };

  return (
    <Layout pageTitle={t("auth.register_title")}>
      <Toast
        isOpen={showSuccess}
        message={t("auth.register_success")}
        onClose={() => setShowSuccess(false)}
      />

      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>

        {/* Left Column: Agreements */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ marginBottom: '20px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>{t("auth.terms_agree")}</h3>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>{t("auth.terms_required")}</span>
              <label style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="terms"
                  checked={agreements.terms}
                  onChange={handleAgreementChange}
                  style={{ marginRight: '8px' }}
                />
                {t("auth.agree")}
              </label>
            </div>
            <textarea
              readOnly
              style={{ width: '100%', height: '100px', padding: '10px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px', resize: 'none' }}
              value="제1조(목적) 이 약관은 OO 회사(전자상거래 사업자)가 운영하는 OO 사이버 몰(이하 “몰”이라 한다)에서 제공하는 인터넷 관련 서비스(이하 “서비스”라 한다)를 이용함에 있어 사이버 몰과 이용자의 권리․의무 및 책임사항을 규정함을 목적으로 합니다."            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>{t("auth.privacy_required")}</span>
              <label style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="privacy"
                  checked={agreements.privacy}
                  onChange={handleAgreementChange}
                  style={{ marginRight: '8px' }}
                />
                {t("auth.agree")}
              </label>
            </div>
            <textarea
              readOnly
              style={{ width: '100%', height: '100px', padding: '10px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px', resize: 'none' }}
              value="<소상공인명>(은)는 개인정보 보호법 제30조에 따라 정보주체(고객)의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리지침을 수립․공개합니다."
            />
          </div>
        </div>

        {/* Right Column: Form */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ marginBottom: '20px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>{t("auth.member_info")}</h3>

          <div className="form-grid" style={{ gap: '15px' }}>

            <input
              name="username"
              className="text-input"
              placeholder={t("auth.username_placeholder_short")}
              value={formData.username}
              onChange={handleChange}
            />

            <input
              name="password"
              className="text-input"
              type="password"
              placeholder={t("auth.pw_label")}
              value={formData.password}
              onChange={handleChange}
            />

            <input
              name="confirmPassword"
              className="text-input"
              type="password"
              placeholder={t("auth.password_confirm")}
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            <input
              name="name"
              className="text-input"
              placeholder={t("auth.name_placeholder")}
              value={formData.name}
              onChange={handleChange}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                name="email"
                className="text-input"
                placeholder={t("auth.email_label")}
                style={{ flex: 1 }}
                value={formData.email}
                onChange={handleChange}
              />
              <button
                type="button"
                className="secondary-btn"
                style={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}
                onClick={onRequestAuthCode}
              >
                {t("auth.request_auth")}
              </button>
            </div>

            <input
              name="authCode"
              className="text-input"
              placeholder={t("auth.auth_code_placeholder")}
              value={formData.authCode}
              onChange={handleChange}
              disabled={!isSent}
            />

            <input
              name="phone"
              className="text-input"
              placeholder={t("auth.contact_placeholder")}
              value={formData.phone}
              onChange={handleChange}
            />

            <div className="input-field">
                <input
                    name="birthdate"
                    className="text-input"
                    type="date"
                    value={formData.birthdate}
                    onChange={handleChange}
                />
            </div>

            <select
              name="gender"
              className="text-input"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">{t("auth.gender_placeholder")}</option>
              <option value="M">{t("auth.gender_m")}</option>
              <option value="F">{t("auth.gender_f")}</option>
            </select>

            {message && <p className="muted" style={{color: '#d9534f'}}>{message}</p>}

            <button
              className="primary-btn"
              style={{ width: '100%', marginTop: '10px', backgroundColor: '#bcaaa4', borderColor: '#bcaaa4' }}
              onClick={onRegister}
            >
              {t("auth.register_submit")}
            </button>

          </div>
        </div>

      </div>
    </Layout>
  );
}