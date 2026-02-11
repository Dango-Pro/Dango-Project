import { useEffect, useState } from 'react';
import { api } from '../libs/api';
import Layout from '../components/Layout';
import type { User } from '../types/user';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function UserPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState(t('common.loading'));
  
  // Settings Mode
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
      reviewLimit: 200,
      timezone: 'UTC',
      nickname: '',
      name: '',
      email: '',
      phone: '',
      birthdate: '',
      gender: ''
  });

  const timezones = ['UTC', 'Asia/Seoul', 'Asia/Tokyo', 'America/New_York', 'Europe/London', 'Australia/Sydney'];

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = () => {
    api
      .get<User>('/users/me')
      .then((res) => {
        setUser(res.data);
        setEditForm({
            reviewLimit: res.data.reviewLimit,
            timezone: res.data.timezone || 'UTC',
            nickname: res.data.nickname || '',
            name: (res.data as any).name || '',
            email: (res.data as any).email || '',
            phone: (res.data as any).phone || '',
            birthdate: (res.data as any).birthdate || '',
            gender: (res.data as any).gender || ''
        });
        setStatus('');
      })
      .catch((err) => {
        console.error(err);
        setStatus(`${t('error.oops')}: ${err.message}`);
      });
  };

  const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const onSave = async () => {
    try {
      await api.patch('/users/me', { 
          ...editForm,
          reviewLimit: Number(editForm.reviewLimit)
      });
      setIsEditing(false);
      fetchUser();
      alert(t('common.save_success', { defaultValue: 'Saved!' }));
    } catch (err) {
      console.error(err);
      alert('Failed to update settings');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setEditForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Layout pageTitle={t('nav.mypage')}>
      <section className="glass-card">
        <div className="card-header">
          <h2 className="card-title">{t('nav.mypage')}</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            {isEditing ? (
                <>
                    <button className="primary-btn" onClick={onSave}>{t('common.save')}</button>
                    <button className="secondary-btn" onClick={() => { setIsEditing(false); fetchUser(); }}>{t('common.cancel')}</button>
                </>
            ) : (
                <button className="secondary-btn" onClick={() => setIsEditing(true)}>{t('common.edit')}</button>
            )}
            <button className="secondary-btn" onClick={onLogout} style={{ color: '#d9534f', borderColor: '#d9534f' }}>
                {t('nav.logout')}
            </button>
          </div>
        </div>

        {status && <p className="muted">{status}</p>}

        {user && (
          <div className="form-grid" style={{ marginTop: 12 }}>
            
            {/* Basic Info */}
            <div className="action-card">
              <h3 className="item-title" style={{ marginBottom: '15px' }}>기본 정보</h3>
              
              <div className="two-column">
                  <div>
                    <p className="muted">아이디 (ID)</p>
                    <p className="item-subtitle">{user.username}</p>
                  </div>
                  <div>
                    <p className="muted">이름 (Name)</p>
                    {isEditing ? (
                        <input name="name" className="text-input" value={editForm.name} onChange={handleChange} />
                    ) : (
                        <p className="item-subtitle">{(user as any).name || '-'}</p>
                    )}
                  </div>
                  <div>
                    <p className="muted">이메일 (Email)</p>
                     {isEditing ? (
                        <input name="email" className="text-input" value={editForm.email} onChange={handleChange} />
                    ) : (
                        <p className="item-subtitle">{(user as any).email || '-'}</p>
                    )}
                  </div>
                  <div>
                    <p className="muted">연락처 (Phone)</p>
                     {isEditing ? (
                        <input name="phone" className="text-input" value={editForm.phone} onChange={handleChange} />
                    ) : (
                        <p className="item-subtitle">{(user as any).phone || '-'}</p>
                    )}
                  </div>
                   <div>
                    <p className="muted">생년월일</p>
                     {isEditing ? (
                        <input type="date" name="birthdate" className="text-input" value={editForm.birthdate} onChange={handleChange} />
                    ) : (
                        <p className="item-subtitle">{(user as any).birthdate || '-'}</p>
                    )}
                  </div>
                   <div>
                    <p className="muted">성별</p>
                     {isEditing ? (
                         <select name="gender" className="text-input" value={editForm.gender} onChange={handleChange}>
                             <option value="">선택안함</option>
                             <option value="M">남성</option>
                             <option value="F">여성</option>
                         </select>
                    ) : (
                        <p className="item-subtitle">{(user as any).gender === 'M' ? '남성' : (user as any).gender === 'F' ? '여성' : '-'}</p>
                    )}
                  </div>
              </div>
            </div>

            {/* Learning Settings */}
            <div className="action-card">
              <h3 className="item-title" style={{ marginBottom: '15px' }}>학습 설정</h3>
              <div className="two-column">
                  <div>
                    <p className="muted">{t('user.timezone')}</p>
                    {isEditing ? (
                        <select name="timezone" className="text-input" value={editForm.timezone} onChange={handleChange}>
                            {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                        </select>
                    ) : (
                        <p className="item-title">{user.timezone}</p>
                    )}
                  </div>
              </div>
            </div>

            <div className="action-card">
              <p className="muted">{t('user.roles')}</p>
              <div className="badge-grid">
                {user.roles.map((r) => (
                  <span key={r} className="pill">
                    <span className="pill-dot" />
                    {r}
                  </span>
                ))}
              </div>
            </div>

          </div>
        )}
      </section>
    </Layout>
  );
}
