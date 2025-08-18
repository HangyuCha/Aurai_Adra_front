// src/pages/loading/LoadingPage.jsx  ← 오류 없는 버전 (catch 변수 제거)
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

const DELAY = 1500;   // 로고 유지 시간
const FADE_MS = 400;  // 페이드아웃 시간

export default function LoadingPage() {
  const navigate = useNavigate();
  const imgRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    let t1, t2;
    let mounted = true;

    const waitForImage = async (img) => {
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
    };

    (async () => {
      await waitForImage(imgRef.current);
      if (!mounted) return;
      setReady(true);
      t1 = setTimeout(() => {
        setFade(true);
        t2 = setTimeout(() => {
          navigate('/login', { replace: true });
        }, FADE_MS);
      }, DELAY);
    })();

    return () => {
      mounted = false;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [navigate]);

  return (
    <main className="loading-page">
      <div className={`loading-canvas ${ready ? 'is-ready' : ''} ${fade ? 'fade-out' : ''}`}>
        <img ref={imgRef} className="loading-logo" src={logo} alt="앱 로고" />
      </div>
    </main>
  );
}
