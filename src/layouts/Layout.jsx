// src/layouts/Layout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ProfileButton from '../components/ProfileButton/ProfileButton';

export default function Layout() {
  const location = useLocation();
  // 로딩, 스타트, 로그인 페이지에서는 프로필 버튼을 숨깁니다.
  const showProfileButton = !['/loading', '/start', '/login'].includes(location.pathname);

  return (
    <div className="app-shell">
      {showProfileButton && <ProfileButton />}
      <main className="app-main">
        <div className="page-content">
          <Outlet /> {/* 🔑 자식 라우트들이 여기 렌더됨 */}
        </div>
      </main>
    </div>
  );
}
