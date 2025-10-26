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
  return (
    <div className={styles.smsPage}>
      <BackButton variant="fixed" to="/home" />
      <header className={styles.smsHead}>
  <h1 className={`${styles.smsTitle} ${styles.practiceTitle} ${pa.practiceAccent}`}><span className="titleText">문자 연습하기</span></h1>
        <p className={styles.smsDesc}>문자 배우기에서 배웠던 내용을 스스로 해결해보세요! </p>
      </header>
  <div className={styles.contentArea}>
    <TopicCarousel topics={smsTopics} onSelect={handleSelect} variant="practice" scores={[72, 0, 100, 45, 0]} />
  </div>
    </div>
  );
}
