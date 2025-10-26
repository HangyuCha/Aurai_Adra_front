import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
import screenshot1 from '../../assets/msend3.png';
import smsTopics from '../Sms/SmsTopics.js';
import callTopics from '../Call/CallTopics.js';
import gptTopics from '../Gpt/GptTopics.js';
import kakaoTopics from '../Kakao/KakaoTopics.js';
import styles from './Practice.module.css';
import pa from '../../styles/practiceTitle.module.css';

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
      {/* Main practice layout: use the msend-style two-column layout for all apps */}

      <main className={styles.practiceMain}>
        <div className={styles.smsPracticeWrap}>
          <div className={styles.smsLeft}>
            <div className={styles.smsTitleBlock}>
              {/* Shared practice accent + large title */}
              <h1 className={`${pa.practiceAccent} ${styles.smsBigTitle}`}><span className="titleText">{current.title}</span></h1>
              <p className={styles.smsSubtitle}>{current.text || '받은 문자를 확인하고 답장을 보내보아요'}</p>
            </div>

            <div className={styles.phoneWrapper}>
              <div className={styles.phoneLarge}>
                <PhoneFrame image={screenshot1} screenWidth={'380px'} aspect={'278 / 450'} scale={1}>
                  <button aria-label="practice-target" className={styles.sendBtnLarge}>
                    전송
                  </button>
                  {showHint && (
                    <TapHint selector={'button[aria-label="practice-target"]'} width={'86px'} height={'44px'} offsetX={0} offsetY={0} borderRadius={'12px'} suppressInitial={true} ariaLabel={'연습 힌트'} />
                  )}
                </PhoneFrame>
              </div>
            </div>
          </div>

          <div className={styles.smsRight}>
            <div className={styles.smsCard}>
              <div className={styles.smsTitle}>{current.title} 연습</div>
              <div className={styles.smsInstruction}>{current.text || '연습 문제를 읽고 화면의 행동을 따라 해보세요.'}</div>
              <div className={styles.smsExampleBubble} style={{marginTop:12}}>예시: {current.example || '안녕하세요, 예약 확정되었나요?'}</div>
              <div style={{marginTop:12, display:'flex', gap:10}}>
                <button className={styles.hintBtn} onClick={useHint} aria-label="힌트 보기">힌트 보기</button>
                <div className={styles.hintCount}>힌트 사용: {hintCount}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
