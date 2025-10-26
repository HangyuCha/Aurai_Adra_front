import React from 'react';
import styles from './Sms.module.css';
import BackButton from '../../components/BackButton/BackButton';
import smsTopics from './SmsTopics.js';
import TopicCarousel from '../../components/TopicCarousel/TopicCarousel';
import { useNavigate } from 'react-router-dom';

export default function SmsLearn() {
  const navigate = useNavigate();
  const handleSelect = (opt) => {
    // navigate to the lesson page for the selected topic
    switch(opt.key){
      case 'msend': return navigate('/sms/learn/msend');
      case 'mphoto': return navigate('/sms/learn/mphoto');
      case 'mdelete': return navigate('/sms/learn/mdelete');
      case 'mdeliver': return navigate('/sms/learn/mdeliver');
      case 'msearch': return navigate('/sms/learn/msearch');
      default: console.log('미구현 주제:', opt.key); return;
    }
  };
  return (
    <div className={styles.smsPage}>
      <BackButton variant="fixed" to="/home" />
      <header className={styles.smsHead}>
        <h1 className={styles.smsTitle}>문자 배우기</h1>
        <p className={styles.smsDesc}>문자를 통해 기본 소통을 익힐 수 있는 5가지 학습 주제를 선택해 주세요.</p>
      </header>
  <TopicCarousel topics={smsTopics} onSelect={handleSelect} completions={{ msend:true, mphoto:false, mdelete:false, mdeliver:false, msearch:false }} />
    </div>
  );
}
