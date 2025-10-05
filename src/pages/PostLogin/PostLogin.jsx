import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PostLogin.module.css';

// 로그인 직후 한 번 보여줄 인트로/시작 화면 (흰 틀 내부 전체 배경 이미지)
export default function PostLogin() {
  const navigate = useNavigate();

  const [show, setShow] = useState(false);

  const handleStart = () => {
    navigate('/home', { replace: true });
  };
  // 1초 뒤 버튼 표시
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={styles.stage} aria-label="시작하기 화면">
      {show && (
        <button
          type="button"
          className={styles.startBtn}
          onClick={handleStart}
          autoFocus
          aria-label="홈 화면으로 이동"
        >
          시작하기
        </button>
      )}
    </div>
  );
}
