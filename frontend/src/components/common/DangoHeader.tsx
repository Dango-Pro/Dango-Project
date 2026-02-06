import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const DangoHeader: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        if (window.confirm('로그아웃 하시겠습니까?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            navigate('/login');
            window.location.reload();
        }
    };

    return (
        <header className="top-nav">
            <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
                <div className="brand-dot"></div>
                <span>DANGO</span>
            </Link>

            <nav className="nav-links">
                <Link to="/study" className="nav-link">학습하기</Link>
                {/* /board를 프로젝트 표준 경로인 /posts로 변경 */}
                <Link to="/posts" className="nav-link">게시판</Link>
                {/* /mypage를 UserPage가 사용하는 /user 경로로 변경 */}
                <Link to="/user" className="nav-link">마이페이지</Link>
            </nav>

            <div className="nav-links">
                {token ? (
                    <button className="primary-btn" onClick={handleLogout}>로그아웃</button>
                ) : (
                    <button className="primary-btn" onClick={() => navigate('/login')}>로그인</button>
                )}
            </div>
        </header>
    );
};

export default DangoHeader;