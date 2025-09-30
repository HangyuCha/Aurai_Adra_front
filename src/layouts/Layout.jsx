// src/layouts/Layout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation.jsx';

export default function Layout() {
  const location = useLocation();
  // 로딩과 스타트 페이지에서는 네비게이션 바를 숨깁니다.
  const showNavigation = !['/loading', '/start'].includes(location.pathname);

  return (
    <div className="app-shell">
      {showNavigation && <Navigation />}
      <main className="app-main">
        <div className="page-content">
          <Outlet /> {/* 🔑 자식 라우트들이 여기 렌더됨 */}
        </div>
      </main>
    </div>
  );
}
