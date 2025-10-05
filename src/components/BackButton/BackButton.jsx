import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './BackButton.module.css';

// variant: 'bare' | 'inside' | 'fixed'
export default function BackButton({ variant = 'bare' }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (window.history.length <= 2) {
      if (location.pathname !== '/home') navigate('/home', { replace: true });
      return;
    }
    navigate(-1);
  };

  useEffect(() => {
    console.log('[BackButton render]', { path: location.pathname, history: window.history.length, variant });
  }, [location.pathname, variant]);

  if (variant === 'fixed') {
    // 프로필 버튼 (right:20px, width 48px) 과 겹치지 않도록 right 여백 20 + 48 + 12 = 80px 정도 확보
    return <button type="button" className={styles.backBtn} style={{ position:'fixed', top:20, right:80, zIndex:1600 }} onClick={handleBack} aria-label="이전 페이지로 돌아가기">돌아가기</button>;
  }
  if (variant === 'bare') {
    return <button type="button" className={styles.backBtn} onClick={handleBack} aria-label="이전 페이지로 돌아가기">돌아가기</button>;
  }
  return (
    <div className={styles.insideWrap} data-debug="back-inside">
      <button type="button" className={styles.backBtn} onClick={handleBack} aria-label="이전 페이지로 돌아가기">돌아가기</button>
    </div>
  );
}
