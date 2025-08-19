// src/App.jsx  ← 로딩 화면은 네비/푸터 없이, 나머지는 Layout으로 감싸기
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './layouts/Layout.jsx';
import LoginPage from './pages/Login/Login.jsx';
import LoadingPage from './pages/Loading/loading.jsx';

export default function App() {
  const { pathname } = useLocation();
  const isLoading = pathname === '/loading';

  if (isLoading) {
    return (
      <Routes>
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="*" element={<Navigate to="/loading" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* 필요 시 다른 페이지 라우트 추가 */}
        <Route path="*" element={<Navigate to="/loading" replace />} />
      </Routes>
    </Layout>
  );
}


//한규 첫 시도
