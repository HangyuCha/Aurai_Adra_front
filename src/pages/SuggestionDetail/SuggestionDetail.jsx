import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './suggestionDetail.module.css';
import { getSuggestion, updateSuggestion, deleteSuggestion } from '../../lib/suggestions.js';

export default function SuggestionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const nickname = localStorage.getItem('nickname') || '익명';
  const isOwner = data && data.author === nickname;

  useEffect(() => {
    const s = getSuggestion(id);
    if (!s) {
      alert('존재하지 않는 글입니다.');
      navigate('/suggestion', { replace: true });
    } else {
      setData(s);
      setTitle(s.title);
      setContent(s.content);
    }
  }, [id, navigate]);

  const onEditToggle = () => {
    if (!isOwner) return;
    if (editing) {
      if (!title.trim() || !content.trim()) {
        alert('제목과 내용을 입력해 주세요.');
        return;
      }
      const updated = updateSuggestion(id, { title: title.trim(), content: content.trim() });
      setData(updated);
    }
    setEditing(e => !e);
  };

  const onDelete = () => {
    if (!isOwner) return;
    if (window.confirm('정말 삭제하시겠습니까?')) {
      deleteSuggestion(id);
      goList();
    }
  };

  const goList = () => {
    // 히스토리에 목록이 바로 직전이면 뒤로가기, 아니면 직접 이동
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/suggestion');
    }
  };

  if (!data) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.outerBox}>
        <div className={styles.innerBox}>
          <div className={styles.head}>
            <h1 className={styles.pageTitle}>건의사항</h1>
            <div className={styles.actions}>
              {isOwner ? (
                <>
                  <button type="button" className={styles.secondary} onClick={onEditToggle}>
                    {editing ? '저장' : '수정'}
                  </button>
                  <button type="button" className={styles.secondary} onClick={onDelete}>삭제</button>
                </>
              ) : (
                <button type="button" className={styles.primary} onClick={goList}>돌아가기</button>
              )}
            </div>
          </div>
          <div className={styles.meta}>작성자: {data.author}</div>
          <label className={styles.lbl} htmlFor="sugTitle">제목</label>
          <input
            id="sugTitle"
            className={styles.input}
            disabled={!editing}
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <label className={styles.lbl} htmlFor="sugContent">내용</label>
          <textarea
            id="sugContent"
            className={styles.textarea}
            disabled={!editing}
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={18}
          />
          <div className={styles.bottomRow}>
            <button type="button" className={styles.backList} onClick={goList}>목록</button>
          </div>
        </div>
      </div>
    </div>
  );
}
