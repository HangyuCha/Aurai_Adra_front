// src/layouts/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation.jsx';

export default function Layout() {
  return (
    <div className="app-shell">
      <Navigation />
      <main className="app-main">
        <Outlet /> {/* 🔑 자식 라우트들이 여기 렌더됨 */}
      </main>
    </div>
  );
}
