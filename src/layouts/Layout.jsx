// src/layouts/Layout.jsx
import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ProfileButton from '../components/ProfileButton/ProfileButton';
import HomeLogoButton from '../components/HomeLogoButton/HomeLogoButton';

export default function Layout() {
  const location = useLocation();
  const prevRef = useRef(location.pathname);
  useEffect(()=>{
    const profileCluster = (p) => ['/me','/settings','/suggestion'].some(pref => p === pref || p.startsWith(pref + '/'));
    const prev = prevRef.current;
    const curr = location.pathname;
    if(profileCluster(curr) && !profileCluster(prev)){
      sessionStorage.setItem('profileEntryFrom', (prev && prev!==curr) ? prev : '/home');
    } else if(!profileCluster(curr) && profileCluster(prev)){
      sessionStorage.removeItem('profileEntryFrom');
    }
    prevRef.current = curr;
  }, [location.pathname]);
  // 로딩, 스타트, 로그인 페이지에서는 프로필 버튼을 숨깁니다.
  const showProfileButton = !['/loading', '/start', '/login', '/intro'].includes(location.pathname);
  // 홈/로딩/스타트/로그인/설정/내정보 페이지에서는 전역 BackButton 숨김 (/settings, /me 는 로컬에서 개별 구현)
  // (이전) 설정 페이지 전용 내부 스크롤 제거 -> 모든 페이지 동일 동작
  const isHome = location.pathname === '/home';
  const isIntro = location.pathname === '/intro';
  // 스크롤 필요한 경로 목록 (필요 시 확장)
  // 내부 스크롤이 정말 필요한 페이지만 지정 (settings는 제거)
  const scrollablePaths = ['/mission-share', '/me'];
  const isScrollable = scrollablePaths.some(p => location.pathname.startsWith(p));

  const pageClasses = [
    'page-content',
    isScrollable ? 'scrollable' : '',
    isHome ? 'no-scroll' : '',
    isIntro ? 'no-pad' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className="app-shell">
      {/* 상단 좌측 홈 이동 로고 버튼 (전역) */}
  <HomeLogoButton size={56} to="/home" />
      {showProfileButton && <ProfileButton />}
      <main className="app-main">
        <div className={pageClasses}>
                {/* BackButton 전역 사용 제거됨 */}
          <Outlet /> {/* 🔑 자식 라우트들이 여기 렌더됨 */}
        </div>
      </main>
    </div>
  );
}
