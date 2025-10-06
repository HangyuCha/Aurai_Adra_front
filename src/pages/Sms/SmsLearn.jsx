import React from 'react';
import styles from './Sms.module.css';
import BackButton from '../../components/BackButton/BackButton';
import smsTopics from './SmsTopics.js';
// import { useNavigate } from 'react-router-dom';

export default function SmsLearn() {
  // const navigate = useNavigate(); // 라우팅 연결 시 사용 예정
  const handleSelect = (opt) => {
    // TODO: 세부 학습 페이지 라우팅 (예: /sms/learn/:key)
    // 임시: 콘솔 + 알림
    console.log('Learn select:', opt.key);
  };
  return (
    <div className={styles.smsPage}>
      <BackButton variant="fixed" to="/home" />
      <header className={styles.smsHead}>
        <h1 className={styles.smsTitle}>문자 배우기</h1>
        <p className={styles.smsDesc}>문자를 통해 기본 소통을 익힐 수 있는 5가지 학습 주제를 선택해 주세요.</p>
      </header>
      <ul className={styles.optionsGrid}>
  {smsTopics.map(opt => (
          <li key={opt.key} className={styles.optionItem}>
            <button type="button" className={styles.optionBtn} onClick={() => handleSelect(opt)} aria-label={`${opt.title} 학습 열기`}>
              <span className={styles.optionTitle}>{opt.title}</span>
              <span className={styles.optionText}>{opt.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
