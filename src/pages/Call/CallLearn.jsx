import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Call.module.css';
import BackButton from '../../components/BackButton/BackButton';
import TopicCarousel from '../../components/TopicCarousel/TopicCarousel';
import callTopics from './CallTopics.js';

export default function CallLearn() {
  const navigate = useNavigate();
  const handleSelect = (opt) => {
    if (!opt || !opt.key) return;
    navigate(`/call/learn/${opt.key}`);
  };
  return (
    <div className={styles.callPage}>
      <BackButton variant="fixed" to="/home" />
      <header className={styles.callHead}>
        <h1 className={styles.callTitle}>전화 배우기</h1>
        <p className={styles.callDesc}>전화 사용과 관련한 기본 구성을 먼저 이해해 보세요.</p>
      </header>
  <TopicCarousel topics={callTopics} onSelect={handleSelect} completions={{ interface:true, etiquette:false, intro:false, hold:false, ending:false }} />
    </div>
  );
}
