import React from 'react';
import { Outlet } from 'react-router-dom';
import Layout from '../Layout'; // 기존 메인 레이아웃 재사용

const AdminLayout: React.FC = () => {
  return (
    <Layout>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* 관리자 전용 헤더 (붉은색 배지) */}
        <div className="bg-red-600 text-white px-4 py-2 text-sm font-bold shadow-md flex justify-between items-center">
          <span>🛡️ Administrator Mode (관리자 접속 중)</span>
          <span className="text-xs opacity-80">보안에 주의하세요</span>
        </div>

        {/* 실제 관리자 페이지 컨텐츠가 들어갈 곳 */}
        <div className="flex-1 container mx-auto p-6">
          <Outlet />
        </div>
      </div>
    </Layout>
  );
};

export default AdminLayout;