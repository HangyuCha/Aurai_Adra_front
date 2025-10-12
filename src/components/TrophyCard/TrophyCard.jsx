import React from 'react';
import styles from './TrophyCard.module.css';

export default function TrophyCard({ appName, earned, iconSrc, big = false }) {
  return (
    <div className={`${styles.card} ${big ? styles.big : ''}`} data-earned={earned ? 'true' : 'false'}>
      <div className={`${styles.iconWrap} ${styles.iconWrapPlain}`} style={{ background: 'transparent' }}>
        {iconSrc ? (
          <img className={styles.appIcon} src={iconSrc} alt="" aria-hidden="true" />
        ) : (
          // 폴백: 트로피 아이콘
          <svg className={styles.trophy} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M16 10h32v6c0 8.8-7.2 16-16 16S16 24.8 16 16v-6z" fill="#fff"/>
            <path d="M22 32h20v6c0 5.5-4.5 10-10 10s-10-4.5-10-10v-6z" fill="#fff" opacity=".9"/>
            <rect x="26" y="44" width="12" height="6" rx="2" fill="#fff"/>
            <rect x="22" y="52" width="20" height="6" rx="2" fill="#fff"/>
            <path d="M16 12H8c0 8 6 12 12 12v-6c-2 0-4-2-4-6zM48 12h8c0 8-6 12-12 12v-6c2 0 4-2 4-6z" fill="#fff"/>
          </svg>
        )}
      </div>
      <div className={styles.meta}>
        <div className={styles.appName}>{appName}</div>
        {/* 미획득 상태만 안내 문구 노출 */}
        {!earned && (
          <div className={styles.status} data-earned="false">진행 중 · 미획득</div>
        )}
      </div>
    </div>
  );
}
