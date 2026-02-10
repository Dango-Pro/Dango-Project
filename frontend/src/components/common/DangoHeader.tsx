// frontend/src/components/common/DangoHeader.tsx
import React from 'react';

const DangoHeader: React.FC = () => {
    return (
        <header className="top-nav"> {/* 조장님의 CSS 클래스 적용 */}
            <div className="brand">
                <div className="brand-dot"></div>
                <span>DANGO</span>
            </div>

            <nav className="nav-links">
                <a href="/study" className="nav-link">학습하기</a>
                <a href="/board" className="nav-link">게시판</a>
                <a href="/mypage" className="nav-link">마이페이지</a>
            </nav>

            <div className="nav-links">
                <button className="primary-btn">로그인</button>
            </div>
        </header>
    );
};

export default DangoHeader;