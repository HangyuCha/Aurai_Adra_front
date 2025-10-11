import React, { useRef, useState, useEffect, useCallback } from 'react';
import styles from './TopicCarousel.module.css';

/**
 * TopicCarousel
 * - 가로 스크롤 스냅 + 중앙 포커스 확대 + 키보드 네비게이션
 * - props: topics [{key,title,text}], onSelect(topic)
 */
// scores: 선택적 점수 배열 (index 매칭) 또는 객체 { key: score }
// completions: 학습 완료 여부 (배열 boolean 또는 객체 { key: true })
export default function TopicCarousel({ topics = [], onSelect, variant, scores, completions, renderItem, plain, onIndexChange, itemMaxWidth, cardWidthPercent, compact }) {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  useEffect(() => { onIndexChange?.(index); }, [index, onIndexChange]);

  const scrollTo = useCallback((i, behavior = 'smooth') => {
    if (!trackRef.current) return;
    const items = Array.from(trackRef.current.children);
    const target = items[i];
    if (!target) return;
    target.scrollIntoView({ behavior, inline: 'center', block: 'nearest' });
    setIndex(i);
  }, []);

  const prev = () => scrollTo(Math.max(0, index - 1));
  const next = () => scrollTo(Math.min(topics.length - 1, index + 1));

  // wheel (shift 없이 세로 스크롤을 가로로 변환)
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 0.9;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // scroll -> active index 계산
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let rAF;
    const calc = () => {
      const { left, width } = el.getBoundingClientRect();
      const center = left + width / 2;
      const children = Array.from(el.children);
      let closest = 0; let min = Infinity;
      children.forEach((c, i) => {
        const cr = c.getBoundingClientRect();
        const dist = Math.abs(cr.left + cr.width / 2 - center);
        if (dist < min) { min = dist; closest = i; }
      });
      setIndex(closest);
    };
    const onScroll = () => { cancelAnimationFrame(rAF); rAF = requestAnimationFrame(calc); };
    el.addEventListener('scroll', onScroll);
    calc();
    return () => { el.removeEventListener('scroll', onScroll); cancelAnimationFrame(rAF); };
  }, []);

  // 키보드
  const onKey = (e) => {
    if (e.key === 'ArrowRight') { next(); }
    else if (e.key === 'ArrowLeft') { prev(); }
    else if (e.key === 'Enter') { onSelect?.(topics[index]); }
  };

  const rootClassBase = variant === 'practice' ? `${styles.carousel} ${styles.practice}` : styles.carousel;
  const rootClass = compact ? `${rootClassBase} ${styles.compact}` : rootClassBase;

  return (
    <div className={rootClass} onKeyDown={onKey} tabIndex={0} aria-roledescription="carousel" aria-label="학습 주제 선택">
  <button type="button" className={`${styles.navBtn} ${styles.navPrev}`} onClick={prev} aria-label="이전 주제" disabled={index === 0}>◀</button>
      <div className={styles.trackWrapper}>
        <div
          ref={trackRef}
          className={styles.track}
          style={cardWidthPercent ? { ['--card-width']: cardWidthPercent } : undefined}
        >
          {topics.map((t, i) => {
            let scoreValue = undefined;
            if (scores) {
              if (Array.isArray(scores)) scoreValue = scores[i];
              else if (typeof scores === 'object') scoreValue = scores[t.key];
            }
            const clamped = typeof scoreValue === 'number' ? Math.max(0, Math.min(100, scoreValue)) : null;
            let completed = false;
            if (variant !== 'practice' && completions) {
              if (Array.isArray(completions)) completed = !!completions[i];
              else if (typeof completions === 'object') completed = !!completions[t.key];
            }
            const itemClass = [styles.item, i === index && styles.active, completed && styles.done]
              .filter(Boolean)
              .join(' ');
            return (
            <div
              key={t.key}
              className={itemClass}
              style={itemMaxWidth ? { maxWidth: itemMaxWidth } : undefined}
            >
              <button
                type="button"
                className={plain ? styles.card + ' ' + styles.cardPlain : styles.card}
                onClick={() => {
                  // 부분만 보여지는 옆 카드 클릭 시 부드럽게 중앙으로 스크롤
                  scrollTo(i);
                  onSelect?.(t);
                }}
                aria-label={`${t.title} 선택`}
              >
                {renderItem ? (
                  renderItem({ topic: t, index: i, active: i === index })
                ) : (
                  <>
                    <h3 className={styles.cardTitle}>{t.title}</h3>
                    <p className={styles.cardText}>{t.text}</p>
                    {variant === 'practice' && clamped !== null && (
                      <div className={styles.scoreArea} aria-label={`점수 ${clamped}점`}>
                        <div className={styles.scoreMeta}>
                          <span className={styles.scoreLabel}>점수</span>
                          <span className={styles.scoreValue}>{clamped}</span>
                          <span className={styles.scoreMax}>/100</span>
                        </div>
                        <div className={styles.scoreBarOuter} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={clamped}>
                          <div className={styles.scoreBarFill} style={{ width: clamped + '%' }} />
                        </div>
                      </div>
                    )}
                    {variant !== 'practice' && (
                      <div className={styles.statusArea} aria-label={completed ? '학습 완료' : '미완료'}>
                        <div className={styles.statusBadge}>
                          {completed ? (
                            <span className={styles.statusCheck} aria-hidden="true">
                              <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.4 11.2 3.2 8l1.12-1.12 2.08 2.08 5.28-5.28L12.8 4.8 6.4 11.2Z" fill="currentColor" />
                              </svg>
                            </span>
                          ) : (
                            <span className={styles.statusDot} aria-hidden="true" />
                          )}
                          {completed ? <span className={styles.statusDoneText}>완료됨</span> : <span className={styles.pendingText}>미완료</span>}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </button>
            </div>
            );
          })}
        </div>
      </div>
  <button type="button" className={`${styles.navBtn} ${styles.navNext}`} onClick={next} aria-label="다음 주제" disabled={index === topics.length - 1}>▶</button>
      <div className={styles.dots} role="tablist" aria-label="주제 인디케이터">
        {topics.map((t,i) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={i===index}
            className={styles.dot + ' ' + (i===index ? styles.dotActive : '')}
            onClick={() => scrollTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
