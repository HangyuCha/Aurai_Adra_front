import React, { useEffect, useState } from 'react';
import styles from './Call.module.css';
import pa from '../../styles/practiceTitle.module.css';
import BackButton from '../../components/BackButton/BackButton';
import TopicCarousel from '../../components/TopicCarousel/TopicCarousel';
import callTopics from './CallTopics.js';
import { useNavigate } from 'react-router-dom';
import { getPracticeScores, mapScoresToTopics } from '../../lib/practiceScoresApi';

export default function CallPractice() {
  const navigate = useNavigate();
  const handleSelect = (opt) => {
    navigate(`/call/practice/${opt.key}`);
  };
  // Direct navigation routes exist for calling, save, fix so map keys accordingly
  // Build scores from localStorage like SmsPractice: null for unattempted
  const [scores, setScores] = useState(() => callTopics.map(t => {
    try {
      const raw = localStorage.getItem(`practiceScore:call:${t.key}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed == null) return null;
      if (typeof parsed === 'number') return Math.max(0, Math.min(100, parsed));
      if (typeof parsed === 'object' && parsed.total != null) return Math.max(0, Math.min(100, Number(parsed.total) || 0));
      return null;
    } catch { return null; }
  }));

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const server = await getPracticeScores('call');
        if (!mounted || !server) return;
        // map first 4 topics to chapters 6..9 (CALL range 6..10)
        const serverArr = mapScoresToTopics('call', callTopics, server);
        setScores(prev => serverArr.map((sv, i) => (sv != null ? sv : (prev?.[i] ?? null))));
      } catch {
        // ignore network/auth errors
      }
    })();
    const onFocus = () => {
      setScores(callTopics.map(t => {
        try {
          const raw = localStorage.getItem(`practiceScore:call:${t.key}`);
          if (!raw) return null;
          const parsed = JSON.parse(raw);
          if (parsed == null) return null;
          if (typeof parsed === 'number') return Math.max(0, Math.min(100, parsed));
          if (typeof parsed === 'object' && parsed.total != null) return Math.max(0, Math.min(100, Number(parsed.total) || 0));
          return null;
        } catch { return null; }
      }));
    };
    window.addEventListener('focus', onFocus);
    return () => { mounted = false; window.removeEventListener('focus', onFocus); };
  }, []);
  return (
    <div className={styles.callPage}>
      <BackButton variant="fixed" to="/home" />
      <header className={styles.callHead}>
    <h1 className={`${styles.callTitle} ${styles.practiceTitle} ${pa.practiceAccent}`}><span className="titleText">전화 연습하기</span></h1>
        <p className={styles.callDesc}>자주 겪는 통화 상황을 연습하며 자연스러운 표현을 익혀요.</p>
      </header>
  <div className={styles.contentArea}>
    <TopicCarousel topics={callTopics} onSelect={handleSelect} variant="practice" scores={scores} />
  </div>
    </div>
  );
}
