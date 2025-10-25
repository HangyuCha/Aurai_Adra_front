// src/pages/loading/LoadingPage.jsx  ← 오류 없는 버전 (catch 변수 제거)
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

const DELAY = 1500;      // 로고 유지 시간
const FADE_MS = 400;     // 페이드아웃 시간
const MAX_WAIT = 3000;   // 이미지 대기 상한(멈춤 방지)

export default function LoadingPage() {
  const navigate = useNavigate();
  const imgRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    let t1, t2;
    let mounted = true;

    const waitForImage = async (img) => {
      try {
        if (!img) return;
        if (img.complete) {
          if (img.decode) await img.decode().catch(() => {});
          return;
        }
        await new Promise((res) => {
          img.addEventListener('load', res, { once: true });
          img.addEventListener('error', res, { once: true });
        });
        if (img.decode) await img.decode().catch(() => {});
      } catch {
        // 이미지 문제는 무시하고 진행
      }
    };

    (async () => {
      // 이미지 대기와 상한 타이머 병렬
      await Promise.race([
        waitForImage(imgRef.current),
        new Promise((res) => setTimeout(res, MAX_WAIT)),
      ]);
      if (!mounted) return;

      setReady(true);
      t1 = setTimeout(() => {
        setFade(true);
        t2 = setTimeout(() => {
          const token = localStorage.getItem('accessToken');
          const to = token ? '/home' : '/start';
          // 디버그 로그(필요시 확인용)
          // console.log('[LOADING NAV]', { hasToken: !!token, to });
          navigate(to, { replace: true });
        }, FADE_MS);
      }, Math.max(200, DELAY));
    })();

    return () => {
      mounted = false;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [navigate]);

  return (
    <div className={`loading-canvas ${ready ? 'is-ready' : ''} ${fade ? 'fade-out' : ''}`}>
      <img ref={imgRef} className="loading-logo" src={logo} alt="앱 로고" />
    </div>
  );
}
