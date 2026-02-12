import { useEffect, useState } from 'react';
import { api } from '../libs/api';
import Layout from '../components/Layout';
import type { User } from '../types/user';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ImageUploadModal from '../components/common/ImageUploadModal';

import { useAuth } from '../context/AuthContext';

export default function UserPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refreshUser } = useAuth(); // Use refreshUser from context
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState(t('common.loading'));
  const [showUploadModal, setShowUploadModal] = useState(false);
  
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
      refreshUser(); // Update global state
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

  const handleUploadSuccess = async (newUrl: string) => {
      if (user) {
          setUser({ ...user, profileImageUrl: newUrl });
      }
      await refreshUser(); // Update global state
      fetchUser();
  };

  // Avatar helper
  const getInitials = () => {
    const name = user?.nickname || user?.username || 'U';
    return name.charAt(0).toUpperCase();
  };

  const getAvatarGradient = () => {
      const gradients = [
        'linear-gradient(135deg, #667eea, #764ba2)',
        'linear-gradient(135deg, #f093fb, #f5576c)',
        'linear-gradient(135deg, #4facfe, #00f2fe)',
        'linear-gradient(135deg, #43e97b, #38f9d7)',
        'linear-gradient(135deg, #fa709a, #fee140)',
      ];
      const hash = (user?.id || 0) % gradients.length;
      return gradients[hash];
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
            
            {/* Basic Info - Pastel Blue/Purple Theme */}
            <div className="action-card" style={{ background: 'linear-gradient(to right bottom, #f0f9ff, #e0f2fe)', border: '1px solid #bae6fd' }}>
              <h3 className="item-title" style={{ marginBottom: '15px', color: '#0369a1' }}>기본 정보</h3>
              
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                 {/* Profile Image Section */}
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div 
                        style={{ 
                            width: '100px', 
                            height: '100px', 
                            borderRadius: '50%', 
                            overflow: 'hidden', 
                            background: getAvatarGradient(),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '36px',
                            color: 'white',
                            fontWeight: 'bold',
                            border: '4px solid white',
                            boxShadow: '0 4px 10px rgba(186, 230, 253, 0.4)'
                        }}
                    >
                        {user.profileImageUrl ? (
                            <img src={user.profileImageUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            getInitials()
                        )}
                    </div>
                    {isEditing && (
                        <button 
                            className="secondary-btn" 
                            style={{ fontSize: '12px', padding: '4px 10px', background: 'white', border: '1px solid #7dd3fc', color: '#0284c7' }}
                            onClick={() => setShowUploadModal(true)}
                        >
                            사진 변경
                        </button>
                    )}
                 </div>

                 {/* Fields - Fixed Layout */}
                 <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                      {/* Helper for Fields to prevent shift */}
                      {[
                          { label: '아이디 (ID)', value: user.nickname || user.username },
                          { label: '이름 (Name)', name: 'name', value: (user as any).name, isEditable: true },
                          { label: '이메일 (Email)', name: 'email', value: (user as any).email, isEditable: true },
                          { label: '연락처 (Phone)', name: 'phone', value: (user as any).phone, isEditable: true },
                          { label: '생년월일', name: 'birthdate', value: (user as any).birthdate, isEditable: true, type: 'date' },
                          { label: '성별', name: 'gender', value: (user as any).gender, isEditable: true, type: 'select', options: [{val:'', txt:'선택안함'}, {val:'M', txt:'남성'}, {val:'F', txt:'여성'}] }
                      ].map((field, idx) => (
                          <div key={idx} style={{ minHeight: '65px' }}>
                             <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '4px', color: '#64748b' }}>{field.label}</p>
                             <div style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                                 {isEditing && field.isEditable ? (
                                     field.type === 'select' ? (
                                        <select 
                                            name={field.name} 
                                            className="text-input" 
                                            style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                            value={(editForm as any)[field.name!] || ''} 
                                            onChange={handleChange}
                                        >
                                            {(field.options || []).map(opt => <option key={opt.val} value={opt.val}>{opt.txt}</option>)}
                                        </select>
                                     ) : (
                                        <input 
                                            type={field.type || 'text'}
                                            name={field.name} 
                                            className="text-input" 
                                            style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                            value={(editForm as any)[field.name!] || ''} 
                                            onChange={handleChange} 
                                        />
                                     )
                                 ) : (
                                     <p className="item-subtitle" style={{ margin: 0, fontSize: '1rem', color: '#334155' }}>
                                         {field.name === 'gender' 
                                            ? (field.value === 'M' ? '남성' : field.value === 'F' ? '여성' : '-') 
                                            : (field.value || '-')}
                                     </p>
                                 )}
                             </div>
                          </div>
                      ))}
                  </div>
              </div>
            </div>

            {/* Learning Settings - Pastel Green Theme */}
            <div className="action-card" style={{ background: 'linear-gradient(to right bottom, #f0fdf4, #dcfce7)', border: '1px solid #86efac' }}>
              <h3 className="item-title" style={{ marginBottom: '15px', color: '#15803d' }}>학습 설정</h3>
              <div className="two-column">
                  <div>
                    <label className="muted" style={{ display: 'block', marginBottom: '4px', color: '#64748b' }}>{t('user.timezone')}</label>
                    <div style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                        {isEditing ? (
                            <select 
                                name="timezone" 
                                className="text-input" 
                                style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                value={editForm.timezone} 
                                onChange={handleChange}
                            >
                                {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                            </select>
                        ) : (
                            <p className="item-title" style={{ margin: 0, color: '#166534' }}>{user.timezone}</p>
                        )}
                    </div>
                  </div>
              </div>
            </div>

            {/* Roles - Pastel Pink/Purple Theme */}
            <div className="action-card" style={{ background: 'linear-gradient(to right bottom, #fdf2f8, #fce7f3)', border: '1px solid #f9a8d4' }}>
              <h3 className="item-title" style={{ marginBottom: '15px', color: '#be185d' }}>{t('user.roles')}</h3>
              <div className="badge-grid">
                {user.roles.map((r) => (
                  <span key={r} className="pill" style={{ background: 'white', color: '#db2777', border: '1px solid #fbcfe8' }}>
                    <span className="pill-dot" style={{ background: '#db2777' }} />
                    {r}
                  </span>
                ))}
              </div>
            </div>

          </div>
        )}

        <ImageUploadModal 
            isOpen={showUploadModal} 
            onClose={() => setShowUploadModal(false)}
            onUploadSuccess={handleUploadSuccess}
        />
      </section>
    </Layout>
  );
}
