import React from 'react';
import styles from './Kakao.module.css';
import BackButton from '../../components/BackButton/BackButton';
import TopicCarousel from '../../components/TopicCarousel/TopicCarousel';
import kakaoTopics from './KakaoTopics.js';

export default function KakaoPractice() {
  const handleSelect = (opt) => { console.log('Kakao practice select:', opt.key); };
  return (
    <div className={styles.kakaoPage}>
      <BackButton variant="fixed" to="/home" />
      <header className={styles.kakaoHead}>
        <h1 className={`${styles.kakaoTitle} ${styles.practiceTitle}`}>카카오톡 연습하기</h1>
        <p className={styles.kakaoDesc}>실제 채팅 상황을 재현한 시나리오를 통해 자연스럽게 사용할 수 있게 돕습니다.</p>
      </header>
  <TopicCarousel topics={kakaoTopics} onSelect={handleSelect} variant="practice" scores={[10, 0, 0, 50, 90]} />
    </div>
  );
}
