import React from 'react';
import styles from './Gpt.module.css';
import pa from '../../styles/practiceTitle.module.css';
import BackButton from '../../components/BackButton/BackButton';
import TopicCarousel from '../../components/TopicCarousel/TopicCarousel';
import gptTopics from './GptTopics.js';
import { useNavigate } from 'react-router-dom';

export default function GptPractice() {
  const navigate = useNavigate();
  const handleSelect = (opt) => { navigate(`/gpt/practice/${opt.key}`); };
  return (
    <div className={styles.gptPage}>
      <BackButton variant="fixed" to="/home" />
      <header className={styles.gptHead}>
  <h1 className={`${styles.gptTitle} ${styles.practiceTitle} ${pa.practiceAccent}`}><span className="titleText">GPT 연습하기</span></h1>
        <p className={styles.gptDesc}>실제 활용 시나리오를 가정하고 다양한 프롬프트를 시도해 보세요.</p>
      </header>
  <div className={styles.contentArea}>
    <TopicCarousel topics={gptTopics} onSelect={handleSelect} variant="practice" scores={[30, 55, 70, 0]} />
  </div>
    </div>
  );
}
