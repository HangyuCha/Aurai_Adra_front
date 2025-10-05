// src/layouts/Layout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ProfileButton from '../components/ProfileButton/ProfileButton';
import BackButton from '../components/BackButton/BackButton';

export default function Layout() {
  const location = useLocation();
  // 로딩, 스타트, 로그인 페이지에서는 프로필 버튼을 숨깁니다.
  const showProfileButton = !['/loading', '/start', '/login'].includes(location.pathname);
  // 홈/로딩/스타트/로그인/설정/내정보 페이지에서는 전역 BackButton 숨김 (/settings, /me 는 로컬에서 개별 구현)
  const showBackButton = !['/home', '/loading', '/start', '/login', '/settings', '/me'].includes(location.pathname);
  // (이전) 설정 페이지 전용 내부 스크롤 제거 -> 모든 페이지 동일 동작
  const isHome = location.pathname === '/home';
  // 스크롤 필요한 경로 목록 (필요 시 확장)
  const scrollablePaths = ['/settings', '/mission-share', '/me'];
  const isScrollable = scrollablePaths.some(p => location.pathname.startsWith(p));

  const pageClasses = [
          'page-content',
          isScrollable ? 'scrollable' : '',
          isHome ? 'no-scroll' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className="app-shell">
      {showProfileButton && <ProfileButton />}
      <main className="app-main">
        <div className={pageClasses}>
                {showBackButton && <BackButton variant="fixed" />}
          <Outlet /> {/* 🔑 자식 라우트들이 여기 렌더됨 */}
        </div>
      </main>
    </div>
  );
}
