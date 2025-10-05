import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import kakaoIcon from '../../assets/kakao.png';

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // 임시 로그인 성공 처리
    localStorage.setItem('accessToken', 'dummy-token-for-testing'); // 임시 토큰 발급
    alert('로그인 되었습니다.');
    navigate('/home');
  };

  return (
    <>
      <h1 className={styles.title}>Login</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <input type="text" id="id" name="id" placeholder="별명" className={styles.input} required />
        </div>
        <div className={styles.field}>
          <input type="password" id="password" name="password" placeholder="비밀번호" className={styles.input} required />
        </div>
        <button type="submit" className={styles.loginButton}>
          회춘하기
        </button>
      </form>
      <div className={styles.links}>
        <button type="button" onClick={() => navigate('/signup')} className={styles.link}>
          회원가입
        </button>
        <button type="button" onClick={() => navigate('/find')} className={styles.link}>
          정보찾기
        </button>
      </div>
      <div className={styles.socialLogin}>
        <button type="button" className={styles.kakaoButton}>
          <img src={kakaoIcon} alt="Kakao" className={styles.kakaoIcon} />
          카카오톡으로 로그인
        </button>
      </div>
    </>
  );
}

