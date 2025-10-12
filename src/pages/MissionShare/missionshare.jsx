import React, { useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
// import 경로의 대소문자 주의 (파일명은 소문자)
import styles from './missionshare.module.css';
import RankList from '../../components/RankList/RankList';
import TopicCarousel from '../../components/TopicCarousel/TopicCarousel';
import BackButton from '../../components/BackButton/BackButton';
// 좌측에 표시할 캐릭터 이미지는 추후 실제 PNG로 교체 예정
import characterPlaceholder from '../../assets/40F.png';
// 아이콘 이미지 (src/assets)
import phoneTrophy from '../../assets/phone_trophy.png';
import messageTrophy from '../../assets/message_trophy.png';
import gptTrophy from '../../assets/gpt_trophy.png';
import kakaoTrophy from '../../assets/kakao_trophy.png';
import trophyPlaceholder from '../../assets/trophy.png';

export default function MissionShare() {
  const [modalOpen, setModalOpen] = useState(false);
  const captureRef = useRef(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // 데이터 모델: 4개의 앱, 각 앱은 5개의 과제. 모두 완료 시 트로피 획득
  // 실제 연동 시에는 API 또는 상위 상태에서 주입받도록 교체 가능
  const appsProgress = useMemo(() => {
    // localStorage 또는 서버 데이터가 없다면 예시 데이터 사용
    const saved = localStorage.getItem('appsProgress');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [
      { id: 'call',    name: '전화',    color: '#59A3FF', tasksCompleted: 5, totalTasks: 5, trophyDate: '2025-10-01T10:00:00Z' },
      { id: 'sms',     name: '문자',    color: '#60d56a', tasksCompleted: 5, totalTasks: 5, trophyDate: '2025-10-03T09:00:00Z' },
      { id: 'kakao',   name: '카카오',  color: '#f4b400', tasksCompleted: 2, totalTasks: 5, trophyDate: null },
      { id: 'gpt',     name: 'GPT',    color: '#a66bff', tasksCompleted: 0, totalTasks: 5, trophyDate: null },
    ];
  }, []);

  const trophies = useMemo(() => appsProgress.map(app => ({
    ...app,
    earned: app.tasksCompleted >= app.totalTasks,
  })), [appsProgress]);

  const ranking = useMemo(() => {
    const earned = trophies.filter(t => t.earned && t.trophyDate);
    earned.sort((a, b) => new Date(a.trophyDate) - new Date(b.trophyDate));
    return earned.map((t, idx) => ({ rank: idx + 1, ...t }));
  }, [trophies]);


  const handleCapture = async () => {
    if (!captureRef.current) return;
    const canvas = await html2canvas(captureRef.current, { backgroundColor: null, useCORS: true, scale: 2 });
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mission-share.png';
    link.click();
  };

  // TopicCarousel은 내부적으로 활성 인덱스를 계산하지만, 여기서 페이지 표시를 위해 간단히 onSelect 시점에 동기화
  const onSelectTopic = (t) => {
    const i = trophies.findIndex(x => x.id === t.key);
    if (i >= 0) setCarouselIndex(i);
  };

  return (
    <div className={styles.wrap}>
      <div ref={captureRef} className={styles.captureArea}>
        <BackButton variant="fixed" to="/home" />
        <div className={styles.grid}>
          {/* 좌측 캐릭터 */}
          <aside className={styles.leftPane} aria-label="캐릭터">
            <div className={styles.characterBox}>
              <img className={styles.characterImg} src={characterPlaceholder} alt="캐릭터" />
              <div className={styles.characterCaption}>배움 나이: 40대</div>
            </div>
          </aside>
          {/* 우측: 상단 트로피, 하단 랭킹 */}
          <main className={styles.rightPane}>
            {/* 트로피 슬라이더 */}
            <section className={styles.trophySection} aria-label="나의 트로피">
              <h3 className={styles.sectionTitle}>나의 트로피</h3>
          <TopicCarousel
            topics={trophies.map(t => ({ key: t.id, title: t.name, text: '' }))}
            onSelect={onSelectTopic}
            plain
            onIndexChange={setCarouselIndex}
            cardWidthPercent="86%"
            itemMaxWidth="760px"
            compact
            renderItem={({ topic }) => {
              const t = trophies.find(x => x.id === topic.key);
              let iconSrc = trophyPlaceholder;
              if (t?.earned) {
                if (t.id === 'call') iconSrc = phoneTrophy;
                else if (t.id === 'sms') iconSrc = messageTrophy;
                else if (t.id === 'gpt') iconSrc = gptTrophy;
                else if (t.id === 'kakao') iconSrc = kakaoTrophy;
              }
              return (
                <div className={styles.squareCard} role="group" aria-label={`${t?.name} 트로피`}>
                  <div className={styles.squareImgBox}>
                    <img className={styles.squareImg} src={iconSrc} alt="" aria-hidden="true" />
                  </div>
                  <div className={styles.squareLabel}>{t?.name}</div>
                </div>
              );
            }}
          />
          <div className={styles.pager} aria-live="polite">{carouselIndex + 1} / {trophies.length}</div>
            </section>
            {/* 랭킹 타임라인 */}
            <section className={styles.rankSection} aria-label="획득 랭킹">
              <h3 className={styles.sectionTitle}>획득 랭킹</h3>
              {ranking.length > 0 ? (
                <RankList items={ranking} />
              ) : (
                <div className={styles.emptyBox}>
                  아직 획득한 트로피가 없어요. 도전해서 자랑해 보세요!
                </div>
              )}
            </section>
          </main>
        </div>

        <button className={styles.shareBtn} onClick={() => setModalOpen(true)}>
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