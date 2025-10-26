import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
import screenshot1 from '../../assets/test1.png';
import smsTopics from '../Sms/SmsTopics.js';
import callTopics from '../Call/CallTopics.js';
import gptTopics from '../Gpt/GptTopics.js';
import kakaoTopics from '../Kakao/KakaoTopics.js';
import styles from './Practice.module.css';

function getTopicsForApp(app){
  switch(app){
    case 'sms': return smsTopics;
    case 'call': return callTopics;
    case 'gpt': return gptTopics;
    case 'kakao': return kakaoTopics;
    default: return [];
  }
}

export default function PracticeLesson(){
  const { topic } = useParams();
  const path = window.location.pathname.split('/');
  const app = path[1] || 'sms';
  const topics = getTopicsForApp(app);
  const current = topics.find(t => t.key === topic) || topics[0] || { key: topic, title: topic, text: '' };

  const [showHint, setShowHint] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const hintTimerRef = useRef(null);

  const storageKey = `practiceHintCount:${app}:${current.key}`;

  useEffect(()=>{
    const v = parseInt(localStorage.getItem(storageKey) || '0', 10);
    setHintCount(Number.isFinite(v)? v : 0);
    return ()=>{ if(hintTimerRef.current) clearTimeout(hintTimerRef.current); };
  }, [storageKey]);

  function useHint(){
    // increment and show TapHint for 3s
    const next = (Number(localStorage.getItem(storageKey) || '0') || 0) + 1;
    localStorage.setItem(storageKey, String(next));
    setHintCount(next);
    setShowHint(true);
    if(hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(()=> setShowHint(false), 3000);
  }

  return (
    <div className={styles.practicePage}>
      <BackButton to={`/${app}/practice`} variant="fixed" />
      <header className={styles.practiceHeader}>
        <h1 className={styles.practiceTitle}>{current.title}</h1>
        <div className={styles.practiceMeta}>
          <span className={styles.practicePrompt}>{current.text || '연습 문제에 도전해보세요.'}</span>
          <button type="button" className={styles.hintBtn} onClick={useHint} aria-label="힌트 보기">힌트</button>
          <div className={styles.hintCount}>힌트 사용: {hintCount}</div>
        </div>
      </header>

      <main className={styles.practiceMain}>
        <div className={styles.deviceCol}>
          <PhoneFrame image={screenshot1} screenWidth={'278px'} aspect={'278 / 450'} scale={1}>
            {/* Render a visible target for TapHint to point to */}
            <button aria-label="practice-target" style={{position:'absolute', right:18, bottom:80, width:52, height:32, borderRadius:8, background:'#60d56a', color:'#fff', border:'none'}}>
              전송
            </button>
            {showHint && (
              <TapHint selector={'button[aria-label="practice-target"]'} width={'60px'} height={'30px'} offsetX={0} offsetY={0} borderRadius={'8px'} suppressInitial={true} ariaLabel={'연습 힌트'} />
            )}
          </PhoneFrame>
        </div>
      </main>
    </div>
  );
}
