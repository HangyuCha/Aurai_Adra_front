import React, { useRef, useEffect } from 'react';
import styles from './ChatInputBar.module.css';

/**
 * 재사용 채팅 입력 바
 * Props:
 *  - value: string (입력 값)
 *  - placeholder: string
 *  - disabled: boolean (전송 비활성)
 *  - onChange: (val)=>void
 *  - onSubmit: ()=>void (엔터 또는 버튼 클릭)
 *  - sendLabel: 버튼 안 텍스트/아이콘 (default '↑')
 *  - className: 추가 스타일
 */
export default function ChatInputBar({
  value,
  placeholder='메시지를 입력하세요',
  disabled=false,
  onChange,
  onSubmit,
  sendLabel='↑',
  className='',
  offsetBottom=40, // px 단위: 기본 40px 으로 밑땡
  offsetX=0, // +면 오른쪽으로 이동(px)
  readOnly=false,
  onFocus,
  onBlur,
  maxRows = 2,
}){
  const handleSubmit = (e) => {
    e.preventDefault();
    if(disabled) return;
    onSubmit && onSubmit(e);
  };
  const taRef = useRef(null);

  useEffect(()=>{
    const ta = taRef.current;
    if(!ta) return;
    // autosize once on mount/update
    function resize(){
      // keep textarea within maxRows lines by clamping height; keep font-size unchanged
      const cs = window.getComputedStyle(ta);
      const baseFont = ta.dataset.baseFontSize || cs.fontSize;
      if(!ta.dataset.baseFontSize) ta.dataset.baseFontSize = baseFont;
      const baseFontSize = parseFloat(ta.dataset.baseFontSize);
      // ensure using base font size
      ta.style.fontSize = baseFontSize + 'px';
      const lineH = parseFloat(cs.lineHeight) || (baseFontSize * 1.2) || 20;
      const maxH = lineH * Math.max(1, Number(maxRows) || 1);
      ta.style.height = 'auto';
      const sh = ta.scrollHeight || lineH;
      // clamp height to maxH and set overflow accordingly
      const finalH = Math.min(Math.max(lineH, sh), maxH);
      ta.style.height = finalH + 'px';
      const isOverflowing = (ta.scrollHeight > maxH);
      ta.style.overflow = isOverflowing ? 'auto' : 'hidden';
      // if overflowing, keep view scrolled to bottom so last line is visible
      if(isOverflowing){
        ta.scrollTop = ta.scrollHeight;
      }
    }
    resize();
    // resize on input
    ta.addEventListener('input', resize);
    return ()=> ta.removeEventListener('input', resize);
  },[value, maxRows]);

  function handleKeyDown(e){
    // Enter inserts newline; Ctrl/Cmd+Enter triggers submit
    if(e.key === 'Enter' && (e.ctrlKey || e.metaKey)){
      e.preventDefault();
      if(disabled) return;
      onSubmit && onSubmit(e);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${styles.chatInputBar} ${className}`.trim()}
      style={{bottom: offsetBottom, transform:`translateX(calc(-50% + ${offsetX}px))`}}
    >
      <textarea
        ref={taRef}
        className={styles.chatInputField}
        value={value}
        placeholder={placeholder}
        onChange={e=>onChange && onChange(e.target.value)}
        readOnly={readOnly}
        onFocus={onFocus}
        onBlur={onBlur}
        rows={1}
        onKeyDown={handleKeyDown}
      />
      <button type="submit" className={styles.chatSendBtn} disabled={disabled} aria-label="메시지 보내기">{sendLabel}</button>
    </form>
  );
}
