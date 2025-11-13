import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Call.module.css';
import BackButton from '../../components/BackButton/BackButton';
import TopicCarousel from '../../components/TopicCarousel/TopicCarousel';
import { getSessionProgress, buildCompletionMapFromSessions } from '../../lib/appProgressApi';
import callTopics from './CallTopics.js';

export default function CallLearn() {
  const navigate = useNavigate();
  const [completions, setCompletions] = useState({});
  useEffect(() => {
    async function load(){
      try{
        const keys = ['calling','save','fix','face'];
        const m = {};
        for(const k of keys){ m[k] = localStorage.getItem(`call_${k}_learnDone`) === 'true'; }
        try{
          const server = await getSessionProgress('call');
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
  <TopicCarousel topics={callTopics} onSelect={handleSelect} completions={completions} />
    </div>
  );
}
