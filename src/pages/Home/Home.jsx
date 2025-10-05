import React, { useEffect, useState } from 'react';
import styles from './Home.module.css';
import messageIcon from '../../assets/message.png';
import phoneIcon from '../../assets/phone.png';
import gptIcon from '../../assets/gpt.png';
import kakaoIcon from '../../assets/kakao.png';

// 아이콘 데이터 (현재는 이동 비활성화)
const icons = [
  { name: '문자', icon: messageIcon },
  { name: '전화', icon: phoneIcon },
  { name: 'GPT', icon: gptIcon },
  { name: '카카오톡', icon: kakaoIcon },
];

// 아이콘 컴포넌트
function AppIcon({ name, icon, index, start }) {
  return (
    <div
      className={[
        styles.appItem,
        start ? styles.appear : '',
      ].join(' ')}
      style={start ? { '--delay': `${index * 70}ms` } : undefined}
      /* 클릭 동작 비활성 (향후 기능 연결 예정) */
    >
      <div className={styles.iconWrapper}>
        <img src={icon} alt={name} className={styles.icon} />
      </div>
      <span className={styles.appName}>{name}</span>
    </div>
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
      <div className={styles.iconGrid} data-animate={mounted || undefined}>
        {icons.map((item, i) => (
          <AppIcon key={item.name} index={i} start={mounted} {...item} />
        ))}
      </div>
    </div>
  );
}
