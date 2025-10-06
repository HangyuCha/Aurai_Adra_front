import React from 'react';
import styles from './Kakao.module.css';
import BackButton from '../../components/BackButton/BackButton';
import TopicCarousel from '../../components/TopicCarousel/TopicCarousel';
import kakaoTopics from './KakaoTopics.js';

export default function KakaoLearn() {
  const handleSelect = (opt) => { console.log('Kakao learn select:', opt.key); };
  return (
    <div className={styles.kakaoPage}>
      <BackButton variant="fixed" to="/home" />
      <header className={styles.kakaoHead}>
        <h1 className={styles.kakaoTitle}>카카오톡 배우기</h1>
        <p className={styles.kakaoDesc}>카카오톡의 기본 화면과 주요 기능을 차근차근 익혀보세요.</p>
      </header>
  <TopicCarousel topics={kakaoTopics} onSelect={handleSelect} completions={{ ui:true, friend:false, room:false, media:false, setting:false }} />
    </div>
  );
}
