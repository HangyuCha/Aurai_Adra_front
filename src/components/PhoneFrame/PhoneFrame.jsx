import React from 'react';
import styles from './PhoneFrame.module.css';
// 외부 SVG 파일 로드 실패 시를 대비해 inline SVG 사용 (파일 없어도 표시)

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
  // 선택적으로 동영상 소스를 넘기면 이미지 대신 동영상을 렌더링합니다.
  videoSrc,
  videoPoster,
  showStatusBar = true,
  showHomeIndicator = true,
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
      <div className={styles.outerBezel}>
        {/* 좌측 볼륨 버튼 (+/-) */}
        <div className={styles.volumeButtons} aria-hidden>
          <span className={styles.sideBtn} />
          <span className={styles.sideBtn} />
        </div>
        {/* 우측 전원 버튼 */}
        <div className={styles.powerButton} aria-hidden>
          <span className={styles.sideBtn} />
        </div>
        <div className={styles.bezel}>
        <div className={styles.screen}>
          {showStatusBar && (
            <div className={styles.statusBar} aria-hidden>
              <div className={styles.notchBar} aria-hidden />
              <span className={styles.time}>9:41</span>
              <div className={styles.statusIcons}>
                {/* 인라인 벡터: 자산 누락/경로 문제라도 항상 렌더 */}
                <svg className={styles.statusImg} viewBox="0 0 24 16" aria-hidden="true"><g fill="#111"><rect x="2" y="12" width="3" height="3" rx="0.5"/><rect x="7" y="9" width="3" height="6" rx="0.5"/><rect x="12" y="6" width="3" height="9" rx="0.5"/><rect x="17" y="3" width="3" height="12" rx="0.5"/></g></svg>
                <svg className={styles.statusImg} viewBox="0 0 24 16" aria-hidden="true"><g fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6.5c2.5-2 6-3.2 9-3.2s6.5 1.2 9 3.2"/><path d="M6 9.5c1.9-1.4 4.1-2.1 6-2.1s4.1.7 6 2.1"/><path d="M9 12.2c1-.7 2.1-1.1 3-1.1s2 .4 3 1.1"/><circle cx="12" cy="14" r="1.2" fill="#111" stroke="none"/></g></svg>
                <svg className={styles.statusImg} viewBox="0 0 26 16" aria-hidden="true"><rect x="1" y="3" width="20" height="10" rx="2" ry="2" fill="none" stroke="#111" strokeWidth="1.8"/><rect x="3.5" y="5.5" width="11" height="5" rx="1" ry="1" fill="#111"/><rect x="21.5" y="6" width="3" height="6" rx="1" ry="1" fill="#111" stroke="#111" strokeWidth="1"/></svg>
              </div>
            </div>
          )}
          <div className={styles.contentBox}>
            {videoSrc ? (
              <video
                src={videoSrc}
                poster={videoPoster || image}
                className={styles.screenshot}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img src={image} alt="휴대폰 화면" className={styles.screenshot} />
            )}
            {/* 오버레이 영역 (이미지 위) */}
            {children && <div className={styles.overlay}>{children}</div>}
          </div>
          {/* 하단에도 상태바 높이만큼 간격(스페이서) - 이미지 영역 밖 */}
          {showStatusBar && <div className={styles.bottomBar} aria-hidden />}
          {showHomeIndicator && (
            <div className={styles.homeIndicator} aria-hidden />
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
