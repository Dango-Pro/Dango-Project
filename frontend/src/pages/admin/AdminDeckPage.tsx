import React from 'react';

const AdminDeckPage: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">덱 관리</h1>
      <p>전체 덱 목록을 조회하고 삭제하는 관리자 페이지입니다.</p>
    </div>
  );
};

export default AdminDeckPage;