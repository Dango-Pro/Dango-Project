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

	// 3. useAuth() 호출하여 logout, token 가져오기
	const {logout: authLogout, token} = useAuth();

	const [showToast, setShowToast] = useState(false);
	const [toastMessage, setToastMessage] = useState('');



	// 6. 언어 변경 함수 정의 (changeLanguage 에러 해결)
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
		width: '100px',
		padding: '8px 0',
		borderRadius: '12px',
		textDecoration: 'none',
		textAlign: 'center',
		whiteSpace: 'nowrap',
		transition: 'all 0.2s ease',
		fontSize: '0.85rem',
		fontWeight: pathname === to ? 'bold' : '500',
		color: pathname === to ? '#d9534f' : '#222',
		background: pathname === to ? 'rgba(255, 183, 178, 0.25)' : 'transparent',
		borderColor: pathname === to ? 'rgba(255, 183, 178, 0.6)' : 'transparent',
		borderStyle: 'solid',
		borderWidth: '1px',
	});

	return (
		<div className = "app-shell">
			<div className = "app-frame">
				<Toast
					isOpen = {showToast}
					message = {toastMessage}
					type = "success"
					onClose = {() => setShowToast(false)}
				/>

				<header className = "top-nav" style = {{
					display: 'flex',
					alignItems: 'center',
					padding: '16px 22px',
					height: '80px',
					backgroundColor: '#fff'
				}}>
					<div className = "brand" onClick = {() => navigate('/')} style = {{
						display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
						width: '180px', flexShrink: 0, userSelect: 'none'
					}}>
						<img src = "/dango.svg" alt = "Dango Logo" style = {{height: '42px', width: 'auto'}}/>
						<span style = {{
							fontFamily: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", sans-serif',
							color: '#d9534f', fontSize: '1.6rem', fontWeight: 'bold', fontStyle: 'italic'
						}}>DANGO</span>
					</div>

					<div className = "lang-switcher" style = {{
						display: 'flex', gap: '4px', width: '120px', justifyContent: 'center', flexShrink: 0
					}}>
						{['ko', 'en', 'ja'].map((lng) => (
							<button
								key = {lng}
								onClick = {() => changeLanguage(lng)}
								style = {{
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

					<nav style = {{
						display: 'flex', flexGrow: 1, justifyContent: 'flex-end', gap: '0px', alignItems: 'center'
					}}>
						{links.map((link) => (
							<Link key = {link.to} to = {link.to} style = {fixedMenuItemStyle(link.to)}>
								{link.label}
							</Link>
						))}

						{!token ? (
							<Link to = "/login" style = {fixedMenuItemStyle('/login')}>{t('nav.login')}</Link>
						) : (
							<button onClick = {handleLogout} style = {{
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

				<main className = "content-area">{children}</main>

				<footer className = "footer" style = {{
					marginTop: '50px',
					padding: '30px 20px',
					backgroundColor: '#f8f9fa',
					borderTop: '1px solid #e9ecef',
					textAlign: 'center',
					color: '#000',
					fontSize: '14px',
					lineHeight: '1.6'
				}}>
					<div style = {{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						marginBottom: '12px'
					}}>
						<span style = {{
							fontSize: '18px',
							marginRight: '8px',
							display: 'flex',
							alignItems: 'center'
						}}>🍡</span>
						<strong style = {{fontSize: '15px', letterSpacing: '-0.3px'}}>
							{t('footer.project_desc')}
						</strong>
					</div>

					<div style = {{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						marginBottom: '12px',
						fontSize: '13px'
					}}>
						<span style = {{margin: '0 10px'}}>👤 <b>{t('footer.team_leader')}</b> {t('footer.leader_name')}</span>
						<span style = {{color: '#dee2e6'}}>|</span>
						<span style = {{margin: '0 10px'}}>👥 <b>{t('footer.team_members')}</b> {t('footer.member_names')}</span>
					</div>

					<div style = {{fontSize: '12px', fontWeight: '500'}}>
                  <span style = {{
	                  backgroundColor: '#e9ecef',
	                  padding: '2px 8px',
	                  borderRadius: '4px',
	                  marginRight: '12px'
                  }}>
                    {t('footer.version')}
                  </span>
						<span style = {{color: '#000'}}>
                    <span style = {{color: 'crimson', fontWeight: 'bold'}}>{t('footer.latest_update')} :&nbsp;&nbsp;</span> 2026.02.04. 18:17
                  </span>
					</div>
				</footer>
			</div>
		</div>
	);
}