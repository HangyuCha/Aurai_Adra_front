import React from 'react';
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
  offsetBottom=40, // px 단위: 기본 40px 위로 띄움
  offsetX=0, // +면 오른쪽으로 이동(px)
}){
  const handleSubmit = (e) => {
    e.preventDefault();
    if(disabled) return;
    onSubmit && onSubmit();
  };
  const isOverlay = Number.isFinite(offsetBottom) && offsetBottom !== 0;
  const baseClass = isOverlay ? styles.chatInputBarAbsolute : styles.chatInputBarSticky;
  return (
    <form
      onSubmit={handleSubmit}
      className={`${baseClass} ${className}`.trim()}
      style={isOverlay ? {bottom: offsetBottom, transform:`translateX(calc(-50% + ${offsetX}px))`} : undefined}
    >
      <input
        className={styles.chatInputField}
        value={value}
        placeholder={placeholder}
        onChange={e=>onChange && onChange(e.target.value)}
      />
      <button type="submit" className={styles.chatSendBtn} disabled={disabled} aria-label="메시지 보내기">{sendLabel}</button>
    </form>
  );
}
