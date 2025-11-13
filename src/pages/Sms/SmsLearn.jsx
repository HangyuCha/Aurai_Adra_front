import React, { useEffect, useState } from 'react';
import styles from './Sms.module.css';
import BackButton from '../../components/BackButton/BackButton';
import smsTopics from './SmsTopics.js';
import TopicCarousel from '../../components/TopicCarousel/TopicCarousel';
import { getSessionProgress, buildCompletionMapFromSessions } from '../../lib/appProgressApi';
import { useNavigate } from 'react-router-dom';

export default function SmsLearn() {
  const navigate = useNavigate();
  const [completions, setCompletions] = useState({});
  useEffect(() => {
    async function load(){
      try{
        const keys = ['msend','mphoto','mdelete','mdeliver','msearch'];
        const m = {};
        for(const k of keys){
          const v = localStorage.getItem(`sms_${k}_learnDone`);
          m[k] = v === 'true';
        }
        // Merge server completions (if available) so multi-device shows correctly
        try{
          const server = await getSessionProgress('sms');
          const srvMap = buildCompletionMapFromSessions(server || {});
          for(const k of keys){ if(srvMap[k]) m[k] = true; }
        } catch { /* ignore network */ }
        setCompletions(m);
      } catch { /* ignore */ }
    }
    load();
    const onFocus = () => load();
    const onStorage = () => load();
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener('focus', onFocus); window.removeEventListener('storage', onStorage); };
  }, []);
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
  <TopicCarousel topics={smsTopics} onSelect={handleSelect} completions={completions} />
    </div>
  );
}
