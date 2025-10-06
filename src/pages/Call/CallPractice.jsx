import React from 'react';
import styles from './Call.module.css';
import BackButton from '../../components/BackButton/BackButton';
import callTopics from './CallTopics.js';

export default function CallPractice() {
  const handleSelect = (opt) => {
    console.log('Call practice select:', opt.key);
  };
  return (
    <div className={styles.callPage}>
      <BackButton variant="fixed" to="/home" />
      <header className={styles.callHead}>
  <h1 className={`${styles.callTitle} ${styles.practiceTitle}`}>전화 연습하기</h1>
        <p className={styles.callDesc}>자주 겪는 통화 상황을 연습하며 자연스러운 표현을 익혀요.</p>
      </header>
      <ul className={styles.optionsGrid}>
  {callTopics.map(opt => (
          <li key={opt.key} className={styles.optionItem}>
            <button type="button" className={styles.optionBtn} onClick={() => handleSelect(opt)} aria-label={`${opt.title} 연습`}> 
              <span className={styles.optionTitle}>{opt.title}</span>
              <span className={styles.optionText}>{opt.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
