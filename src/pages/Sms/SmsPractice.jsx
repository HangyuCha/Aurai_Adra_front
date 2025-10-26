import React from 'react';
import styles from './Sms.module.css';
import BackButton from '../../components/BackButton/BackButton';
import smsTopics from './SmsTopics.js';
import TopicCarousel from '../../components/TopicCarousel/TopicCarousel';
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
        <p className={styles.smsDesc}>문자 배우기에서 배웠던 내용을 스스로 해결해보세요! </p>
      </header>
  <div className={styles.contentArea}>
    <TopicCarousel topics={smsTopics} onSelect={handleSelect} variant="practice" scores={[72, 0, 100, 45, 0]} />
  </div>
    </div>
  );
}
