import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Gpt.module.css';
import BackButton from '../../components/BackButton/BackButton';
import TopicCarousel from '../../components/TopicCarousel/TopicCarousel';
import { getSessionProgress, buildCompletionMapFromSessions } from '../../lib/appProgressApi';
import gptTopics from './GptTopics.js';

export default function GptLearn() {
  const navigate = useNavigate();
  const [completions, setCompletions] = useState({});
  useEffect(() => {
    async function load(){
      try{
        const keys = ['what','ask','photo','apply'];
        const m = {};
        for(const k of keys){ m[k] = localStorage.getItem(`gpt_${k}_learnDone`) === 'true'; }
        try{
          const server = await getSessionProgress('gpt');
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
    // when a topic is selected, open the lesson page for that topic
    if (!opt?.key) return;
    navigate(`/gpt/learn/${opt.key}`);
  };

  return (
    <div className={styles.gptPage}>
      <BackButton variant="fixed" to="/home" />
      <header className={styles.gptHead}>
        <h1 className={styles.gptTitle}>GPT 배우기</h1>
        <p className={styles.gptDesc}>AI 도구를 올바르고 유용하게 활용하기 위한 기초 내용을 살펴보세요.</p>
      </header>
      <TopicCarousel topics={gptTopics} onSelect={handleSelect} completions={completions} />
    </div>
  );
}
