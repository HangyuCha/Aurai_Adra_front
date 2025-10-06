import React from 'react';
import styles from './Gpt.module.css';
import BackButton from '../../components/BackButton/BackButton';
import gptTopics from './GptTopics.js';

export default function GptPractice() {
  const handleSelect = (opt) => { console.log('GPT practice select:', opt.key); };
  return (
    <div className={styles.gptPage}>
      <BackButton variant="fixed" to="/home" />
      <header className={styles.gptHead}>
        <h1 className={`${styles.gptTitle} ${styles.practiceTitle}`}>GPT 연습하기</h1>
        <p className={styles.gptDesc}>실제 활용 시나리오를 가정하고 다양한 프롬프트를 시도해 보세요.</p>
      </header>
      <ul className={styles.optionsGrid}>
  {gptTopics.map(opt => (
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
