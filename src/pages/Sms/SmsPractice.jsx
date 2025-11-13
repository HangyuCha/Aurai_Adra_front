import React, { useEffect, useState } from 'react';
import styles from './Sms.module.css';
import pa from '../../styles/practiceTitle.module.css';
import BackButton from '../../components/BackButton/BackButton';
import smsTopics from './SmsTopics.js';
import TopicCarousel from '../../components/TopicCarousel/TopicCarousel';
import { useNavigate } from 'react-router-dom';
import { getPracticeScores, mapScoresToTopics } from '../../lib/practiceScoresApi';

export default function SmsPractice() {
  const navigate = useNavigate();
  const handleSelect = (opt) => {
    navigate(`/sms/practice/${opt.key}`);
  };
  const [scores, setScores] = useState(() => smsTopics.map(t => {
    try {
      const raw = localStorage.getItem(`practiceScore:sms:${t.key}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed == null) return null;
      if (typeof parsed === 'number') return Math.max(0, Math.min(100, parsed));
      if (typeof parsed === 'object' && parsed.total != null) return Math.max(0, Math.min(100, Number(parsed.total) || 0));
      return null;
    } catch { return null; }
  }));

  // fetch server-backed scores for cross-device persistence and merge (server is preferred)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const server = await getPracticeScores('sms');
        if (!mounted || !server) return;
        const serverArr = mapScoresToTopics('sms', smsTopics, server);
        // merge: prefer server where available, else keep existing/local
        setScores(prev => serverArr.map((sv, i) => (sv != null ? sv : (prev?.[i] ?? null))));
      } catch {
        // ignore; keep local-only
      }
    })();
    const onFocus = () => {
      // refresh from localStorage when returning from practice page
      setScores(smsTopics.map(t => {
        try {
          const raw = localStorage.getItem(`practiceScore:sms:${t.key}`);
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
    <div className={styles.smsPage}>
      <BackButton variant="fixed" to="/home" />
      <header className={styles.smsHead}>
        <h1 className={`${styles.smsTitle} ${styles.practiceTitle} ${pa.practiceAccent}`}><span className="titleText">문자 연습하기</span></h1>
        <p className={styles.smsDesc}>문자 배우기에서 배웠던 내용을 스스로 해결해보세요! </p>
      </header>
      <div className={styles.contentArea}>
        <TopicCarousel topics={smsTopics} onSelect={handleSelect} variant="practice" scores={scores} />
      </div>
    </div>
  );
}
