import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Kakao.module.css';
import BackButton from '../../components/BackButton/BackButton';
import TopicCarousel from '../../components/TopicCarousel/TopicCarousel';
import { getSessionProgress, buildCompletionMapFromSessions } from '../../lib/appProgressApi';
import kakaoTopics from './KakaoTopics.js';

export default function KakaoLearn() {
  const navigate = useNavigate();
  const [completions, setCompletions] = useState({});
  useEffect(() => {
    async function load(){
      try{
        const keys = ['ui','addById','addByPhone','media','inviteRoom','leaveGroup'];
        const m = {};
        for(const k of keys){ m[k] = localStorage.getItem(`kakao_${k}_learnDone`) === 'true'; }
        try{
          const server = await getSessionProgress('kakao');
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
  // map new topic keys to the existing lesson route keys
  const keyMap = {
    // reserve (setting) removed
    emoji: 'ui',
    addById: 'friend',
    addByPhone: 'friend/num',
    bundleMedia: 'media',
    inviteRoom: 'room',
    leaveGroup: 'room'
  };
  const handleSelect = (opt) => {
    if(!opt || !opt.key) return;
    const target = keyMap[opt.key] || opt.key || 'ui';
    navigate(`/kakao/learn/${target}`);
  };

  return (
    <div className={styles.kakaoPage}>
      <BackButton variant="fixed" to="/home" />
      <header className={styles.kakaoHead}>
        <h1 className={styles.kakaoTitle}>카카오톡 배우기</h1>
        <p className={styles.kakaoDesc}>카카오톡의 기본 화면과 주요 기능을 차근차근 익혀보세요.</p>
      </header>
      <TopicCarousel topics={kakaoTopics} onSelect={handleSelect} completions={completions} />
    </div>
  );
}
