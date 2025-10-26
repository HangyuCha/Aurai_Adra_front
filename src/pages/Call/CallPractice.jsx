import React from 'react';
import styles from './Call.module.css';
import pa from '../../styles/practiceTitle.module.css';
import BackButton from '../../components/BackButton/BackButton';
import TopicCarousel from '../../components/TopicCarousel/TopicCarousel';
import callTopics from './CallTopics.js';
import { useNavigate } from 'react-router-dom';

export default function CallPractice() {
  const navigate = useNavigate();
  const handleSelect = (opt) => {
    navigate(`/call/practice/${opt.key}`);
  };
  return (
    <div className={styles.callPage}>
      <BackButton variant="fixed" to="/home" />
      <header className={styles.callHead}>
    <h1 className={`${styles.callTitle} ${styles.practiceTitle} ${pa.practiceAccent}`}><span className="titleText">전화 연습하기</span></h1>
        <p className={styles.callDesc}>자주 겪는 통화 상황을 연습하며 자연스러운 표현을 익혀요.</p>
      </header>
  <div className={styles.contentArea}>
    <TopicCarousel topics={callTopics} onSelect={handleSelect} variant="practice" scores={[60, 85, 0, 40, 0]} />
  </div>
    </div>
  );
}
