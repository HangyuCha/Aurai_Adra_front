import React, { useEffect, useState } from 'react';
import styles from './suggestion.module.css';
import { useNavigate } from 'react-router-dom';
import { getSuggestions } from '../../lib/suggestions.js';

export default function SuggestionPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  useEffect(() => {
    setItems(getSuggestions());
  }, []);
  return (
    <div className={styles.wrap}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>건의사항</h1>
        <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>돌아가기</button>
      </div>
      <div className={styles.panel}>
        <ul className={styles.list} aria-label="건의 목록">
          {items.length === 0 && (
            <li className={styles.empty}>등록된 건의가 없습니다.</li>
          )}
          {items.map(item => (
            <li
              key={item.id}
              className={styles.itemBtn}
            >
              <button type="button" onClick={() => navigate(`/suggestion/${item.id}`)} className={styles.itemBtnInner}>
                <span className={styles.itemTitle}>{item.title}</span>
                <span className={styles.itemMeta}>{item.author}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className={styles.writeRow}>
          <button type="button" className={styles.writeBtn} onClick={() => navigate('/suggestion/write')}>글쓰기</button>
        </div>
      </div>
    </div>
  );
}