// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './layouts/Layout.jsx';
import LoginPage from './pages/Login/Login.jsx';
import LoadingPage from './pages/Loading/loading.jsx';
import SignupPage from './pages/Signup/Signup.jsx';
import SignupExtraPage from './pages/Signup/SignupStep2.jsx'; // 2단계
import FindInfoPage from './pages/Find/Findinfo.jsx';
import FindInfoResultPage from './pages/Find/FindInfoResult.jsx'; // ✅ Step2

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
        <Route path="find" element={<FindInfoPage />} />
        {/* ✅ 정보 찾기 */}
          <Route path="find/step2" element={<FindInfoResultPage />} /> 
        {/* ✅ 추가 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>
    </Routes>
  );
}

// 이중연 시도

