import React, { useEffect, useState, useMemo } from 'react';
import styles from './Gpt.module.css';
import pa from '../../styles/practiceTitle.module.css';
import BackButton from '../../components/BackButton/BackButton';
import TopicCarousel from '../../components/TopicCarousel/TopicCarousel';
import gptTopics from './GptTopics.js';
import { useNavigate } from 'react-router-dom';

export default function GptPractice() {
  const navigate = useNavigate();
  const handleSelect = (opt) => { navigate(`/gpt/practice/${opt.key}`); };
  // practice에서는 'what' 토픽 제외
  const practiceTopics = useMemo(() => gptTopics.filter(t => t.key !== 'what'), []);

  // 연습 점수 로드 (ask, photo, apply 등 동적). localStorage 변경(storage 이벤트) 시 갱신.
  const [scoresMap, setScoresMap] = useState({});
  useEffect(() => {
    function loadScores(){
      const next = {};
      practiceTopics.forEach(t => {
        try {
          const raw = localStorage.getItem(`practiceScore:gpt:${t.key}`);
          if(raw){
            const parsed = JSON.parse(raw);
            let v = null;
            if(parsed && typeof parsed.total === 'number') v = parsed.total;
            else if(typeof parsed === 'number') v = parsed;
            next[t.key] = v;
          }
        } catch { /* ignore single key */ }
      });
      setScoresMap(next);
    }
    loadScores();
    window.addEventListener('storage', loadScores);
    return () => window.removeEventListener('storage', loadScores);
  }, [practiceTopics]);
  const scoresArr = useMemo(() => (
    practiceTopics.map(t => {
      const v = scoresMap[t.key];
      return (typeof v === 'number') ? v : null;
    })
  ), [scoresMap, practiceTopics]);
  return (
    <div className={styles.gptPage}>
      <BackButton variant="fixed" to="/home" />
      <header className={styles.gptHead}>
  <h1 className={`${styles.gptTitle} ${styles.practiceTitle} ${pa.practiceAccent}`}><span className="titleText">GPT 연습하기</span></h1>
        <p className={styles.gptDesc}>실제 활용 시나리오를 가정하고 다양한 프롬프트를 시도해 보세요.</p>
      </header>
  <div className={styles.contentArea}>
    <TopicCarousel topics={practiceTopics} onSelect={handleSelect} variant="practice" scores={scoresArr} />
  </div>
    </div>
  );
}
