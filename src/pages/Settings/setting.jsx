import React, { useEffect, useState } from 'react';
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

  // 비밀번호 변경 로직은 PasswordChangePage로 이동

  return (
    <div className={styles.wrap}>
  <BackButton />
      <div className={styles.inner}>
        <header className={styles.head}>
          <h1 className={styles.title}>설정</h1>
        </header>

        <section className={`${styles.section} ${styles.card}`}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>글자 크기</h2>
          </div>
          <div className={styles.scaleArea}>
            <label className={styles.scaleLabel} htmlFor="fontRange">작게</label>
            <input
              id="fontRange"
              className={styles.range}
              type="range"
              min="0"
              max="2"
              step="1"
              value={slider}
              onChange={onSlider}
              aria-valuemin={0}
              aria-valuemax={2}
              aria-valuenow={slider}
              aria-label="글자 크기 조절"
            />
            <span className={styles.scaleLabel}>크게</span>
          </div>
          <div className={styles.scaleButtons}>
            <button
              type="button"
              className={`${styles.scaleBtn} ${styles.sizeSmall} ${fontSize === 'small' ? styles.active : ''}`}
              onClick={() => { setSlider(0); applyFontSize('small'); }}
              aria-pressed={fontSize === 'small'}
            >작게</button>
            <button
              type="button"
              className={`${styles.scaleBtn} ${styles.sizeMedium} ${fontSize === 'medium' ? styles.active : ''}`}
              onClick={() => { setSlider(1); applyFontSize('medium'); }}
              aria-pressed={fontSize === 'medium'}
            >중간</button>
            <button
              type="button"
              className={`${styles.scaleBtn} ${styles.sizeLarge} ${fontSize === 'large' ? styles.active : ''}`}
              onClick={() => { setSlider(2); applyFontSize('large'); }}
              aria-pressed={fontSize === 'large'}
            >크게</button>
          </div>
        </section>

        <section className={`${styles.section} ${styles.card}`}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>목소리</h2>
          </div>
          <div className={styles.voiceToggle} role="group" aria-label="목소리 선택">
            <button
              type="button"
              className={`${styles.voiceChip} ${voice === 'male' ? styles.active : ''}`}
              onClick={() => setVoice('male')}
              aria-pressed={voice === 'male'}
            >아들</button>
            <button
              type="button"
              className={`${styles.voiceChip} ${voice === 'female' ? styles.active : ''}`}
              onClick={() => setVoice('female')}
              aria-pressed={voice === 'female'}
            >딸</button>
          </div>
        </section>

      </div>
    </div>
  );
}
