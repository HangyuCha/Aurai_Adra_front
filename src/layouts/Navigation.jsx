import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [nickname, setNickname] = useState('');
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const sync = () => {
      setNickname(localStorage.getItem('nickname') || '');
      setHasToken(!!localStorage.getItem('accessToken'));
    };
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('auth-change', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('auth-change', sync);
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('nickname');
    localStorage.removeItem('age');
    localStorage.removeItem('gender');
    alert('로그아웃 되었습니다.');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login', { replace: true });
  };

  // ✅ 설정과 동일 포맷의 가드
  const goSettings = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('권한이 없습니다.');
      return;
    }
    navigate('/settings');
  };

  // ✅ 나의 정보 가드
  const goMe = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('권한이 없습니다.');
      return;
    }
    navigate('/me');
  };

  return (
    <nav className="navbar">
      <div className="bar">
        {/* 좌측 */}
        <div className="nav-left">
          {/* ⛳ Link → 버튼으로 바꿔서 가드 적용 */}
          <button type="button" onClick={goMe} className="btn-pill font-jua">
            나의 정보
          </button>

          {/* 설정: 로그인 가드 */}
          <button type="button" onClick={goSettings} className="btn-pill font-jua">
            설정
          </button>
        </div>

        {/* 중앙 로고 → 홈 */}
        <Link to={hasToken ? '/home' : '/'} aria-label="홈으로" className="nav-center">
          <div className="nav-logo">
            <img src={logo} alt="아드라" />
          </div>
        </Link>

        {/* 우측 */}
        <div className="nav-right">
          <div className="btn-pill font-jua">
            {hasToken && nickname ? `“${nickname}” 으로 로그인 됨` : '로그인되지 않음'}
          </div>

          {hasToken ? (
            <button onClick={handleLogout} className="btn-pill font-jua">로그아웃</button>
          ) : (
            <button onClick={() => navigate('/login')} className="btn-pill font-jua">로그인</button>
          )}
        </div>
      </div>
    </nav>
  );
}
