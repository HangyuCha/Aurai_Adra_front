import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './suggestionDetail.module.css';
import { getSuggestion, updateSuggestion, deleteSuggestion } from '../../lib/suggestions.js';
import BackButton from '../../components/BackButton/BackButton';

export default function SuggestionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const nickname = localStorage.getItem('nickname') || '익명';
  const isOwner = data && data.author === nickname;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const s = await getSuggestion(id);
        if (!s) {
          alert('존재하지 않는 글입니다.');
          navigate('/suggestion', { replace: true });
          return;
        }
        if (mounted) {
          setData(s);
          setTitle(s.title);
          setContent(s.content);
        }
      } catch (err) {
        console.error('Failed to load suggestion', err);
        alert('건의를 불러오지 못했습니다.');
        navigate('/suggestion', { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id, navigate]);

  const onEditToggle = () => {
    if (!isOwner) return;
    if (editing) {
      if (!title.trim() || !content.trim()) {
        alert('제목과 내용을 입력해 주세요.');
        return;
      }
      (async () => {
        try {
          const updated = await updateSuggestion(id, { title: title.trim(), content: content.trim() });
          setData(updated);
        } catch (err) {
          console.error('Failed to update', err);
          alert('수정에 실패했습니다.');
        }
      })();
    }
    setEditing(e => !e);
  };

  const onDeleteRequest = () => {
    if (!isOwner) return;
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    (async () => {
      try {
        await deleteSuggestion(id);
        setConfirmOpen(false);
        goList();
      } catch (err) {
        console.error('Failed to delete', err);
        alert('삭제에 실패했습니다.');
        setConfirmOpen(false);
      }
    })();
  };

  const cancelDelete = () => setConfirmOpen(false);

  const goList = () => {
    // 언제나 목록 페이지로 직행하여 작성 -> 상세 뒤로가기가 작성 페이지로 가지 않도록 고정
    navigate('/suggestion');
  };

  if (loading) return null;
  if (!data) return null;

  return (
    <div className={styles.wrap}>
  <BackButton variant="fixed" to="/home" />
      <div className={styles.topBar}>
        <h1 className={styles.heading}>건의사항</h1>
      </div>
      <div className={styles.outerBox}>
        <div className={styles.innerBox}>
          <div className={styles.head}>
              <div className={styles.titleRow}>
                {/* 내부 pageTitle 제거, 외부 heading 사용 */}
                <span className={styles.metaInline}>작성자: {data.author}</span>
              </div>
              <div className={styles.actions}>
                <button type="button" className={styles.backList} onClick={goList}>목록</button>
                {isOwner ? (
                  <>
                    <button
                      type="button"
                      className={`${styles.editBtn} ${editing ? styles.editing : ''}`}
                      onClick={onEditToggle}
                    >
                      {editing ? '저장' : '수정'}
                    </button>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={onDeleteRequest}
                    >삭제</button>
                  </>
                ) : (
                  <button type="button" className={styles.primary} onClick={goList}>돌아가기</button>
                )}
              </div>
          </div>
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
            rows={14} /* 작성 페이지와 동일하게 14로 조정 */
          />
          {/* 하단 목록 버튼 제거됨 */}
          {/* 삭제 확인 모달 */}
          {confirmOpen && (
            <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="delTitle">
              <div className={styles.modal}>
                <p id="delTitle" className={styles.modalTitle}>삭제 확인</p>
                <p className={styles.modalMsg}>정말 이 건의를 삭제하시겠습니까?<br/>삭제 후 복구할 수 없습니다.</p>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.btnNo} onClick={cancelDelete}>취소</button>
                  <button type="button" className={styles.btnYes} onClick={confirmDelete}>삭제</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
