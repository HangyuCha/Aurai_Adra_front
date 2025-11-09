import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Kakao.module.css';
import BackButton from '../../components/BackButton/BackButton';
import TopicCarousel from '../../components/TopicCarousel/TopicCarousel';
import kakaoTopics from './KakaoTopics.js';

export default function KakaoLearn() {
  const navigate = useNavigate();
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
      <TopicCarousel topics={kakaoTopics} onSelect={handleSelect} completions={{ ui:true, friend:false, room:false, media:false }} />
    </div>
  );
}
