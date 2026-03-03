import {useState, type ReactNode} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {useAuth} from '../context/AuthContext';
import Toast from './Toast';

interface LayoutProps {
	children: ReactNode;
	pageTitle?: string;
	subtitle?: string;
}

export default function Layout({children}: LayoutProps) {
	const {t, i18n} = useTranslation();
	const {pathname} = useLocation();
	const navigate = useNavigate();

	const {logout: authLogout, token} = useAuth();

	const [showToast, setShowToast] = useState(false);
	const [toastMessage, setToastMessage] = useState('');

	const changeLanguage = (lng: string) => {
		i18n.changeLanguage(lng);
	};

	const handleLogout = () => {
		if (window.confirm(t('auth.logout_confirm'))) {
			setToastMessage(t('auth.logout_success'));
			setShowToast(true);

			setTimeout(() => {
				if (authLogout) authLogout();
				navigate('/');
			}, 1000);
		}
	};

	const links = [
		{to: '/', label: t('nav.home')},
		{to: '/dashboard', label: t('nav.dashboard')},
		{to: '/decks', label: t('nav.my_decks')},
		{to: '/study', label: t('nav.study')},
		{to: '/chat', label: 'AI Chat'},
		{to: '/posts', label: t('nav.community')},
		{to: '/user', label: t('nav.mypage')},
	];

	const fixedMenuItemStyle = (to: string): React.CSSProperties => ({
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: '120px',         // ✅ 100px → 120px 확대
		padding: '10px 8px',    // ✅ 세로 패딩 확대
		borderRadius: '12px',
		textDecoration: 'none',
		textAlign: 'center',
		whiteSpace: 'nowrap',
		transition: 'all 0.2s ease',
		fontSize: '0.9rem',     // ✅ 글자 크기 살짝 확대
		fontWeight: pathname === to ? 'bold' : '500',
		color: pathname === to ? '#d9534f' : '#222',
		background: pathname === to ? 'rgba(255, 183, 178, 0.25)' : 'transparent',
		borderColor: pathname === to ? 'rgba(255, 183, 178, 0.6)' : 'transparent',
		borderStyle: 'solid',
		borderWidth: '1px',
	});

	return (
		/*
		 * ✅ 수정 핵심:
		 * app-shell / app-frame 클래스가 overflow: hidden 또는 max-width를 강제할 수 있어
		 * 인라인 스타일로 명시적으로 override합니다.
		 */
		<div className="app-shell" style={{
			overflowX: 'auto',   // ✅ 가로 스크롤 허용 (hidden 이었다면 여기서 막혔던 것)
			overflowY: 'auto',
			minHeight: '100vh',
		}}>
			<div className="app-frame" style={{
				minWidth: '900px',     // ✅ 이 너비 이하로 찌그러지지 않음
				width: '100%',
				boxSizing: 'border-box',
			}}>
				<Toast
					isOpen={showToast}
					message={toastMessage}
					type="success"
					onClose={() => setShowToast(false)}
				/>

				{/* ✅ 헤더도 minWidth 설정 → 창이 좁아져도 찌그러지지 않음 */}
				<header className="top-nav" style={{
					display: 'flex',
					alignItems: 'center',
					flexWrap: 'nowrap',     // ✅ 절대 줄바꿈 금지
					padding: '16px 22px',
					height: '80px',
					minHeight: '80px',      // ✅ 세로 찌그러짐 방지
					backgroundColor: '#fff',
					minWidth: 'max-content', // ✅ 모든 메뉴가 다 보일 만큼 너비 자동 확장
					boxSizing: 'border-box',
					overflow: 'visible',
				}}>
					<div className="brand" onClick={() => navigate('/')} style={{
						display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
						width: '180px', flexShrink: 0, userSelect: 'none'
					}}>
						<img src="/dango.svg" alt="Dango Logo" style={{height: '42px', width: 'auto'}}/>
						<span style={{
							fontFamily: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", sans-serif',
							color: '#d9534f', fontSize: '1.6rem', fontWeight: 'bold', fontStyle: 'italic'
						}}>DANGO</span>
					</div>

					<div className="lang-switcher" style={{
						display: 'flex', gap: '4px', width: '120px', justifyContent: 'center', flexShrink: 0
					}}>
						{['ko', 'en', 'ja'].map((lng) => (
							<button
								key={lng}
								onClick={() => changeLanguage(lng)}
								style={{
									background: 'none', border: 'none', cursor: 'pointer', width: '35px',
									color: i18n.language === lng ? '#333' : '#aaa',
									fontWeight: i18n.language === lng ? 'bold' : 'normal',
									fontSize: '0.85rem'
								}}
							>
								{lng.toUpperCase()}
							</button>
						))}
					</div>

					<nav style={{
						display: 'flex', flexGrow: 1, justifyContent: 'flex-end', gap: '0px', alignItems: 'center',
						flexShrink: 0,   // ✅ nav가 줄어들며 메뉴가 겹치는 현상 방지
					}}>
						{links.map((link) => (
							<Link key={link.to} to={link.to} style={fixedMenuItemStyle(link.to)}>
								{link.label}
							</Link>
						))}

						{!token ? (
							<Link to="/login" style={fixedMenuItemStyle('/login')}>{t('nav.login')}</Link>
						) : (
							<button onClick={handleLogout} style={{
								...fixedMenuItemStyle(''),
								border: 'none',
								cursor: 'pointer',
								fontFamily: 'inherit'
							}}>
								{t('nav.logout')}
							</button>
						)}
					</nav>
				</header>

				{/* ✅ main에 overflow 명시 → CSS 클래스의 hidden 가능성 차단 */}
				<main className="content-area" style={{
					overflowX: 'visible',
					overflowY: 'visible',
					width: '100%',
					boxSizing: 'border-box',
				}}>
					{children}
				</main>

				<footer className="footer" style={{
					marginTop: '50px',
					padding: '30px 20px',
					backgroundColor: '#f8f9fa',
					borderTop: '1px solid #e9ecef',
					textAlign: 'center',
					color: '#000',
					fontSize: '14px',
					lineHeight: '1.6'
				}}>
					<div style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						marginBottom: '12px'
					}}>
						<span style={{
							fontSize: '18px',
							marginRight: '8px',
							display: 'flex',
							alignItems: 'center'
						}}>🍡</span>
						<strong style={{fontSize: '15px', letterSpacing: '-0.3px'}}>
							{t('footer.project_desc')}
						</strong>
					</div>

					<div style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						marginBottom: '12px',
						fontSize: '13px'
					}}>
						<span style={{margin: '0 10px'}}>👤 <b>{t('footer.team_leader')}</b> {t('footer.leader_name')}</span>
						<span style={{color: '#dee2e6'}}>|</span>
						<span style={{margin: '0 10px'}}>👥 <b>{t('footer.team_members')}</b> {t('footer.member_names')}</span>
					</div>

					<div style={{fontSize: '12px', fontWeight: '500'}}>
                  <span style={{
	                  backgroundColor: '#e9ecef',
	                  padding: '2px 8px',
	                  borderRadius: '4px',
	                  marginRight: '12px'
                  }}>
                    {import.meta.env.VITE_APP_VERSION ?? 'Version 1.0.4'}
                  </span>
						<span style={{color: '#000'}}>
                     <span style={{color: 'crimson', fontWeight: 'bold'}}>{t('footer.latest_update')} :&nbsp;&nbsp;</span>
							{import.meta.env.VITE_BUILD_DATE ?? new Date().toLocaleDateString('ko-KR', {year: 'numeric', month: '2-digit', day: '2-digit'}).replaceAll('. ', '.').replace('.', '.')}
                  </span>
					</div>
				</footer>
			</div>
		</div>
	);
}