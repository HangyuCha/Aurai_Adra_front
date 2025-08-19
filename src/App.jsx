// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './layouts/Layout.jsx';
import LoginPage from './pages/Login/Login.jsx';
import LoadingPage from './pages/Loading/loading.jsx';
import SignupPage from './pages/Signup/Signup.jsx';

// 홈(/) 진입 시 로딩 1회만 보여주는 게이트
function EntryRoute() {
  const navigate = useNavigate();
  useEffect(() => {
    const saw = sessionStorage.getItem('sawLoading');
    if (saw) {
      navigate('/login', { replace: true });
    } else {
      navigate('/loading', { replace: true });
    }
  }, [navigate]);
  return null;
}

export default function App() {
  return (
    <Routes>
      {/* 홈 → 게이트에서 로딩 여부 판단 */}
      <Route path="/" element={<EntryRoute />} />

      {/* 로딩은 레이아웃 없이 */}
      <Route path="/loading" element={<LoadingPage />} />

      {/* 나머지는 레이아웃 포함 (헤더/푸터 보임) */}
      <Route element={<Layout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* 기타 경로는 로그인으로 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
