import React, { useEffect, useState } from 'react';
import styles from './suggestion.module.css';
import { useNavigate } from 'react-router-dom';
import { getSuggestions } from '../../lib/suggestions.js';
import BackButton from '../../components/BackButton/BackButton';

export default function SuggestionPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const list = await getSuggestions();
        if (mounted) setItems(list || []);
      } catch (err) {
        console.error('Failed to load suggestions', err);
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);
  return (
    <div className={styles.wrap}>
  <BackButton variant="fixed" />
      <div className={styles.topBar}>
        <h1 className={styles.title}>건의사항</h1>
      </div>
      <div className={styles.panel}>
        <div className={styles.panelInner}>
        <ul className={styles.list} aria-label="건의 목록">
          {loading && <li className={styles.empty}>불러오는 중...</li>}
          {!loading && items.length === 0 && (
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
        </div>
        <div className={styles.writeRowFixed}>
          <button type="button" className={styles.writeBtn} onClick={() => navigate('/suggestion/write')}>글쓰기</button>
        </div>
      </div>
    </div>
  );
}