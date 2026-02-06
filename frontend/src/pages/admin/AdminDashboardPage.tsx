import React from 'react';

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 border-b pb-4">관리자 대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 통계 카드 (추후 API 연동) */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium">전체 사용자</h3>
          <p className="text-2xl font-bold mt-2">- 명</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">생성된 덱</h3>
          <p className="text-2xl font-bold mt-2">- 개</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-medium">학습 기록</h3>
          <p className="text-2xl font-bold mt-2">- 건</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">시스템 상태</h2>
        <p className="text-gray-600">서버 및 데이터베이스가 정상 작동 중입니다.</p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;