import React from 'react';
import styles from './Gpt.module.css';
import BackButton from '../../components/BackButton/BackButton';
import gptTopics from './GptTopics.js';

export default function GptLearn() {
  const handleSelect = (opt) => { console.log('GPT learn select:', opt.key); };
  return (
    <div className={styles.gptPage}>
      <BackButton variant="fixed" to="/home" />
      <header className={styles.gptHead}>
        <h1 className={styles.gptTitle}>GPT 배우기</h1>
        <p className={styles.gptDesc}>AI 도구를 올바르고 유용하게 활용하기 위한 기초 내용을 살펴보세요.</p>
      </header>
      <ul className={styles.optionsGrid}>
  {gptTopics.map(opt => (
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
