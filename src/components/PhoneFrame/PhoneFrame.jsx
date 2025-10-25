import React from 'react';
import styles from './PhoneFrame.module.css';

/**
 * PhoneFrame
 * - 안정적인 스마트폰 베젤 + 화면 비율(세로) 유지 컴포넌트
 * - 내부 화면(screen) 영역에 스크린샷 이미지를 채우고, 자식 요소를 오버레이로 배치 가능
 * Props:
 *  - width: CSS width 값(string). 예: '360px' 또는 'clamp(320px,40vw,420px)'
 *  - image: 스크린샷 이미지 경로
 *  - showStatusBar: 상단 상태바 표시 여부 (기본 true)
 *  - children: 화면 위 오버레이 요소(ChatInputBar 등)
 */
export default function PhoneFrame({
  // 화면(스크린) 목표 너비. 기본은 고정값으로 사용 (전역 고정 정책)
  screenWidth = '278px',
  // 화면 비율. 예: '391 / 629'
  aspect = '9 / 19.5',
  image,
  showStatusBar = true,
  children,
  // 전체 프레임과 내부 화면을 동일 비율로 축소/확대 (1이 기본)
  scale = 1,
}){
  // CSS 변수로 전달하여 프레임 내부 레이아웃이 일관되게 따르도록 함
  // Enforce fixed widths via CSS variable so consumers cannot pass fluid values that
  // make the phone resize with the viewport. Small-screen breakpoints are handled
  // in the component CSS (media queries) to allow a smaller fixed size on mobile.
  // If a consumer explicitly passes a fixed px value, allow it; otherwise prefer the global fixed width.
  const fixedWidth = (typeof screenWidth === 'string' && screenWidth.trim().endsWith('px')) ? screenWidth.trim() : '400px';
  const styleVars = {
    '--screen-width': fixedWidth,
    '--screen-aspect': aspect,
    '--scale': scale,
  };
  return (
    <div className={styles.phone} style={styleVars}>
      <div className={styles.bezel}>
        <div className={styles.screen}>
          {showStatusBar && (
            <div className={styles.statusBar} aria-hidden>
              <span className={styles.time}>9:41</span>
              <div className={styles.statusIcons}>
                <span className={styles.signal}/>
                <span className={styles.wifi}/>
                <span className={styles.battery}/>
              </div>
            </div>
          )}
          <div className={styles.contentBox}>
            <img src={image} alt="휴대폰 화면" className={styles.screenshot} />
            {/* 오버레이 영역 (이미지 위) */}
            {children && <div className={styles.overlay}>{children}</div>}
          </div>
          <div className={styles.notch} aria-hidden />
          {/* 하단에도 상태바 높이만큼 간격(스페이서) - 이미지 영역 밖 */}
          {showStatusBar && <div className={styles.bottomBar} aria-hidden />}
        </div>
      </div>
    </div>
  );
}
