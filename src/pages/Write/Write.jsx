import React, { useState } from 'react';
import styles from './write.module.css';
import { useNavigate } from 'react-router-dom';
import { addSuggestion } from '../../lib/suggestions.js';

export default function WritePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: API 연동
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해 주세요.');
      return;
    }
  const author = localStorage.getItem('nickname') || '익명';
  const item = addSuggestion({ title, content, author });
  navigate(`/suggestion/${item.id}`);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.outerBox}>
        <form className={styles.innerBox} onSubmit={onSubmit}>
          <div className={styles.formHead}>
            <h1 className={styles.title}>건의사항 작성</h1>
            <div className={styles.actions}>
              <button type="button" className={styles.secondary} onClick={() => navigate(-1)}>돌아가기</button>
              <button type="submit" className={styles.primary}>저장</button>
            </div>
          </div>
          <label className={styles.lbl} htmlFor="suggestTitle">제목</label>
          <input
            id="suggestTitle"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            maxLength={100}
          />
          <label className={styles.lbl} htmlFor="suggestContent">내용</label>
            <textarea
              id="suggestContent"
              className={styles.textarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="건의 내용을 입력하세요"
              rows={16}
            />
        </form>
      </div>
    </div>
  );
}