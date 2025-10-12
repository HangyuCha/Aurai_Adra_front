import React, { useState } from 'react';
import styles from './write.module.css';
import { useNavigate } from 'react-router-dom';
import { addSuggestion } from '../../lib/suggestions.js';
import BackButton from '../../components/BackButton/BackButton';

export default function WritePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const nickname = localStorage.getItem('nickname') || '익명';

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: API 연동
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해 주세요.');
      return;
    }
  const author = localStorage.getItem('nickname') || '익명';
  (async () => {
    try {
      const item = await addSuggestion({ title, content, author });
      navigate(`/suggestion/${item.id}`);
    } catch (err) {
      console.error('Failed to create suggestion', err);
      alert('글 작성에 실패했습니다.');
    }
  })();
  };

  return (
    <div className={styles.wrap}>
  <BackButton variant="fixed" to="/home" />
      <div className={styles.topBar}>
        <h1 className={styles.heading}>건의사항</h1>
      </div>
      <div className={styles.outerBox}>
        <form className={styles.innerBox} onSubmit={onSubmit}>
          <div className={styles.head}>
            <div className={styles.titleRow}>
              {/* 작성 페이지에서도 상세와 동일한 작성자 위치 확보로 레이아웃 점프 제거 */}
              <span className={styles.metaInline}>작성자: {nickname}</span>
            </div>
            <div className={styles.actions}>
              {/* 내부 페이지 흐름용 돌아가기: 직전 페이지(목록 혹은 상세)로 */}
              <button type="button" className={styles.secondary} onClick={() => navigate(-1)}>뒤로가기</button>
              <button type="submit" className={styles.primary}>저장</button>
            </div>
          </div>
          {/* 제목 텍스트는 상단 공통 헤더로 이동 */}
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
              rows={14}
            />
        </form>
      </div>
    </div>
  );
}