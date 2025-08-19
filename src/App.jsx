// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './layouts/Layout.jsx';
import LoginPage from './pages/Login/Login.jsx';
import LoadingPage from './pages/Loading/loading.jsx';
import SignupPage from './pages/Signup/Signup.jsx';
import SignupExtraPage from './pages/Signup/SignupStep2.jsx'; // 2단계

function EntryRoute() {
  const navigate = useNavigate();
  useEffect(() => {
    const saw = sessionStorage.getItem('sawLoading');
    navigate(saw ? '/login' : '/loading', { replace: true });
  }, [navigate]);
  return null;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EntryRoute />} />
      <Route path="/loading" element={<LoadingPage />} />

      {/* ✅ 레이아웃 하위는 '상대 경로'로 */}
      <Route element={<Layout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="signup/extra" element={<SignupExtraPage />} />
        {/* 레이아웃 영역 내에서만 잡히는 catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>
    </Routes>
  );
}
