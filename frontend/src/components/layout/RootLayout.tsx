import { Outlet } from "react-router-dom";
import DangoHeader from "../common/DangoHeader";

const RootLayout: React.FC = () => {
    return (
        <div className="app-shell"> {/* 배경 그라데이션 및 전체 레이아웃 */}
            <div className="app-frame"> {/* 중앙 정렬 프레임 */}
                <DangoHeader />
                <main className="content-area"> {/* 그리드 및 간격 설정 */}
                    <Outlet /> {/* 여기서 팀원들이 만든 LoginPage, PostsPage 등이 교체되며 나타납니다! */}
                </main>
            </div>
        </div>
    );
};

export default RootLayout;