import React from 'react';
import styles from './RankList.module.css';

export default function RankList({ items }) {
  return (
    <ol className={styles.list}>
      {items.map(item => (
        <li key={item.id} className={styles.item}>
          <div className={styles.rankBadge}>{item.rank}</div>
          <div className={styles.body}>
            <div className={styles.rowTop}>
              <span className={styles.app} style={{ color: item.color }}>{item.name}</span>
              <span className={styles.date}>{new Date(item.trophyDate).toLocaleString()}</span>
            </div>
            <div className={styles.progress}>트로피 획득</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
