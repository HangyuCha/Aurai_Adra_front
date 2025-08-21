import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/logo.png';

export default function Login() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({ nickname: '', password: '' });

  const validate = () => {
    const next = { nickname: '', password: '' };
    let ok = true;
    if (!nickname.trim()) { next.nickname = '별칭을 입력해 주세요.'; ok = false; }
    if (!password || password.length < 4) { next.password = '비밀번호는 4자 이상 입력해 주세요.'; ok = false; }
    setErrors(next);
    return ok;
  };

  const pickUserFields = (data) => {
    if (!data) return { ageRange: '', gender: '', nickname: '' };
    const ageRange = data.ageRange ?? data.user?.ageRange ?? data.profile?.ageRange ?? '';
    const gender   = data.gender   ?? data.user?.gender   ?? data.profile?.gender   ?? '';
    const nn       = data.nickname ?? data.user?.nickname ?? data.profile?.nickname ?? '';
    return { ageRange, gender, nickname: nn };
  };

  const saveAuthToStorage = (accessToken, nn, ageRange, gender) => {
    const fallbackGender = localStorage.getItem('signup_gender') || 'male';
    const finalGender = gender || fallbackGender;

    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (nn) localStorage.setItem('nickname', nn);

    const prevAge = localStorage.getItem('ageRange');
    const prevGen = localStorage.getItem('gender');
    localStorage.setItem('ageRange', ageRange || prevAge || '');
    localStorage.setItem('gender',   finalGender || prevGen || '');

    sessionStorage.setItem('sawLoading', '1');
    window.dispatchEvent(new Event('auth-change'));

    console.log('[LOGIN] stored:', {
      accessToken: !!accessToken,
      nickname: localStorage.getItem('nickname'),
      ageRange: localStorage.getItem('ageRange'),
      gender: localStorage.getItem('gender'),
    });
  };

  const fetchProfileIfNeeded = async (accessToken, current, nicknameForFallback) => {
    if (current.ageRange && current.gender) return current;

    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
    const candidates = [
      { url: 'http://localhost:8080/api/users/me', withAuth: true },
      { url: `http://localhost:8080/api/users/${encodeURIComponent(nicknameForFallback)}`, withAuth: false },
      { url: `http://localhost:8080/api/users/profile?nickname=${encodeURIComponent(nicknameForFallback)}`, withAuth: false },
    ];

    for (const c of candidates) {
      try {
        const res = await axios.get(c.url, c.withAuth ? { headers } : undefined);
        const picked = pickUserFields(res.data);
        if (picked.ageRange || picked.gender) {
          return {
            ageRange: current.ageRange || picked.ageRange,
            gender:   current.gender   || picked.gender,
            nickname: current.nickname || picked.nickname || nicknameForFallback,
          };
        }
      } catch {
        /* 404/401 등은 패스 */
      }
    }

    const fallbackAgeRange = localStorage.getItem('signup_ageRange') || '';
    const fallbackGender   = localStorage.getItem('signup_gender')   || '';
    return {
      ageRange: current.ageRange || fallbackAgeRange,
      gender:   current.gender   || fallbackGender,
      nickname: current.nickname || nicknameForFallback,
    };
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    try {
      const { data } = await axios.post('http://localhost:8080/api/users/login', {
        nickname: nickname.trim(),
        password,
      });

      const accessToken = data?.accessToken;
      let { ageRange, gender, nickname: nnFromRes } = pickUserFields(data);
      const finalNickname = nnFromRes || nickname.trim();

      const filled = await fetchProfileIfNeeded(accessToken, {
        ageRange, gender, nickname: finalNickname,
      }, finalNickname);

      saveAuthToStorage(accessToken, filled.nickname, filled.ageRange, filled.gender);

      alert('로그인에 성공했습니다!');
      navigate('/home', { replace: true });
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || '알 수 없는 오류';
      console.error('로그인 실패:', error);
      alert('로그인 실패: ' + msg);
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
              onChange={(ev) => setNickname(ev.target.value)}
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
                onChange={(ev) => setPassword(ev.target.value)}
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
