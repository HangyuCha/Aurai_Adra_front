import React from 'react';
import styles from './Gpt.module.css';
import BackButton from '../../components/BackButton/BackButton';
import TopicCarousel from '../../components/TopicCarousel/TopicCarousel';
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
  <TopicCarousel topics={gptTopics} onSelect={handleSelect} variant="practice" scores={[30, 55, 70, 0, 0]} />
    </div>
  );
}
