import React from 'react';
import styles from './Sms.module.css';
import BackButton from '../../components/BackButton/BackButton';
import smsTopics from './SmsTopics.js';
// import { useNavigate } from 'react-router-dom';

export default function SmsPractice() {
  // const navigate = useNavigate(); // 추후 상세 연습 페이지 이동
  const handleSelect = (opt) => {
    console.log('Practice select:', opt.key);
  };
  return (
    <div className={styles.smsPage}>
      <BackButton variant="fixed" to="/home" />
      <header className={styles.smsHead}>
  <h1 className={`${styles.smsTitle} ${styles.practiceTitle}`}>문자 연습하기</h1>
        <p className={styles.smsDesc}>실전 상황을 가정한 5가지 연습 유형으로 직접 문장을 만들어 보세요.</p>
      </header>
      <ul className={styles.optionsGrid}>
  {smsTopics.map(opt => (
          <li key={opt.key} className={styles.optionItem}>
            <button type="button" className={styles.optionBtn} onClick={() => handleSelect(opt)} aria-label={`${opt.title} 연습 시작`}>
              <span className={styles.optionTitle}>{opt.title}</span>
              <span className={styles.optionText}>{opt.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
