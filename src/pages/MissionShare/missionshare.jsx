import React, { useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
// import 경로의 대소문자 주의 (파일명은 소문자)
import styles from './missionshare.module.css';
import RankList from '../../components/RankList/RankList';
import TopicCarousel from '../../components/TopicCarousel/TopicCarousel';
import BackButton from '../../components/BackButton/BackButton';
// 아바타 이미지 맵 (MyInfo와 동일 규칙)
import avatar20M from '../../assets/20M.png';
import avatar20F from '../../assets/20F.png';
import avatar30M from '../../assets/30M.png';
import avatar30F from '../../assets/30F.png';
import avatar40M from '../../assets/40M.png';
import avatar40F from '../../assets/40F.png';
import avatar50M from '../../assets/50M.png';
import avatar50F from '../../assets/50F.png';
import avatar60M from '../../assets/60M.png';
import avatar60F from '../../assets/60F.png';
import avatar70M from '../../assets/70M.png';
import avatar70F from '../../assets/70F.png';
import avatar80M from '../../assets/80M.png';
import avatar80F from '../../assets/80F.png';
import avatarDefault from '../../assets/default.png';
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

  // 유틸: MyInfo와 동일한 규칙으로 파싱
  const parseAgeRange = (ar) => {
    const a = (ar || '').toString().trim();
    if (/^\d{2}대$/.test(a)) return { display: a, band: a.replace('대','') };
    const m = a.match(/^(\d{2})s$/i);
    if (m) return { display: `${m[1]}대`, band: m[1] };
    if (/^\d{2}$/.test(a)) return { display: `${a}대`, band: a };
    return { display: '—', band: '' };
  };
  const parseGender = (gd) => {
    const g = (gd || '').toString().trim().toLowerCase();
    if (['m','male','남','남성','남자'].includes(g)) return 'M';
    if (['f','female','여','여성','여자'].includes(g)) return 'F';
    return '';
  };

  const avatarMap = useMemo(() => ({
    '20M': avatar20M, '20F': avatar20F,
    '30M': avatar30M, '30F': avatar30F,
    '40M': avatar40M, '40F': avatar40F,
    '50M': avatar50M, '50F': avatar50F,
    '60M': avatar60M, '60F': avatar60F,
    '70M': avatar70M, '70F': avatar70F,
    '80M': avatar80M, '80F': avatar80F,
    default: avatarDefault,
  }), []);

  // localStorage에서 배움 나이와 성별 로드 → 학습 아바타 결정
  const { learningAgeDisplay, avatarSrc } = useMemo(() => {
    const laRaw = localStorage.getItem('learningAge') || '';
    const arRaw = localStorage.getItem('ageRange') || localStorage.getItem('age') || localStorage.getItem('signup_ageRange') || '';
    const gdRaw = localStorage.getItem('gender') || localStorage.getItem('signup_gender') || '';

    const la = parseAgeRange(laRaw);
    const age = parseAgeRange(la.band ? la.band : arRaw); // band가 없으면 ageRange로 재파싱
    // 표시 텍스트: learningAge 값이 있으면 그것을, 없으면 나이 표시
    const display = la.display !== '—' ? la.display : age.display;

    // 아바타 키: learningAge의 band 우선, 없으면 ageRange band 사용 (정확 매칭)
    const band = la.band || age.band;
    const gender = parseGender(gdRaw);
    const key = band && gender ? `${band}${gender}` : 'default';
    const src = avatarMap[key] || avatarDefault;
    return { learningAgeDisplay: display, avatarSrc: src };
  }, [avatarMap]);

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
              <img className={styles.characterImg} src={avatarSrc} alt="캐릭터" onError={(e)=>{ e.currentTarget.src = avatarDefault; }} />
              <div className={styles.characterCaption}>배움 나이: {learningAgeDisplay}</div>
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