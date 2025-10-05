// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './layouts/Layout.jsx';
import StartPage from './pages/Start/Start.jsx';
import LoginPage from './pages/Login/Login.jsx';
import LoadingPage from './pages/Loading/loading.jsx';
import SignupPage from './pages/Signup/Signup.jsx';
import SignupExtraPage from './pages/Signup/SignupStep2.jsx'; // 2단계
import FindInfoPage from './pages/Find/Findinfo.jsx';
import FindInfoResultPage from './pages/Find/FindInfoResult.jsx'; // ✅ Step2
import Home from './pages/Home/Home.jsx';
import PostLogin from './pages/PostLogin/PostLogin.jsx';
import SettingsPage from './pages/Settings/setting.jsx';
import SuggestionPage from './pages/Suggestion/Suggestion.jsx';
import WritePage from './pages/Write/Write.jsx';
import SuggestionDetailPage from './pages/SuggestionDetail/SuggestionDetail.jsx';
import MyInfoPage from './pages/MyInfo/myinfo.jsx';
import MissionShare from './pages/MissionShare/MissionShare.jsx'; // 추가

// 인증이 필요한 경로 감싸기
function PrivateRoute({ children }) {
  const token = localStorage.getItem('accessToken');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// 진입: 무조건 로그인 화면 (처음 로딩 스플래시 경험 안 했으면 스플래시 -> 로그인)
function EntryRoute() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      navigate('/home', { replace: true });
    } else {
      navigate('/loading', { replace: true });
    }
  }, [navigate]);
  return null;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EntryRoute />} />

      {/* ✅ 레이아웃 하위는 '상대 경로'로 */}
      <Route element={<Layout />}>
        <Route path="loading" element={<LoadingPage />} />
        <Route path="start" element={<StartPage />} />
        <Route
          path="intro" /* 로그인 직후 노출될 새 페이지 */
          element={
            <PrivateRoute>
              <PostLogin />
            </PrivateRoute>
          }
        />
        <Route
          path="home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="signup/extra" element={<SignupExtraPage />} />
        {/* 레이아웃 영역 내에서만 잡히는 catch-all */}
        <Route path="find" element={<FindInfoPage />} />
        {/* ✅ 정보 찾기 */}
        <Route path="find/step2" element={<FindInfoResultPage />} />
        {/* ✅ 추가 */}
        <Route path="settings" element={<SettingsPage />} />
        {/* ✅ 설정 */}
        <Route path="suggestion" element={<SuggestionPage />} />
        <Route path="suggestion/write" element={<WritePage />} />
        <Route path="suggestion/:id" element={<SuggestionDetailPage />} />
  {/* 상대 경로로 수정하여 Layout (BackButton, ProfileButton) 적용 */}
  <Route path="me" element={<MyInfoPage />} />
  <Route path="mission-share" element={<MissionShare />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
}

// 이중연 시도

