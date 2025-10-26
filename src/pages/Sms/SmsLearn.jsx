import React from 'react';
import styles from './Sms.module.css';
import BackButton from '../../components/BackButton/BackButton';
import smsTopics from './SmsTopics.js';
import TopicCarousel from '../../components/TopicCarousel/TopicCarousel';
import { useNavigate } from 'react-router-dom';

export default function SmsLearn() {
  const navigate = useNavigate();
  const handleSelect = (opt) => {
    if(opt.key === 'msend'){
      navigate('/sms/learn/msend');
    } else {
      // 다른 주제는 향후 확장
      console.log('미구현 주제:', opt.key);
    }
  };
  return (
    <div className={styles.smsPage}>
      <BackButton variant="fixed" to="/home" />
      <header className={styles.smsHead}>
        <h1 className={styles.smsTitle}>문자 배우기</h1>
        <p className={styles.smsDesc}>문자를 통해 기본 소통을 익힐 수 있는 5가지 학습 주제를 선택해 주세요.</p>
      </header>
  <TopicCarousel topics={smsTopics} onSelect={handleSelect} completions={{ msend:true, thanks:false, ask:false, schedule:false, emotion:false }} />
    </div>
  );
}
