import { useState } from "react";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import SuccessModal from "../components/SuccessModal";
import { useTranslation } from "react-i18next"; // Using i18n for labels if available, falling back to Korean/English as needed

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    nickname: "", // Name? The screenshot shows "Name" (이름) and "ID" (아이디). Nickname might be separate or same. Let's keep nickname as hidden or same as name if not in UI, but UI has "Name". Actually original had Nickname. Let's map "Name" -> name, "Nickname" -> nickname (if needed).
    // Screenshot shows: ID, Password, Password Confirm, Name, Email + Verify, Phone, Birthday (Optional), Gender (Optional).
    // It does not show "Nickname". I will assume "Name" is the real name, and keep "Nickname" as a field or auto-generate/use Name.
    // Let's add Nickname field back if backend requires it (it does). I'll add a hidden logic or explicit field if design allows. 
    // Wait, the prompt says "match the provided design". The design has "Name" (이름). 
    // I will add "Name" field. I will also keep "Nickname" field but maybe label it "Nickname" or "Display Name" if not in screenshot.
    // Screenshot ONLY has: ID, PW, PW Confirm, Name, Email, Auth Code, Phone, Birthday, Gender.
    // Backend `signup` REQUIRES nickname. I will use `username` or `name` as default nickname if not provided, or add a field.
    // Let's add "Nickname" field to be safe, or just use Name as Nickname.
    // I'll add "Nickname" to the form since it's a social app.
    
    name: "",
    email: "",
    phone: "",
    birthdate: "",
    gender: "",
    authCode: "", // Simulation
  });

  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
  });

  const [message, setMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setAgreements((prev) => ({ ...prev, [name]: checked }));
  };

  const onRequestAuthCode = () => {
    if (!formData.email) {
      alert("이메일을 입력해주세요.");
      return;
    }
    alert("인증번호가 발송되었습니다. (Simulated: 1234)");
  };

  const onRegister = async () => {
    setMessage(null);

    // Validation
    if (!agreements.terms || !agreements.privacy) {
      setMessage("모든 필수 약관에 동의해주세요.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!formData.username || !formData.password || !formData.name || !formData.email || !formData.phone) {
      setMessage("필수 정보를 모두 입력해주세요.");
      return;
    }

    try {
      await api.post("/auth/signup", {
        username: formData.username,
        password: formData.password,
        nickname: formData.name, // Use Name as Nickname for now since specific Nickname field is absent in screenshot
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        birthdate: formData.birthdate || null, // Optional
        gender: formData.gender || null, // Optional
        agreedToTerms: agreements.terms,
        agreedToPrivacy: agreements.privacy,
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
      <SuccessModal
        isOpen={showSuccess}
        message={t("auth.register_success")}
        onClose={() => navigate("/login")}
      />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        
        {/* Left Column: Agreements */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ marginBottom: '20px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>약관 동의</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>이용약관 동의 (필수)</span>
              <label style={{ cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  name="terms" 
                  checked={agreements.terms} 
                  onChange={handleAgreementChange}
                  style={{ marginRight: '8px' }}
                />
                동의합니다
              </label>
            </div>
            <textarea 
              readOnly 
              style={{ width: '100%', height: '100px', padding: '10px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px', resize: 'none' }}
              value="제1조(목적) 이 약관은 OO 회사(전자상거래 사업자)가 운영하는 OO 사이버 몰(이하 “몰”이라 한다)에서 제공하는 인터넷 관련 서비스(이하 “서비스”라 한다)를 이용함에 있어 사이버 몰과 이용자의 권리․의무 및 책임사항을 규정함을 목적으로 합니다."
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>개인정보처리방침 동의 (필수)</span>
              <label style={{ cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  name="privacy" 
                  checked={agreements.privacy} 
                  onChange={handleAgreementChange}
                  style={{ marginRight: '8px' }}
                />
                동의합니다
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
          <h3 style={{ marginBottom: '20px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>회원정보 입력</h3>
          
          <div className="form-grid" style={{ gap: '15px' }}>
            
            <input
              name="username"
              className="text-input"
              placeholder="아이디"
              value={formData.username}
              onChange={handleChange}
            />

            <input
              name="password"
              className="text-input"
              type="password"
              placeholder="비밀번호"
              value={formData.password}
              onChange={handleChange}
            />

            <input
              name="confirmPassword"
              className="text-input"
              type="password"
              placeholder="비밀번호 확인"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            <input
              name="name"
              className="text-input"
              placeholder="이름"
              value={formData.name}
              onChange={handleChange}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                name="email"
                className="text-input"
                placeholder="이메일"
                style={{ flex: 1 }}
                value={formData.email}
                onChange={handleChange}
              />
              <button 
                className="secondary-btn" 
                style={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}
                onClick={onRequestAuthCode}
              >
                인증번호 요청
              </button>
            </div>

            <input
              name="authCode"
              className="text-input"
              placeholder="인증번호를 입력하세요."
              value={formData.authCode}
              onChange={handleChange}
            />

            <input
              name="phone"
              className="text-input"
              placeholder="연락처"
              value={formData.phone}
              onChange={handleChange}
            />

            <div className="input-field">
                <input
                    name="birthdate"
                    className="text-input"
                    type="date"
                    data-placeholder="생년월일(선택입력)"
                    required={false}
                    aria-label="생년월일(선택입력)"
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
              <option value="">성별(선택입력)</option>
              <option value="M">남성</option>
              <option value="F">여성</option>
            </select>

            {message && <p className="muted" style={{color: '#d9534f'}}>{message}</p>}

            <button 
              className="primary-btn" 
              style={{ width: '100%', marginTop: '10px', backgroundColor: '#bcaaa4', borderColor: '#bcaaa4' }} // Matching the beige/brown button in screenshot
              onClick={onRegister}
            >
              회원가입
            </button>

          </div>
          {message && <p className="muted">{message}</p>}
        </div>

      </div>
    </Layout>
  );
}
