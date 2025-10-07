import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import kakaoIcon from '../../assets/kakao.png';
import api from '../../lib/api';

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    const form = new FormData(e.currentTarget);
    const nickname = form.get('id')?.toString().trim();
    const password = form.get('password')?.toString();
    console.log('[LOGIN SUBMIT TRY]', { nickname, passwordLength: password?.length });
    if (!nickname || !password) { setError('별명/비밀번호 입력'); return; }
    setLoading(true);
    try {
      const path = '/api/users/login';
      console.log('[LOGIN TRY]', path);
      const res = await api.post(path, { nickname, password });
      console.log('[LOGIN RESPONSE]', path, res.data);
      const { accessToken, token, nickname: nn, ageRange, gender } = res.data || {};
      const finalToken = accessToken || token;
      if (!finalToken) {
        // 서버가 200을 주면서 토큰이 비어있는 비정상 케이스 또는 null 필드 응답
        setError('로그인 실패: 서버에서 토큰이 반환되지 않았습니다.');
        setLoading(false);
        return;
      }
      localStorage.setItem('accessToken', finalToken);
      if (nn) localStorage.setItem('nickname', nn);
      if (ageRange) localStorage.setItem('ageRange', ageRange);
      if (gender) localStorage.setItem('gender', gender);
  alert('로그인 되었습니다.');
  navigate('/intro', { replace: true });
    } catch (errLogin) {
      const status = errLogin?.response?.status;
      const data = errLogin?.response?.data;
      console.log('[LOGIN ERROR]', status, data);
      const allNullObject = (obj) => {
        if (!obj || typeof obj !== 'object') return false;
        const vals = Object.values(obj);
        return vals.length > 0 && vals.every(v => v === null || v === '');
      };
      let msg;
      if (status === 401) {
        msg = '아이디(별명) 또는 비밀번호가 올바르지 않습니다.';
      } else if (status === 404) {
        msg = '로그인 API 경로를 찾을 수 없습니다. (백엔드 매핑 확인 필요)';
      } else if (typeof data === 'string') {
        msg = data.trim() || '로그인 실패';
      } else if (data?.message) {
        msg = data.message;
      } else if (data?.error) {
        msg = data.error;
      } else if (allNullObject(data)) {
        msg = '아이디(별명) 또는 비밀번호가 올바르지 않습니다.';
      } else if (data) {
        // 개발 중이라면 세부 JSON을 보고 싶을 수 있으니 콘솔로만 출력
        msg = '로그인 실패';
      } else {
        msg = errLogin.message || '로그인 실패';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h1 className={styles.title}>Login</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <input type="text" id="id" name="id" placeholder="별명" className={styles.input} disabled={loading} required />
        </div>
        <div className={styles.field}>
          <input type="password" id="password" name="password" placeholder="비밀번호" className={styles.input} disabled={loading} required />
        </div>
  {error && <div className={styles.error} role="alert">{error}</div>}
        <button type="submit" className={styles.loginButton} disabled={loading}>
          {loading ? '확인 중...' : '회춘하기'}
        </button>
      </form>
      <div className={styles.links}>
        <button type="button" onClick={() => navigate('/signup')} className={styles.link}>회원가입</button>
        <button type="button" onClick={() => navigate('/find')} className={styles.link}>정보찾기</button>
      </div>
      <div className={styles.socialLogin}>
        <button type="button" className={styles.kakaoButton}>
          <img src={kakaoIcon} alt="Kakao" className={styles.kakaoIcon} />
          카카오톡으로 로그인
        </button>
      </div>
    </div>
  );
}

