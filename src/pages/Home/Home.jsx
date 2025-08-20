import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import logo from '../../assets/logo.png';
import messageIcon from '../../assets/message.png'; // 문자
import phoneIcon from '../../assets/phone.png'; // 전화
import cameraIcon from '../../assets/camera.png'; // 카메라
import gptIcon from '../../assets/gpt.png'; // GPT
import kakaoIcon from '../../assets/kakao.png'; // 카카오톡
import prepareIcon from '../../assets/prepare.png'; // 준비중

// 아이콘 공통 Wrapper (variant에 따라 스타일 분기)
function AppIcon({ variant, label, onClick }) {
  const renderSvg = () => {
    switch (variant) {
      case 'message':
        return <img src={messageIcon} alt="문자" className={styles.iconImg} />;
      case 'phone':
        return <img src={phoneIcon} alt="전화" className={styles.iconImg} />;
      case 'camera':
        return <img src={cameraIcon} alt="카메라" className={styles.iconImg} />;
      case 'kakao':
        return <img src={kakaoIcon} alt="카카오톡" className={styles.iconImg} />;
      case 'gpt':
        return <img src={gptIcon} alt="GPT" className={styles.iconImg} />;
      case 'prepare':
      default:
        return <img src={prepareIcon} alt="준비중" className={styles.iconImg} />;
    }
  };

  const imageVariants = ['message','phone','camera','kakao','gpt','prepare'];
  const showBg = !imageVariants.includes(variant);
  return (
    <div className={styles.homeIconWrapper}>
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className={`${styles.homeIcon} ${styles[variant] || ''}`}
      >
        {showBg && <div className={styles.iconBg} />}
        {renderSvg()}
      </button>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className={styles.homePage}>
      <div className={styles.homeHero}>
        <div className={styles.heroLogo} aria-label="앱 로고">
          <img src={logo} alt="앱 로고" className={styles.heroLogoImg} />
        </div>
      </div>

      <div className={styles.homeGrid}>
        <div className={styles.homeGridRow}>
          <div className={styles.appCard}>
            <AppIcon variant="message" label="문자" />
            <div className={styles.appLabel}>문자</div>
          </div>
          <div className={styles.appCard}>
            <AppIcon variant="phone" label="전화" onClick={() => navigate('/study-start')} />
            <div className={styles.appLabel}>전화</div>
          </div>
          <div className={styles.appCard}>
            <AppIcon variant="camera" label="카메라" />
            <div className={styles.appLabel}>카메라</div>
          </div>
        </div>
        <div className={styles.homeGridRow}>
          <div className={styles.appCard}>
            <AppIcon variant="gpt" label="GPT" />
            <div className={styles.appLabel}>GPT</div>
          </div>
            <div className={styles.appCard}>
            <AppIcon variant="kakao" label="카카오톡" />
            <div className={styles.appLabel}>카카오톡</div>
          </div>
          <div className={styles.appCard}>
            <AppIcon variant="prepare" label="준비중" />
            <div className={styles.appLabel}>준비중</div>
          </div>
        </div>
      </div>

      <div className={styles.dock}>
  {['message','phone','camera','kakao','gpt'].map(key => (
          <div key={key} className={`${styles.dockItem} ${styles[`dock_${key}`] || ''}`} />
        ))}
      </div>
    </div>
  );
}
