// src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/logo.png';

export default function LoginPage() {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({ nickname: '', password: '' });

  const validate = () => {
    const next = { nickname: '', password: '' };
    let ok = true;

    if (!nickname.trim()) {
      next.nickname = '별칭을 입력해 주세요.';
      ok = false;
    }
    if (!password || password.length < 4) {
      next.password = '비밀번호는 4자 이상 입력해 주세요.';
      ok = false;
    }
    setErrors(next);
    return ok;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // 백엔드 로그인 API 호출
      const response = await axios.post('http://localhost:8080/api/users/login', {
        nickname: nickname.trim(),
        password: password,
      });

      console.log('로그인 성공:', response.data);
      alert('로그인에 성공했습니다!');

      // 백엔드에서 받은 토큰을 localStorage에 저장
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('nickname', nickname.trim());

  // 로딩 스플래시를 다시 보지 않도록 플래그 설정
  sessionStorage.setItem('sawLoading', '1');
  // 로그인 성공 시 바로 홈으로 이동
  navigate('/home', { replace: true });

    } catch (error) {
      console.error('로그인 실패:', error.response.data);
      alert('로그인 실패: ' + (error.response?.data?.accessToken || '알 수 없는 오류'));
    }
  };

  return (
    <main className="page">
      <section className="card" aria-labelledby="app-title">
        <div className="avatar-wrap">
          <img className="avatar" src={logo} alt="ADRA 로고" />
        </div>

        <h1 id="app-title" className="title">아드라</h1>

        <form onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="nickname">별칭</label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              placeholder="예: 한규님"
              autoComplete="nickname"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <p className="error" data-for="nickname">{errors.nickname}</p>
          </div>

          <div className="field">
            <label htmlFor="password">비밀번호</label>
            <div className="input-with-action">
              <input
                id="password"
                name="password"
                type={showPw ? 'text' : 'password'}
                placeholder="비밀번호"
                autoComplete="current-password"
                required
                minLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="ghost-btn"
                aria-label="비밀번호 표시 전환"
                onClick={() => setShowPw((v) => !v)}
              >
                {showPw ? '숨기기' : '보기'}
              </button>
            </div>
            <p className="error" data-for="password">{errors.password}</p>
          </div>

          <button type="submit" className="primary-btn">회춘하기</button>
        </form>

        <nav className="links" aria-label="보조 링크">
          <Link className="link" to="/signup" id="signup-link">회원가입</Link>
          <Link className="link" to="/find" id="find-link">정보찾기</Link>
        </nav>
      </section>
    </main>
  );
}