import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import messageIcon from '../../assets/message.png';
import phoneIcon from '../../assets/phone.png';
import gptIcon from '../../assets/gpt.png';
import kakaoIcon from '../../assets/kakao.png';

// 아이콘 데이터
const icons = [
  { name: '문자', icon: messageIcon, desc: '문자 보내기 기능' },
  { name: '전화', icon: phoneIcon, desc: '전화 걸기 기능' },
  { name: 'GPT', icon: gptIcon, desc: 'AI 대화 기능' },
  { name: '카카오톡', icon: kakaoIcon, desc: '카카오 연동' },
];

// 스타일: Hover 시 '배우기 / 연습하기' 액션 노출 (스타일 A 제거됨)
function AppIconActions({ name, icon, desc, index, start, onAction }) {
  return (
    <li
      className={[
        styles.appItemAlt,
        start ? styles.appear : '',
      ].join(' ')}
      style={start ? { '--delay': `${index * 70}ms` } : undefined}
    >
      <div className={styles.altCard} aria-label={`${name} – ${desc} 기능 선택`}>
        <div className={styles.altFront}>
          <span className={styles.iconWrapperAlt}>
            <img src={icon} alt="" aria-hidden="true" className={styles.icon} />
          </span>
          <span className={styles.appName}>{name}</span>
        </div>
        <div className={styles.altActions} aria-hidden="true">
          <button type="button" className={styles.actionBtn} data-kind="learn" onClick={() => onAction?.('learn', name)}>배우기</button>
          <button type="button" className={styles.actionBtn} data-kind="practice" onClick={() => onAction?.('practice', name)}>연습하기</button>
        </div>
      </div>
    </li>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const handleAction = (mode, appName) => {
    switch (appName) {
      case '문자':
        navigate(mode === 'learn' ? '/sms/learn' : '/sms/practice');
        break;
      case '전화':
        navigate(mode === 'learn' ? '/call/learn' : '/call/practice');
        break;
      case 'GPT':
        navigate(mode === 'learn' ? '/gpt/learn' : '/gpt/practice');
        break;
      case '카카오톡':
        navigate(mode === 'learn' ? '/kakao/learn' : '/kakao/practice');
        break;
      default:
        break;
    }
  };
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);
  return (
    <div className={styles.homeCenter}>
      <section className={styles.homeHero} aria-labelledby="homeTitle">
        <header className={styles.heroHead}>
          <h1 id="homeTitle" className={styles.heroTitle}>무엇을 시작할까요?</h1>
          <p className={styles.heroSub}>배우고 싶은 앱에 손을 올려주세요 !</p>
        </header>
        <ul className={[styles.iconGrid, styles.iconGridAlt].join(' ')} aria-label="기능 목록 (배우기/연습하기 선택)" data-animate={mounted || undefined}>
          {icons.map((item, i) => (
            <AppIconActions key={item.name + '-alt'} index={i} start={mounted} onAction={handleAction} {...item} />
          ))}
        </ul>
      </section>
    </div>
  );
}
