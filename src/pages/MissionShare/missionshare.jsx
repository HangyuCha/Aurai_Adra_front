import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
// import 경로의 대소문자 주의
import styles from './MissionShare.module.css';

export default function MissionShare() {
  const [modalOpen, setModalOpen] = useState(false);
  const captureRef = useRef(null);

  const handleCapture = async () => {
    if (!captureRef.current) return;
    const canvas = await html2canvas(captureRef.current);
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mission.png';
    link.click();
  };

  return (
    <div className={styles.wrap}>
      <div ref={captureRef} className={styles.captureArea}>
        <div className={styles.title}>미션 자랑하기</div>

        {/* 캡쳐될 콘텐츠 구성 영역 */}
        {/* ...existing code... */}

        <button
          className={styles.shareBtn}
          onClick={() => setModalOpen(true)}
        >
          자랑하기
        </button>
      </div>

      {modalOpen && (
        <div className={styles.modalBg}>
          <div className={styles.modalBox}>
            <div className={styles.modalTitle}>미션 자랑하기</div>
            <button className={styles.captureBtn} onClick={handleCapture}>
              화면 캡쳐 & 저장
            </button>
            <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}