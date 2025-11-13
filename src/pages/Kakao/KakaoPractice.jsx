import React, { useEffect, useState } from 'react';
import styles from './Kakao.module.css';
import pa from '../../styles/practiceTitle.module.css';
import BackButton from '../../components/BackButton/BackButton';
import TopicCarousel from '../../components/TopicCarousel/TopicCarousel';
import kakaoTopics from './KakaoTopics.js';
import { useNavigate } from 'react-router-dom';
import { getPracticeScores, mapScoresToTopics } from '../../lib/practiceScoresApi';

export default function KakaoPractice() {
  const navigate = useNavigate();
  const handleSelect = (opt) => { navigate(`/kakao/practice/${opt.key}`); };
  const [scores, setScores] = useState(() => {
    try {
      return kakaoTopics.map(t => {
        const key = `practiceScore:kakao:${t.key}`;
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        try {
          const parsed = JSON.parse(raw);
          // parsed may be a score object or null
          if (parsed && typeof parsed.total === 'number') return parsed.total;
          // if a bare number was saved as string
          if (typeof parsed === 'number') return parsed;
        } catch {
          // fallback: maybe raw is a plain number string
          const num = Number(raw);
          return Number.isFinite(num) ? num : null;
        }
        return null;
      });
    } catch {
      return kakaoTopics.map(() => null);
    }
  });

  useEffect(() => {
    // when component mounts, refresh from local and then try server for cross-device
    function refreshLocal() {
      setScores(kakaoTopics.map(t => {
        try {
          const raw = localStorage.getItem(`practiceScore:kakao:${t.key}`);
          if (!raw) return null;
          try { const parsed = JSON.parse(raw); if (parsed && typeof parsed.total === 'number') return parsed.total; if (typeof parsed === 'number') return parsed; } catch { const num = Number(raw); return Number.isFinite(num) ? num : null; }
        } catch { return null; }
        return null;
      }));
    }
    refreshLocal();
    let mounted = true;
    (async () => {
      try {
        const server = await getPracticeScores('kakao');
        if (!mounted || !server) return;
        const serverArr = mapScoresToTopics('kakao', kakaoTopics, server);
        setScores(prev => serverArr.map((sv, i) => (sv != null ? sv : (prev?.[i] ?? null))));
      } catch { /* ignore */ }
    })();
    // also refresh when window gains focus (user may complete practice in another tab/window)
    const onFocus = () => refreshLocal();
    window.addEventListener('focus', onFocus);
    // and listen for storage events from other windows
    window.addEventListener('storage', onFocus);
    return () => { mounted = false; window.removeEventListener('focus', onFocus); window.removeEventListener('storage', onFocus); };
  }, []);

  return (
    <div className={styles.kakaoPage}>
      <BackButton variant="fixed" to="/home" />
      <header className={styles.kakaoHead}>
  <h1 className={`${styles.kakaoTitle} ${styles.practiceTitle} ${pa.practiceAccent}`}><span className="titleText">카카오톡 연습하기</span></h1>
        <p className={styles.kakaoDesc}>실제 채팅 상황을 재현한 시나리오를 통해 자연스럽게 사용할 수 있게 돕습니다.</p>
      </header>
  <div className={styles.contentArea}>
    <TopicCarousel topics={kakaoTopics} onSelect={handleSelect} variant="practice" scores={scores} />
  </div>
    </div>
  );
}
