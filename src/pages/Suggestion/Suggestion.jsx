import React from 'react';
import styles from './suggestion.module.css';
import { useNavigate } from 'react-router-dom';

export default function SuggestionPage() {
  const navigate = useNavigate();
  const items = Array.from({ length: 8 });
  return (
    <div className={styles.wrap}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>건의사항</h1>
        <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>돌아가기</button>
      </div>
      <div className={styles.panel}>
        <ul className={styles.list} aria-label="건의 목록">
          {items.map((_, i) => (
            <li key={i} className={styles.item} />
          ))}
        </ul>
        <div className={styles.writeRow}>
          <button type="button" className={styles.writeBtn} onClick={() => navigate('/suggestion/write')}>글쓰기</button>
        </div>
      </div>
    </div>
  );
}