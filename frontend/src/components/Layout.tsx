import {type ReactNode} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {useAuth} from '../context/AuthContext';
import Toast from './Toast';
import {useState} from 'react';

interface LayoutProps {
	children: ReactNode;
	pageTitle?: string;
	subtitle?: string;
}

export default function Layout({children}: LayoutProps) {
	const {t, i18n} = useTranslation();
	const {pathname} = useLocation();
	const navigate = useNavigate();
	const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

	// 1. 상태 선언 (Team Code)
	const [showToast, setShowToast] = useState(false);
	const [toastMessage, setToastMessage] = useState('');

// 2. 관리자 여부 확인 (Team Code)
// user 객체 정보를 바탕으로 권한을 계산합니다.
	const isAdmin = user?.roles?.some((r: any) =>
		r === 'ROLE_ADMIN' || r.name === 'ROLE_ADMIN' || (typeof r === 'object' && r.toString() === 'ROLE_ADMIN')
	);

// 3. 사용자 인증 정보 유효성 검사 (제하 님 코드)
// 컴포넌트가 마운트되거나 토큰이 변경될 때 실행됩니다.
	useEffect(() => {
		if (token) {
			api.get('/users/me')
				.catch(() => {
					// 토큰이 유효하지 않을 경우 초기화 처리
					localStorage.removeItem('token');
					setToken(null);
				});
		}
	}, [token]);

	const handleLogout = () => {
		// 1. 실수 방지를 위한 확인 창 (제하 님 코드 유지)
		if (window.confirm(t('common.confirm') + '?')) {

			// 2. 로그아웃 성공 토스트 알림 (팀 코드 적용)
			setToastMessage(t('auth.logout_success'));
			setShowToast(true);

			// 3. 알림을 보여준 후 로그아웃 처리 및 페이지 이동 (두 코드 병합)
			setTimeout(() => {
				// 토큰 삭제 및 상태 초기화 (제하 님 코드)
				localStorage.removeItem('token');
				setToken(null);

				// 만약 팀의 logout() 함수가 별도로 있다면 여기서 호출해도 좋습니다.
				// logout();

				// 메인 페이지로 이동 (제하 님 코드)
				navigate('/');
			}, 1000); // 1초 뒤에 최종 처리하여 사용자가 토스트를 볼 시간을 줍니다.
		}
	};

	const links = [
		{to: '/', label: t('nav.home')},
		{to: '/dashboard', label: t('nav.dashboard')},
		{to: '/decks', label: t('nav.my_decks')},
		{to: '/study', label: t('nav.study')},
		// 팀의 신규 기능: AI Chat (제하 님 코드에 추가)
		{to: '/chat', label: 'AI Chat'},
		{to: '/posts', label: t('nav.community')},
		{to: '/user', label: t('nav.mypage')},
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
		<div className = "app-shell">
			<div className = "app-frame">
				{/* 1. 알림 시스템 (팀 코드 - 로그아웃 피드백 등에 필수) */}
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
					height: '80px', // 제하 님의 흔들림 방지 높이 고정
					backgroundColor: '#fff' // 배경색 명시
				}}>

					{/* [기둥 1] 로고 영역 (제하 님의 고정 너비 전략) */}
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

					{/* [기둥 2] 언어 스위처 (제하 님의 레이아웃 + 팀의 다국어 로직) */}
					<div className = "lang-switcher" style = {{
						display: 'flex', gap: '4px', width: '120px', justifyContent: 'center', flexShrink: 0
					}}>
						{['ko', 'en', 'ja'].map((lng) => (
							<button
								key = {lng}
								onClick = {() => changeLanguage(lng)} // 팀의 changeLanguage 함수 사용
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

					{/* [기둥 3] 메뉴 네비게이션 (오른쪽 정렬 및 Admin 추가) */}
					<nav style = {{
						display: 'flex', flexGrow: 1, justifyContent: 'flex-end', gap: '2px', alignItems: 'center'
					}}>
						{links.map((link) => (
							<Link key = {link.to} to = {link.to} style = {fixedMenuItemStyle(link.to)}>
								{link.label}
							</Link>
						))}

						{/* 로그인/로그아웃 버튼 */}
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

						{/* 팀 코드의 필수 기능: 관리자 전용 링크 */}
						{isAdmin && (
							<Link
								to = "/admin"
								style = {{
									...fixedMenuItemStyle('/admin'),
									color: pathname.startsWith('/admin') ? '#667eea' : '#6c757d',
									fontSize: '12px',
									marginLeft: '10px' // 다른 버튼과 약간의 간격
								}}>
								⚙️ Admin
							</Link>
						)}
					</nav>
				</header>

				<main className = "content-area">{children}</main>

				<footer className = "footer" style = {{
					marginTop: '50px', // 제하 님의 여백 관리 (상단 간격 확보)
					padding: '30px 20px',
					backgroundColor: '#f8f9fa', // 팀의 배경색 적용
					borderTop: '1px solid #e9ecef',
					textAlign: 'center',
					color: '#000',
					fontSize: '14px',
					lineHeight: '1.6'
				}}>

					{/* 1. 서비스 정의 영역 (팀 코드의 풍부한 설명 활용) */}
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
							반복 간격 알고리즘 활용 일본어 지식 카드 관리 및 학습 플랫폼
						</strong>
					</div>

					{/* 2. 팀원 정보 (역할 구분이 명확한 팀 코드 구성) */}
					<div style = {{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						marginBottom: '12px',
						fontSize: '13px'
					}}>
						<span style = {{margin: '0 10px'}}>👤 <b>조장</b> 박제하</span>
						<span style = {{color: '#dee2e6'}}>|</span>
						<span style = {{margin: '0 10px'}}>👥 <b>조원</b> 이산하, 임문현, 전민종</span>
					</div>

					{/* 3. 버전 및 업데이트 정보 (팀의 최신 정보 유지) */}
					<div style = {{fontSize: '12px', fontWeight: '500'}}>
      <span style = {{
	      backgroundColor: '#e9ecef',
	      padding: '2px 8px',
	      borderRadius: '4px',
	      marginRight: '12px'
      }}>
        Version 1.03
      </span>

						<span style = {{color: '#000'}}>
        <span style = {{color: 'crimson', fontWeight: 'bold'}}>최신 업데이트 일자 :&nbsp;&nbsp;</span> 2026.02.04. 18:17
      </span>
					</div>
				</footer>
			</div>
		</div>
	);}