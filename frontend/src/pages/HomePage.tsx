import {useEffect, useState} from 'react';
import Layout from '../components/Layout';
import {Link} from 'react-router-dom';
import Toast from '../components/Toast';
import {api} from '../libs/api';
import type {Post} from '../types/post';
import {useTranslation} from 'react-i18next';
import {useAuth} from '../context/AuthContext';

// --- 인터페이스 정의 ---
interface PostResponse {
	content?: Post[];
}

interface LoginResponse {
	accessToken: string;
	refreshToken: string;
}

interface Deck {
	id: number;
	name?: string;
}

interface DueResponse {
	cards?: string[];
}

interface UserRole {
	name?: string;
}

// --- 1. Carousel 컴포넌트 ---
const Carousel = () => {
	const {t} = useTranslation();
	const [current, setCurrent] = useState(0);
	const slides = [
		'/dango-event01.jpg',
		'/dango-event02.jpg',
		'/dango-event03.jpg',
		'/dango-event04.jpg',
	];

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrent((prev) => (prev + 1) % slides.length);
		}, 5000);
		return () => clearInterval(timer);
	}, [slides.length]);

	return (
		<div style={{
			position: 'relative',
			width: '100%',
			height: '100%',
			minHeight: '240px',
			borderRadius: '24px',
			overflow: 'hidden',
			background: '#f8f9fa'
		}}>
			{slides.map((src, idx) => (
				<div key={idx} style={{
					position: 'absolute',
					inset: 0,
					opacity: idx === current ? 1 : 0,
					transition: 'opacity 0.8s ease-in-out',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center'
				}}>
					<img src={src} alt={`Slide ${idx + 1}`}
					     style={{
						     width: '100%',
						     height: '100%',
						     objectFit: 'contain',
						     objectPosition: 'center'
					     }}/>

					<div style={{
						position: 'absolute',
						bottom: 0,
						left: 0,
						right: 0,
						height: '40%',
						background: 'linear-gradient(transparent, rgba(0,0,0,0.4))',
						pointerEvents: 'none'
					}}/>

					<div style={{
						position: 'absolute',
						bottom: 30,
						left: 30,
						background: 'rgba(255,255,255,0.95)',
						padding: '12px 24px',
						borderRadius: '12px',
						boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
					}}>
						<h2 style={{
							fontSize: '1.25rem',
							color: '#1a1a2e',
							margin: 0,
							fontWeight: '700'
						}}>{t('home.event')} {idx + 1}</h2>
					</div>
				</div>
			))}

			<div style={{position: 'absolute', bottom: '24px', right: '30px', display: 'flex', gap: '8px'}}>
				{slides.map((_, idx) => (
					<button key={idx} onClick={() => setCurrent(idx)} style={{
						width: idx === current ? '24px' : '8px',
						height: '8px',
						borderRadius: '4px',
						background: idx === current ? '#ff6b6b' : 'rgba(255,255,255,0.6)',
						border: 'none',
						cursor: 'pointer',
						padding: 0,
						transition: 'all 0.3s ease'
					}}/>
				))}
			</div>
		</div>
	);
};

// --- 2. NoticeWidget ---
const NoticeWidget = () => {
	const {t} = useTranslation();
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		api.get<PostResponse | Post[]>('/posts?size=30').then((res) => {
			const data = res.data;
			const list = Array.isArray(data) ? data : (data.content ?? []);
			setPosts(list.filter((p) => p.isNotice).slice(0, 5));
			setLoading(false);
		}).catch(() => setLoading(false));
	}, []);

	return (
		<div className="glass-card" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
			<h3 className="card-title"
			    style={{fontSize: '1.2rem', marginBottom: '16px', color: '#111'}}>{t('home.notices_title')}</h3>
			<div style={{flex: 1}}>
				{loading ? <p className="muted" style={{color: '#222'}}>{t('common.loading')}</p> : (
					<ul style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
						{posts.length === 0 && <li style={{color: '#111'}}>{t('home.no_notices')}</li>}
						{posts.map((p) => (
							<li key={p.id}
							    style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
								<Link to={`/posts/${p.id}`} style={{
									textDecoration: 'none',
									color: '#111',
									fontSize: '0.95rem',
									flex: 1,
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									marginRight: '10px'
								}}>
									<span style={{color: '#ff6b6b', marginRight: '6px', fontWeight: 'bold'}}>{t('home.notice_tag')}</span>{p.title}
								</Link>
								<span className="muted" style={{fontSize: '0.8rem', whiteSpace: 'nowrap', color: '#222'}}>{t('home.new_tag')}</span>
							</li>
						))}
					</ul>
				)}
			</div>
			<div style={{marginTop: '16px', textAlign: 'right'}}><Link to="/posts?tab=notice" className="muted"
			                                                           style={{
				                                                           fontSize: '0.85rem',
				                                                           textDecoration: 'underline',
				                                                           color: '#222'
			                                                           }}>{t('home.view_all')}</Link></div>
		</div>
	);
};

// --- 3. CommunityWidget ---
const CommunityWidget = () => {
	const {t} = useTranslation();
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		api.get<PostResponse | Post[]>('/posts?size=30').then((res) => {
			const data = res.data;
			const list = Array.isArray(data) ? data : (data.content ?? []);
			setPosts(list.filter((p) => !p.isNotice).slice(0, 5));
			setLoading(false);
		}).catch(() => setLoading(false));
	}, []);

	return (
		<div className="glass-card" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
			<h3 className="card-title"
			    style={{fontSize: '1.2rem', marginBottom: '16px', color: '#111'}}>{t('nav.community')}</h3>
			<div style={{flex: 1}}>
				{loading ? <p className="muted" style={{color: '#222'}}>{t('common.loading')}</p> : (
					<ul style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
						{posts.length === 0 && <li style={{color: '#111'}}>{t('home.no_posts')}</li>}
						{posts.map((p) => (
							<li key={p.id}
							    style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
								<Link to={`/posts/${p.id}`} style={{
									textDecoration: 'none',
									color: '#111',
									fontSize: '0.95rem',
									flex: 1,
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									marginRight: '10px'
								}}>{p.title}</Link>
								<span className="muted"
								      style={{fontSize: '0.8rem', whiteSpace: 'nowrap', color: '#666'}}>{p.authorName || 'Anonymous'}</span>
							</li>
						))}
					</ul>
				)}
			</div>
			<div style={{marginTop: '16px', textAlign: 'right'}}><Link to="/posts" className="muted"
			                                                           style={{
				                                                           fontSize: '0.85rem',
				                                                           textDecoration: 'underline',
				                                                           color: '#222'
			                                                           }}>{t('home.view_all')}</Link></div>
		</div>
	);
};

// --- 4. LoginWidget ---
const LoginWidget = () => {
	const {t} = useTranslation();
	const {token, user, login, logout} = useAuth();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [showToast, setShowToast] = useState(false);
	const [toastMessage, setToastMessage] = useState('');
	const [stats, setStats] = useState({dueDecks: 0, dueCards: 0, loading: true});

	useEffect(() => {
		if (token) {
			api.get<Deck[]>('/decks/my').then(async res => {
				const decks = res.data || [];
				let dueDecks = 0;
				let dueCards = 0;

				await Promise.all(decks.map(async (deck: Deck) => {
					try {
						const dueRes = await api.get<DueResponse>(`/study/due?deckId=${deck.id}`);
						const cards = dueRes.data.cards || [];
						if (cards.length > 0) {
							dueDecks++;
							dueCards += cards.length;
						}
					} catch { /* ignore */
					}
				}));
				setStats({dueDecks, dueCards, loading: false});
			}).catch(() => setStats({dueDecks: 0, dueCards: 0, loading: false}));
		}
	}, [token]);

	const handleLogin = async () => {
		if (!username || !password) return;
		try {
			const res = await api.post<LoginResponse>('/auth/login', {username, password});
			login(res.data.accessToken, res.data.refreshToken);
		} catch (err) {
			console.error(err);
			setError(t('auth.login_fail'));
		}
	};

	const getInitials = () => (user?.nickname || user?.username || 'U').charAt(0).toUpperCase();

	const getAvatarGradient = () => {
		const gradients = ['linear-gradient(135deg, #667eea, #764ba2)', 'linear-gradient(135deg, #f093fb, #f5576c)', 'linear-gradient(135deg, #4facfe, #00f2fe)', 'linear-gradient(135deg, #43e97b, #38f9d7)', 'linear-gradient(135deg, #fa709a, #fee140)'];
		const userId = typeof user?.id === 'number' ? user.id : 0;
		return gradients[userId % gradients.length];
	};

	const commonStyles = (
		<style>{`
            .profile-card { 
                width: 100%; height: 100%; display: flex; flex-direction: column; padding: 24px;
                background: linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85)); 
                backdrop-filter: blur(10px); border-radius: 24px; border: 1px solid rgba(255,255,255,0.5); 
                box-shadow: 0 8px 32px rgba(0,0,0,0.08); box-sizing: border-box; 
            }
            .profile-header { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; width: 100%; } 
            .profile-avatar { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: #fff; flex-shrink: 0; } 
            .profile-info { flex: 1; overflow: hidden; }
            .profile-name { margin: 0; font-size: 18px; font-weight: 700; color: #1a1a2e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } 
            .profile-stats { width: 100%; display: flex; flex-direction: column; align-items: center; padding: 14px; background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1)); border-radius: 14px; margin-bottom: 14px; box-sizing: border-box; } 
            .stats-header { font-size: 12px; font-weight: 600; color: #667eea; margin-bottom: 10px; } 
            .stats-content { display: flex; align-items: center; gap: 24px; } 
            .stat-value { font-size: 24px; font-weight: 700; color: #667eea; } 
            .profile-actions { display: flex; flex-direction: column; gap: 8px; flex: 1; width: 100%; } 
            .action-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 16px; border-radius: 12px; font-size: 14px; font-weight: 600; text-decoration: none; box-sizing: border-box; } 
            .text-input { width: 100%; box-sizing: border-box; padding: 14px; border-radius: 12px; border: 1px solid #ddd; outline: none; }
            .primary-btn { width: 100%; box-sizing: border-box; padding: 16px; border-radius: 12px; font-size: 1rem; background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; border: none; cursor: pointer; font-weight: 700; }
            .logout-btn { margin-top: auto; padding: 10px; background: transparent; border: none; color: #999; font-size: 13px; cursor: pointer; }
        `}</style>
	);

	return (
		<div className="profile-card">
			{commonStyles}
			{token && user ? (
				<>
					<Toast isOpen={showToast} message={toastMessage} type="success"
					       onClose={() => setShowToast(false)}/>
					<div className="profile-header">
						<div className="profile-avatar" style={{
							background: user?.profileImageUrl ? 'transparent' : getAvatarGradient(),
							overflow: 'hidden'
						}}>
							{user?.profileImageUrl ?
								<img src={user.profileImageUrl} alt="Profile"
								     style={{width: '100%', height: '100%', objectFit: 'cover'}}/> : getInitials()}
						</div>
						<div className="profile-info">
							<h3 className="profile-name">{user?.nickname || user?.username}</h3>
							<span
								className="profile-role">{user?.roles?.includes('ROLE_ADMIN') ? '👑 관리자' : '📚 학습자'}</span>
						</div>
					</div>
					<div className="profile-stats">
						<div className="stats-header">📅 오늘의 학습</div>
						{stats.loading ?
							<div style={{fontSize: '13px', color: '#888', padding: '8px 0'}}>확인 중...</div> :
							stats.dueCards === 0 ? (
								<div style={{
									display: 'flex',
									alignItems: 'center',
									gap: '8px',
									fontSize: '14px',
									color: '#10b981',
									fontWeight: 600,
									padding: '6px 0'
								}}><span style={{fontSize: '18px'}}>✅</span><span>오늘 학습 완료!</span></div>
							) : (
								<div className="stats-content">
									<div style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										gap: '2px'
									}}><span className="stat-value">{stats.dueDecks}</span><span
										style={{fontSize: '11px', color: '#888'}}>덱</span></div>
									<div
										style={{width: '1px', height: '36px', background: 'rgba(0,0,0,0.1)'}}></div>
									<div style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										gap: '2px'
									}}><span className="stat-value">{stats.dueCards}</span><span
										style={{fontSize: '11px', color: '#888'}}>카드</span></div>
								</div>
							)}
					</div>
					<div className="profile-actions">
						<Link to="/dashboard" className="action-btn primary"
						      style={{
							      background: 'linear-gradient(135deg, #667eea, #764ba2)',
							      color: '#fff'
						      }}><span>📊</span> {t('nav.dashboard')}</Link>
						<Link to="/study" className="action-btn secondary" style={{
							background: 'rgba(102,126,234,0.1)',
							color: '#667eea',
							border: '1px solid rgba(102,126,234,0.2)'
						}}><span>📖</span> 학습하기</Link>
					</div>
					<button className="logout-btn" onClick={() => {
						setToastMessage(t('auth.logout_success'));
						setShowToast(true);
						logout();
					}}>로그아웃
					</button>
				</>
			) : (
				<>
					<h3 className="card-title" style={{
						fontSize: '1.25rem',
						marginBottom: '24px',
						color: '#111',
						fontWeight: '700'
					}}>{t('home.quick_login')}</h3>
					<div style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '16px',
						flex: 1,
						justifyContent: 'center',
						width: '100%'
					}}>
						<input className="text-input" placeholder={t('auth.username_placeholder')} value={username}
						       onChange={(e) => setUsername(e.target.value)}
						       onKeyDown={(e) => e.key === 'Enter' && handleLogin()}/>
						<input className="text-input" type="password"
						       placeholder={t('auth.password_placeholder')} value={password}
						       onChange={(e) => setPassword(e.target.value)}
						       onKeyDown={(e) => e.key === 'Enter' && handleLogin()}/>
						<button className="primary-btn" onClick={handleLogin}>{t('auth.login_btn')}</button>
						{error &&
							<p style={{color: '#ff6b6b', fontSize: '0.85rem', margin: 0, textAlign: 'center'}}>{error}</p>}
					</div>
					<div style={{textAlign: 'center', fontSize: '0.9rem', marginTop: '20px'}}>
						<Link to="/register" className="muted"
						      style={{textDecoration: 'underline', color: '#666'}}>{t('auth.create_account')}</Link>
					</div>
				</>
			)}
		</div>
	);
};

// --- 5. HomePage 메인 페이지 ---
export default function HomePage() {
	const {t} = useTranslation();
	const {user} = useAuth();
	const shortcuts = [
		{label: t('nav.my_decks'), to: '/decks'},
		{label: t('nav.study'), to: '/study'},
		{label: t('nav.community'), to: '/posts'}
	];

	const isAdmin = user?.roles?.some((r: UserRole | string) => {
		const roleName = typeof r === 'string' ? r : r.name || r.toString();
		return roleName === 'ROLE_ADMIN' || roleName === 'ROLE_MANAGER';
	});

	if (isAdmin) shortcuts.push({label: '⚙️ Admin', to: '/admin'});

	return (
		<Layout>
			{/*
			 * ✅ 핵심 수정 포인트:
			 * 1. 바깥 래퍼: overflow-x: auto → 창이 좁아지면 가로 스크롤 생성
			 * 2. 안쪽 컨테이너: minWidth: 900px → 이 너비 이하로 절대 줄어들지 않음
			 * 3. 상단 그리드: height 고정 제거 → minHeight로 교체 (내용물에 따라 유연하게)
			 * 4. 그리드 컬럼: minmax 사용 → 최소 너비 보장
			 */}
			<div style={{
				overflowX: 'auto',   // ✅ 전체 페이지에 가로 스크롤 부여
				overflowY: 'visible',
				width: '100%',
			}}>
				<div style={{
					minWidth: '900px',       // ✅ 이 너비 이하로 줄어들지 않음 (레이아웃 보호)
					width: '100%',
					margin: '0 auto',
					boxSizing: 'border-box',
					padding: '0 4px',
				}}>
					{/* 상단 섹션: 캐러셀 + 로그인 */}
					<div style={{
						display: 'grid',
						gridTemplateColumns: 'minmax(0, 3fr) minmax(260px, 1fr)', // ✅ 로그인 위젯 최소 260px 보장
						gap: '20px',
						marginBottom: '20px',
						minHeight: '380px',   // ✅ 고정 height 대신 minHeight 사용
						alignItems: 'stretch',
					}}>
						<div style={{height: '100%', minHeight: '380px'}}><Carousel/></div>
						<div style={{height: '100%', minHeight: '380px'}}><LoginWidget/></div>
					</div>

					{/* 중단 섹션: 공지사항 & 커뮤니티 */}
					<div style={{
						display: 'grid',
						gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', // ✅ 양쪽 균등 분할, 넘침 방지
						gap: '20px',
						marginBottom: '30px'
					}}>
						<NoticeWidget/>
						<CommunityWidget/>
					</div>

					{/* 하단 섹션: 바로가기 버튼 */}
					<div style={{
						width: '100%',
						overflowX: 'auto',
						borderTop: '1px solid rgba(0,0,0,0.05)',
						paddingTop: '20px',
					}}>
						<div style={{
							display: 'flex',
							gap: '12px',
							justifyContent: 'center',
							minWidth: 'max-content',
							padding: '0 10px',
						}}>
							{shortcuts.map((s) => (
								<Link key={s.to} to={s.to} className="secondary-btn"
								      style={{
									      padding: '10px 24px',
									      minWidth: '140px',
									      textAlign: 'center',
									      flexShrink: 0,
									      whiteSpace: 'nowrap',
								      }}>{s.label}</Link>
							))}
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
}
