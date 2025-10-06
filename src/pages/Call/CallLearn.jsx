import React from 'react';
import styles from './Call.module.css';
import BackButton from '../../components/BackButton/BackButton';
import callTopics from './CallTopics.js';

export default function CallLearn() {
  const handleSelect = (opt) => {
    console.log('Call learn select:', opt.key);
  };
  return (
    <div className={styles.callPage}>
      <BackButton variant="fixed" to="/home" />
      <header className={styles.callHead}>
        <h1 className={styles.callTitle}>전화 배우기</h1>
        <p className={styles.callDesc}>전화 사용과 관련한 기본 구성을 먼저 이해해 보세요.</p>
      </header>
      <ul className={styles.optionsGrid}>
  {callTopics.map(opt => (
          <li key={opt.key} className={styles.optionItem}>
            <button type="button" className={styles.optionBtn} onClick={() => handleSelect(opt)} aria-label={`${opt.title} 학습`}> 
              <span className={styles.optionTitle}>{opt.title}</span>
              <span className={styles.optionText}>{opt.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
