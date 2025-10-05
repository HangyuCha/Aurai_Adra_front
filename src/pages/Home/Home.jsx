import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import messageIcon from '../../assets/message.png';
import phoneIcon from '../../assets/phone.png';
import gptIcon from '../../assets/gpt.png';
import kakaoIcon from '../../assets/kakao.png';

// 아이콘 데이터
const icons = [
  { name: '문자', icon: messageIcon, path: '/mission-share' },
  { name: '전화', icon: phoneIcon, path: '/study-start' },
  { name: 'GPT', icon: gptIcon, path: '#' },
  { name: '카카오톡', icon: kakaoIcon, path: '#' },
];

// 아이콘 컴포넌트
function AppIcon({ name, icon, path, index, start }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (path && path !== '#') {
      navigate(path);
    } else {
      // 준비중인 기능 알림 등
      alert('준비 중인 기능입니다.');
    }
  };

  return (
    <div
      className={[
        styles.appItem,
        start ? styles.appear : '',
      ].join(' ')}
      style={start ? { '--delay': `${index * 70}ms` } : undefined}
      onClick={handleClick}
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
