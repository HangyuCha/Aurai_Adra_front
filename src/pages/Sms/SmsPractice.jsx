import React from 'react';
import styles from './Sms.module.css';
import pa from '../../styles/practiceTitle.module.css';
import BackButton from '../../components/BackButton/BackButton';
import smsTopics from './SmsTopics.js';
import TopicCarousel from '../../components/TopicCarousel/TopicCarousel';
import { useNavigate } from 'react-router-dom';

export default function SmsPractice() {
  const navigate = useNavigate();
  const handleSelect = (opt) => {
    navigate(`/sms/practice/${opt.key}`);
  };
  // build scores by reading localStorage per-topic saved score; unattempted => 0
  // return null for unattempted topics so UI can show '미시행'
  const scores = smsTopics.map(t => {
    try {
      const raw = localStorage.getItem(`practiceScore:sms:${t.key}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed == null) return null;
      if (typeof parsed === 'number') return Math.max(0, Math.min(100, parsed));
      if (typeof parsed === 'object' && parsed.total != null) return Math.max(0, Math.min(100, Number(parsed.total) || 0));
      return null;
    } catch {
      return null;
    }
  });

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
