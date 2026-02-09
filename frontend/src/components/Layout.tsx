import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../libs/api';

interface LayoutProps {
	children: ReactNode;
	pageTitle?: string;
	subtitle?: string;
}

export default function Layout({ children }: LayoutProps) {
	const { t, i18n } = useTranslation();
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

	useEffect(() => {
		if (token) {
			api.get('/users/me').catch(() => {
				localStorage.removeItem('token');
				setToken(null);
			});
		}
	}, [token]);

	const handleLogout = () => {
		if (window.confirm(t('common.confirm') + '?')) {
			localStorage.removeItem('token');
			setToken(null);
			navigate('/');
		}
	};

	const links = [
		{ to: '/', label: t('nav.home') },
		{ to: '/dashboard', label: t('nav.dashboard') },
		{ to: '/decks', label: t('nav.my_decks') },
		{ to: '/study', label: t('nav.study') },
		{ to: '/posts', label: t('nav.community') },
		{ to: '/user', label: t('nav.mypage') },
	];

	// 공통으로 사용할 메뉴 아이템 스타일 (언어 무관하게 고정)
	const fixedMenuItemStyle = (to: string): React.CSSProperties => ({
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: '110px', // 💡 min-width 대신 아예 width로 고정 (강력한 효과)
		padding: '8px 0',
		borderRadius: '12px',
		textDecoration: 'none',
		textAlign: 'center',
		whiteSpace: 'nowrap',
		transition: 'all 0.2s ease',
		fontSize: '0.95rem',
		fontWeight: pathname === to ? 'bold' : '500',
		color: pathname === to ? '#d9534f' : '#222',
		background: pathname === to ? 'rgba(255, 183, 178, 0.25)' : 'transparent',
		borderColor: pathname === to ? 'rgba(255, 183, 178, 0.6)' : 'transparent',
		borderStyle: 'solid',
		borderWidth: '1px',
	});

	return (
		<div className="app-shell">
			<div className="app-frame">
				<header className="top-nav" style={{
					display: 'flex',
					alignItems: 'center',
					padding: '16px 22px',
					height: '80px' // 헤더 높이도 고정하여 위아래 흔들림 방지
				}}>

					{/* [기둥 1] 로고 영역 (완전 고정) */}
					<div className="brand" onClick={() => navigate('/')} style={{
						display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
						width: '180px', flexShrink: 0, userSelect: 'none'
					}}>
						<img src="/dango.svg" alt="Dango Logo" style={{ height: '42px', width: 'auto' }} />
						<span style={{
							fontFamily: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", sans-serif',
							color: '#d9534f', fontSize: '1.6rem', fontWeight: 'bold', fontStyle: 'italic'
						}}>DANGO</span>
					</div>

					{/* [기둥 2] 언어 스위처 (완전 고정) */}
					<div className="lang-switcher" style={{
						display: 'flex', gap: '4px', width: '120px', justifyContent: 'center', flexShrink: 0
					}}>
						{['ko', 'en', 'ja'].map((lng) => (
							<button
								key={lng}
								onClick={() => i18n.changeLanguage(lng)}
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

					{/* [기둥 3] 메뉴 네비게이션 (나머지 공간 다 차지하되 오른쪽 정렬) */}
					<nav style={{
						display: 'flex', flexGrow: 1, justifyContent: 'flex-end', gap: '2px', alignItems: 'center'
					}}>
						{links.map((link) => (
							<Link key={link.to} to={link.to} style={fixedMenuItemStyle(link.to)}>
								{link.label}
							</Link>
						))}

						{/* 로그인/로그아웃도 동일한 110px 규격 적용 */}
						{!token ? (
							<Link to="/login" style={fixedMenuItemStyle('/login')}>{t('nav.login')}</Link>
						) : (
							<button onClick={handleLogout} style={{ ...fixedMenuItemStyle(''), border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
								{t('nav.logout')}
							</button>
						)}
					</nav>
				</header>

				<main className="content-area">{children}</main>

				<footer className="footer" style={{ marginTop: '50px', padding: '20px 0', borderTop: '1px solid #eee' }}>
					<span className="muted">조장: 박제하 조원: 이산하, 임문현, 전민종 | version. 1.01</span>
				</footer>
			</div>
		</div>
	);
}