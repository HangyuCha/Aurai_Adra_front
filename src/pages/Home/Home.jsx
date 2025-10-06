import React, { useEffect, useState } from 'react';
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
function AppIconActions({ name, icon, desc, index, start }) {
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
          <button type="button" className={styles.actionBtn} data-kind="learn">배우기</button>
          <button type="button" className={styles.actionBtn} data-kind="practice">연습하기</button>
        </div>
      </div>
    </li>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);
  return (
    <div className={styles.homeCenter}>
      <section className={styles.homeHero} aria-labelledby="homeTitle">
        <header className={styles.heroHead}>
          <h1 id="homeTitle" className={styles.heroTitle}>무엇을 시작할까요?</h1>
          <p className={styles.heroSub}>곧 사용할 수 있는 기능들이에요. 지금은 구성만 미리 만나보세요.</p>
        </header>
        <ul className={[styles.iconGrid, styles.iconGridAlt].join(' ')} aria-label="기능 목록 (배우기/연습하기 선택)" data-animate={mounted || undefined}>
          {icons.map((item, i) => (
            <AppIconActions key={item.name + '-alt'} index={i} start={mounted} {...item} />
          ))}
        </ul>
      </section>
    </div>
  );
}
