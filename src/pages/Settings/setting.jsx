import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import styles from './setting.module.css';

const SIZE_FROM_SLIDER = ['small', 'medium', 'large']; // JS 배열 (as const 제거)

export default function SettingsPage() {
  const navigate = useNavigate();

  // 로그인 가드
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('권한이 없습니다.');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // 글자 크기 (슬라이더 + 버튼)
  const stored = localStorage.getItem('fontSize') || 'medium';
  const initialIndex = Math.max(0, SIZE_FROM_SLIDER.indexOf(stored));
  const [fontSize, setFontSize] = useState(SIZE_FROM_SLIDER[initialIndex]);
  const [slider, setSlider] = useState(initialIndex);

  const applyFontSize = (val) => {
    setFontSize(val);
    localStorage.setItem('fontSize', val);
    // 전역 폰트 스케일 적용 (index.css에 data-font 훅 필요)
    document.documentElement.setAttribute('data-font', val);
  };

  // 새로고침 후에도 보존된 값 적용
  useEffect(() => {
    document.documentElement.setAttribute('data-font', fontSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 마운트 시 1회

  const onSlider = (e) => {
    const idx = Number(e.target.value);
    setSlider(idx);
    applyFontSize(SIZE_FROM_SLIDER[idx]);
  };

  // 목소리 선택 (데모 저장)
  const [voice, setVoice] = useState(localStorage.getItem('voice') || 'male');
  useEffect(() => {
    localStorage.setItem('voice', voice);
  }, [voice]);

  // 비밀번호 변경
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  const canChangePw = useMemo(
    () => newPw.length >= 4 && newPw === confirmPw && currentPw.length > 0,
    [currentPw, newPw, confirmPw]
  );

  const onChangePassword = (e) => {
    e.preventDefault();
    const saved = localStorage.getItem('userPassword');
    if (!saved) return setPwMsg('저장된 비밀번호가 없습니다. 회원가입/로그인 과정에서 비밀번호를 먼저 설정해주세요.');
    if (currentPw !== saved) return setPwMsg('현재 비밀번호가 올바르지 않습니다.');
    if (newPw.length < 4) return setPwMsg('새 비밀번호는 4자 이상이어야 합니다.');
    if (newPw !== confirmPw) return setPwMsg('새 비밀번호가 일치하지 않습니다.');
    localStorage.setItem('userPassword', newPw);
    setPwMsg('비밀번호가 변경되었습니다.');
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
  };

  return (
    <div className={styles.wrap}>
      {/* 재사용 BackButton */}
  <BackButton to="/home" replace />

  <h1 className={styles.title}>설정</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>글자 크기 조정</h2>

        <div className={styles.scaleArea}>
        <span className={styles.scaleLabel}>작게</span>
        <input className={styles.range}
        type="range"
        min="0"
        max="2"
        step="1"
        value={slider}
        onChange={onSlider}
        aria-label="글자 크기 조절"
        />
    <span className={styles.scaleLabel}>크게</span>
    </div>

    {/* ✅ 작게/중간/크게 전부 버튼으로 클릭 가능 */}
    <div className={styles.scaleButtons}>
    <button
      type="button"
      className={`${styles.scaleBtn} ${fontSize === 'small' ? styles.active : ''}`}
      onClick={() => { setSlider(0); applyFontSize('small'); }}
      aria-pressed={fontSize === 'small'}
    >작게</button>

    <button
      type="button"
      className={`${styles.scaleBtn} ${fontSize === 'medium' ? styles.active : ''}`}
      onClick={() => { setSlider(1); applyFontSize('medium'); }}
      aria-pressed={fontSize === 'medium'}
    >중간</button>

    <button
      type="button"
      className={`${styles.scaleBtn} ${fontSize === 'large' ? styles.active : ''}`}
      onClick={() => { setSlider(2); applyFontSize('large'); }}
      aria-pressed={fontSize === 'large'}
    >크게</button>
      </div>
    </section>

      {/* 목소리 변경 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>목소리 변경</h2>
        <div className={styles.voiceRow}>
          <button
            type="button"
            className={`${styles.voiceBtn} ${voice === 'male' ? styles.active : ''}`}
            onClick={() => setVoice('male')}
          >아들</button>
          <button
            type="button"
            className={`${styles.voiceBtn} ${voice === 'female' ? styles.active : ''}`}
            onClick={() => setVoice('female')}
          >딸</button>
        </div>
      </section>

      {/* 비밀번호 바꾸기 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>비밀번호 바꾸기</h2>
        <form className={styles.pwForm} onSubmit={onChangePassword}>
          <label htmlFor="currentPw" className={styles.lbl}>기존 비밀번호</label>
          <input
            id="currentPw" type="password" className={styles.input}
            value={currentPw} onChange={(e) => { setCurrentPw(e.target.value); setPwMsg(''); }}
            placeholder="현재 비밀번호"
          />

          <label htmlFor="newPw" className={styles.lbl}>새로운 비밀번호</label>
          <input
            id="newPw" type="password" className={styles.input}
            value={newPw} onChange={(e) => { setNewPw(e.target.value); setPwMsg(''); }}
            placeholder="새 비밀번호 (4자 이상)"
            minLength={4}
          />

          <label htmlFor="confirmPw" className={styles.lbl}>새로운 비밀번호 확인</label>
          <div className={styles.confirmRow}>
            <input
              id="confirmPw" type="password" className={styles.input}
              value={confirmPw} onChange={(e) => { setConfirmPw(e.target.value); setPwMsg(''); }}
              placeholder="새 비밀번호 확인"
              minLength={4}
            />
            <button type="submit" className={styles.primary} disabled={!canChangePw}>
              확인
            </button>
          </div>

          <p className={styles.error} role="alert">{pwMsg}</p>
        </form>
      </section>

      {/* 건의사항 */}
      <section className={styles.section} style={{ paddingBottom:'32px', marginBottom:'60px' }}>
        <button
          type="button"
          className={styles.ghost}
          style={{ marginTop:'0', marginBottom:'8px' }}
          onClick={() => navigate('/suggestion')}
        >건의사항</button>
      </section>
    </div>
  );
}
