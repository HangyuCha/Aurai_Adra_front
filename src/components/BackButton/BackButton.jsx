import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './BackButton.module.css';

/**
 * 공통 BackButton
 * - 기본: 화면 고정(fixed) 위치 top:28 / right:80 / z-index:1600
 * - history 스택이 짧을 때는 fallback 경로(/home 기본)로 이동
 * - 새 페이지에서 그냥 <BackButton /> 한 줄로 사용 가능
 *
 * props
 * - variant: 'fixed' | 'bare' | 'inside' (기본 fixed)
 * - top / right: 위치 커스터마이징 (number | string)
 * - fallback: 히스토리가 거의 없을 때 이동할 경로 (기본 '/home')
 */
export default function BackButton({
  variant = 'fixed',
  top = 28,
  right = 80,
  fallback = '/home', // 히스토리 짧을 때 기본 이동 경로
  to,                  // 지정되면 항상 이 경로로 이동 (이전페이지 무시)
  replace = false,     // to 사용 시 replace 여부
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // 강제 목적지 우선
    if (to) {
      if (location.pathname !== to) navigate(to, { replace });
      return;
    }
    const profileCluster = (p) => ['/me','/settings','/suggestion'].some(pref => p === pref || p.startsWith(pref + '/'));
    if(profileCluster(location.pathname)){
      const entry = sessionStorage.getItem('profileEntryFrom');
      if(entry && entry !== location.pathname){
        navigate(entry, { replace: true });
        return;
      }
      if(location.pathname !== '/home'){
        navigate('/home', { replace: true });
        return;
      }
    }
    // 일반 뒤로가기 + 짧은 히스토리 fallback
    if (window.history.length <= 2) {
      if (location.pathname !== fallback) navigate(fallback, { replace: true });
      return;
    }
    navigate(-1);
  };

  useEffect(() => {
    // 디버그 필요시 유지
    // console.log('[BackButton render]', { path: location.pathname, history: window.history.length, variant });
  }, [location.pathname, variant]);

  // 고정형 (프로젝트 기본 패턴)
  if (variant === 'fixed') {
    const style = { position: 'fixed', top, right, zIndex: 1600 };
    return (
      <button
        type="button"
        className={styles.backBtn}
        style={style}
        onClick={handleBack}
        aria-label="이전 페이지로 돌아가기"
      >
        돌아가기
      </button>
    );
  }

  // 단순 버튼 (레이아웃 내 흐름에 맞게 배치하고 싶을 때)
  if (variant === 'bare') {
    return (
      <button
        type="button"
        className={styles.backBtn}
        onClick={handleBack}
        aria-label="이전 페이지로 돌아가기"
      >
        돌아가기
      </button>
    );
  }

  // 컨테이너 안에 여백/구조 포함해서 넣고 싶은 경우 (현 프로젝트에서는 사용 빈도 낮음)
  return (
    <div className={styles.insideWrap} data-debug="back-inside">
      <button
        type="button"
        className={styles.backBtn}
        onClick={handleBack}
        aria-label="이전 페이지로 돌아가기"
      >
        돌아가기
      </button>
    </div>
  );
}
