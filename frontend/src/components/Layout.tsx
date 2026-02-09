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

	return (
		<div className="app-shell">
			<div className="app-frame">
				<header className="top-nav">
					{/* 🍡 [좌측 최상단] 조장님의 커스텀 당고 로고 영역 */}
					<div
						className="brand"
						onClick={() => navigate('/')}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '8px',
							cursor: 'pointer',
							userSelect: 'none'
						}}
					>
						{/* public/dango.svg 불러오기 */}
						<img
							src="/dango.svg"
							alt="Dango Logo"
							style={{ height: '42px', width: 'auto' }}
						/>

						{/* 조장님의 시그니처 폰트 디자인 */}
						<span style={{
							fontFamily: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", sans-serif',
							color: '#d9534f',
							fontSize: '1.6rem',
							fontWeight: 'bold',
							fontStyle: 'italic',
							marginLeft: '2px'
						}}>
              DANGO
            </span>
					</div>

					<div className="nav-links">
						{/* 언어 선택 스위처 (KO EN JA) */}
						<div className="lang-switcher" style={{ marginRight: '15px', display: 'flex', gap: '8px' }}>
							{['ko', 'en', 'ja'].map((lng) => (
								<button
									key={lng}
									onClick={() => i18n.changeLanguage(lng)}
									style={{
										background: 'none',
										border: 'none',
										color: i18n.language === lng ? '#333' : '#aaa',
										fontWeight: i18n.language === lng ? 'bold' : 'normal',
										cursor: 'pointer',
										fontSize: '0.9rem'
									}}
								>
									{lng.toUpperCase()}
								</button>
							))}
						</div>

						{/* 6개 메뉴 리스트 */}
						{links.map((link) => (
							<Link
								key={link.to}
								to={link.to}
								className="nav-link"
								style={{
									borderColor: pathname === link.to ? 'rgba(255, 183, 178, 0.6)' : undefined,
									background: pathname === link.to ? 'rgba(255, 183, 178, 0.25)' : undefined,
									color: pathname === link.to ? '#d9534f' : undefined,
									fontWeight: pathname === link.to ? 'bold' : undefined,
									padding: '8px 12px',
									borderRadius: '12px',
									textDecoration: 'none'
								}}
							>
								{link.label}
							</Link>
						))}

						{/* 로그인/로그아웃 버튼 */}
						{!token ? (
							<Link to="/login" className="nav-link">{t('nav.login')}</Link>
						) : (
							<button onClick={handleLogout} className="nav-link" style={{ background: 'transparent', cursor: 'pointer', border: 'none' }}>
								{t('nav.logout')}
							</button>
						)}
					</div>
				</header>

				<main className="content-area">{children}</main>

				<footer className="footer" style={{ marginTop: '50px', padding: '20px 0', borderTop: '1px solid #eee' }}>
					<span className="muted">조장: 박제하 조원: 이산하, 임문현, 전민종 | version. 1.01</span>
				</footer>
			</div>
		</div>
	);
}