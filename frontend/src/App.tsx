import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// 페이지 컴포넌트 불러오기
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// 게시판 관련
import PostsPage from './pages/PostsPage';
import PostCreatePage from './pages/PostCreatePage';
import PostDetailPage from './pages/PostDetailPage';
import PostEditPage from './pages/PostEditPage';

// 덱 & 카드 & 스터디 관련
import DecksPage from './pages/DecksPage';
import DeckCreatePage from './pages/DeckCreatePage';
import DeckDetailPage from './pages/DeckDetailPage';
import DeckEditPage from './pages/DeckEditPage'; // 혹시 있다면 추가
import CardsPage from './pages/CardsPage';
import CardCreatePage from './pages/CardCreatePage';
import CardEditPage from './pages/CardEditPage'; // 혹시 있다면 추가
import StudyPage from './pages/StudyPage';
import DashboardPage from './pages/DashboardPage';
import UserPage from './pages/UserPage';

function App() {
  return (
    <Routes>
      {/* 1. 메인 및 인증 */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* ★ [수정] 링크에 맞춰서 /register 로 변경했습니다! */}
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/user" element={<UserPage />} />

      {/* 2. 게시판 (순서 중요: new가 :id보다 위!) */}
      <Route path="/posts" element={<PostsPage />} />
      <Route path="/posts/create" element={<PostCreatePage />} />
      <Route path="/posts/:id" element={<PostDetailPage />} />
      <Route path="/posts/:id/edit" element={<PostEditPage />} />

      {/* 3. 덱(단어장) 관련 */}
      <Route path="/decks" element={<DecksPage />} />
      <Route path="/decks/create" element={<DeckCreatePage />} />
      <Route path="/decks/:id" element={<DeckDetailPage />} />
      <Route path="/decks/:id/edit" element={<DeckEditPage />} />

      {/* 4. 카드 관련 */}
      <Route path="/cards" element={<CardsPage />} />
      <Route path="/cards/create" element={<CardCreatePage />} />
      <Route path="/cards/:id/edit" element={<CardEditPage />} />

      {/* 5. 스터디 */}
      <Route path="/study" element={<StudyPage />} />

    </Routes>
  );
}

export default App;