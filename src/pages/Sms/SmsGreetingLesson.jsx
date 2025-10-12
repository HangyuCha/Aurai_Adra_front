import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import frameStyles from './SmsLessonFrame.module.css';
import ChatInputBar from '../../components/ChatInputBar/ChatInputBar';
import screenshot from '../../assets/test1.png';
import stepsConfig from './SmsGreetingLessonSteps.js';

// 단순 프레임: 업로드된 스크린샷(test1.png)을 '디바이스' 모양 틀 안에 담아 보여줌
// 향후: 단계 안내 / 음성 읽기 / 힌트 패널 등을 아래 캡션 영역에 확장 예정

export default function SmsGreetingLesson(){
  const navigate = useNavigate();
  const [step,setStep] = useState(1);
  const steps = stepsConfig;
  const total = steps.length;
  const shellRef = useRef(null);
  const shellAreaRef = useRef(null); // device column (for vertical space)
  const [isSide,setIsSide] = useState(false);
  const captionRef = useRef(null);
  const headerRef = useRef(null);
  const [scale,setScale] = useState(1);
  const [deviceWidth,setDeviceWidth] = useState(null); // side 모드에서 실제 width 축소 적용
  // '더 크게 보기' 기능 제거: 확대 모드 상태 삭제
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [speaking,setSpeaking] = useState(false);
  const [autoPlayed,setAutoPlayed] = useState(false); // 현재 단계 자동 재생 여부
  const [voices,setVoices] = useState([]); // 가용 음성 목록 (Web Speech)
  const [showHelp,setShowHelp] = useState(false); // 모바일 도움말 모달
  const current = steps.find(st => st.id === step) || steps[0];
  const canSubmit = step === total && answer.trim().length > 0;

  const speakCurrent = () => {
    if(!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const base = current.instruction || (Array.isArray(current.speak) ? current.speak.join(' ') : current.speak);
    if(!base) return;
    const u = new SpeechSynthesisUtterance(base);
    u.lang = 'ko-KR';
    u.rate = 1;
    // 설정된 음성 preference 적용
    try {
      const pref = (localStorage.getItem('voice') || 'female');
      const v = pickPreferredVoice(pref, voices);
      if(v) u.voice = v;
    } catch { /* ignore */ }
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };

  const onSubmitAnswer = (e) => {
    e.preventDefault();
    if(!canSubmit) return;
    const lower = answer.toLowerCase();
    const expects = current.expect || [];
    const hit = expects.some(k => lower.includes(k));
    setFeedback(hit ? '좋아요! 자연스러운 마무리 인사입니다.' : '핵심 어조가 조금 더 다정하면 좋아요. 예: 수고해, 조심히 와.');
  };

  // (포커스 하이라이트 제거됨)

  // 단계 변경 시 입력/피드백 리셋
  useEffect(()=>{ 
    setAnswer(''); setFeedback(''); 
    if('speechSynthesis' in window){ window.speechSynthesis.cancel(); setSpeaking(false);} 
    setAutoPlayed(false);
    // 단계 변경 시 자동 1회 재생
    const timer = setTimeout(()=>{
      if('speechSynthesis' in window){
        const base = current.instruction || (Array.isArray(current.speak) ? current.speak.join(' ') : current.speak);
        if(base){
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(base);
          u.lang='ko-KR';
          u.rate=1;
          try {
            const pref = (localStorage.getItem('voice') || 'female');
            const v = pickPreferredVoice(pref, voices);
            if(v) u.voice = v;
          } catch { /* ignore */ }
          u.onend=()=>{ setSpeaking(false); setAutoPlayed(true); };
          u.onerror=()=>{ setSpeaking(false); setAutoPlayed(true); };
          setSpeaking(true);
          window.speechSynthesis.speak(u);
        }
      }
    }, 250); // 약간 지연 후 (레이아웃 안정화)
    return ()=> clearTimeout(timer);
  }, [step, current, voices]);
  // 언마운트 시 음성 중지
  useEffect(()=>()=>{ if('speechSynthesis' in window) window.speechSynthesis.cancel(); }, []);

  // 음성 목록 로딩 (브라우저 비동기 로딩 대응)
  useEffect(()=>{
    if(!('speechSynthesis' in window)) return;
    function loadVoices(){
      const list = window.speechSynthesis.getVoices();
      if(list && list.length){ setVoices(list); }
    }
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return ()=> window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  },[]);

  // 음성 선택 헬퍼 (남/여 구분 휴리스틱)
  function pickPreferredVoice(pref, all){
    if(!all || !all.length) return null;
    const ko = all.filter(v=> (v.lang||'').toLowerCase().startsWith('ko'));
    if(!ko.length) return null;
    const maleKeys = ['male','남','man','boy','seong','min'];
    const femaleKeys = ['female','여','woman','girl','yuna','ara'];
    const wantMale = pref === 'male';
    const keys = wantMale ? maleKeys : femaleKeys;
    const primary = ko.find(v=> keys.some(k=> (v.name||'').toLowerCase().includes(k)) );
    if(primary) return primary;
    // fallback: 첫 번째 한국어 음성 / 마지막
    return ko[ wantMale ? (ko.length>1 ? 1 : 0) : 0 ];
  }

  // 개발 보조: 마우스 위치 퍼센트 표시 (d 키로 토글)
  const [showDev,setShowDev] = useState(false);
  const [devPos,setDevPos] = useState({x:0,y:0});
  useEffect(()=>{
    function key(e){ if(e.key==='d'){ setShowDev(s=>!s); } }
    window.addEventListener('keydown', key);
    return ()=> window.removeEventListener('keydown', key);
  },[]);

  useLayoutEffect(()=>{
    function recalc(){
      // 목표: 화면(뷰포트) 안에서 '기기 전체 + 캡션 + 헤더' 가 잘리지 않도록
      // transform: scale 은 레이아웃 높이를 바꾸지 않으므로 확대(>1) 시 시각적 overflow 발생 가능.
      // 따라서 여기서는 '축소 전용' 으로만 사용 (fit-to-screen). 확대는 width clamp / big 모드로 처리.

      const vw = window.innerWidth;
      const vh = window.innerHeight;
  const headerH = headerRef.current?.offsetHeight || 0;
  const captionH = captionRef.current?.offsetHeight || 0;
  const side = window.innerWidth >= 1100; // 2열 여부
  setIsSide(side);
  const verticalPadding = 84; // 상단 패딩 4px로 축소 반영 (약간 더 줄여 기기 위로 끌어올림)
  const horizontalPadding = 40; // 좌우 패딩 추정
  const availH = Math.max(160, vh - headerH - (side ? 0 : captionH) - verticalPadding);
      // shellArea 에 세로 공간 부여 후 가운데 정렬
      if(shellAreaRef.current){ shellAreaRef.current.style.minHeight = `${availH}px`; }
      const availW = Math.max(200, vw - horizontalPadding);

  if(!shellRef.current) return;
  const el = shellRef.current;
  const prevTransform = el.style.transform;
  el.style.transform = 'none'; // 원본 크기 측정
      const rect = el.getBoundingClientRect();
      const baseW = rect.width || 1;
      const baseH = rect.height || 1;

  const ratioH = availH / baseH; // 높이 기준 허용 배율
  const ratioW = availW / baseW; // (단일열일 때) 너비 기준 허용 배율
  let next = Math.min(1, ratioH, ratioW);

  // 세로 제약이 훨씬 크게 작용하는 상황(세로비율이 가로비율보다 0.07 이상 낮음)에서는 side 모드에서 실제 width 축소 방식으로 전환
  // (이전 로직에서 사용되던 verticalDominant 제거: 가로 대비 세로 제약 판단 불필요)

      // 2열(side)일 때 가로 합산 폭 초과 시 기기만 축소
      if(side && captionRef.current){
        const captionW = captionRef.current.getBoundingClientRect().width;
  const gap = 32; // CSS gap (side layout)
        const required = baseW + gap + captionW;
        const available = vw - horizontalPadding; // 좌우 패딩 제외
        if(required > available){
          const shrink = available / required; // 0~1
            next = Math.min(next, shrink);
        }
      }
      if(!isFinite(next) || next <= 0) next = 1;
      if(next < 0.5) next = 0.5; // 극단적 축소 하한
      const finalScale = Math.abs(next - 1) < 0.002 ? 1 : next;
      setScale(finalScale);
      // side 레이아웃 & 축소 상황에서는 transform 대신 실제 width 줄이기
      if(side && finalScale < 1){
        // baseW 는 기기의 원본 레이아웃 폭. 실제로 width를 줄이고 transform은 제거.
        setDeviceWidth(Math.round(baseW * finalScale));
        el.style.transform = 'none';
      } else {
        setDeviceWidth(null);
        el.style.transform = prevTransform;
      }

      // side 레이아웃 & scale=1 & 전체화면 높이에서도 하단 여전히 가려지는 경우(= baseH > availH)
      if(side && finalScale === 1){
        const rect2 = el.getBoundingClientRect();
        if(rect2.height > availH){
          // fullscreen(브라우저 최대화)일 때만 더 공격적 비율 적용: 높이가 큰데 잘리는 경우 shrink 더 강하게
          const fullscreenLike = (window.innerHeight >= 820);
          const targetRatio = availH / rect2.height;
          let shrink = targetRatio;
          if(fullscreenLike){
            shrink -= 0.035; // 여유 margin 확보용 추가 감소
          }
          if(shrink < 0.99){
            shrink = Math.max(0.55, shrink);
            setDeviceWidth(Math.round(baseW * shrink));
          }
        }
      }
    }
    recalc();
    window.addEventListener('resize', recalc);
    return ()=> window.removeEventListener('resize', recalc);
  },[]);
  const next = () => setStep(s => Math.min(total, s+1));
  const prev = () => setStep(s => Math.max(1, s-1));

  return (
    <div className={frameStyles.framePage}>
      <BackButton to="/sms/learn" variant="fixed" />
      <header className={frameStyles.frameHeader} ref={headerRef}>
        <h1 className={frameStyles.frameTitle}>
          기본 인사 표현
          <span className={frameStyles.inlineTagline}>처음 인사할 때 쓰는 쉬운 문장들을 배워요.</span>
        </h1>
      </header>
      <div className={frameStyles.lessonRow}>
        <div className={frameStyles.deviceCol} ref={shellAreaRef}>
    <div ref={shellRef}
      className={frameStyles.deviceShell}
      style={deviceWidth ? {width:deviceWidth+"px"} : (scale!==1 && !deviceWidth ? {transform:`scale(${scale})`, transformOrigin:'top center'}:undefined)}>
            <div className={frameStyles.deviceInner}>
              {/* 모바일 전용 오버레이 버튼 */}
              <div className={frameStyles.mobileOverlayButtons} aria-hidden={false}>
                <button type="button" className={frameStyles.overlayBtn} onClick={()=> setShowHelp(true)} aria-label="설명 보기">
                  <span className={frameStyles.overlayBtnIcon}>❔</span>
                </button>
                <button type="button" className={frameStyles.overlayBtn} onClick={speakCurrent} aria-label="오디오 재생">
                  <span className={frameStyles.overlayBtnIcon}>🔊</span>
                </button>
              </div>
              <div className={frameStyles.statusStrip}>
                <span className={frameStyles.statusTime}>9:41</span>
                <div className={frameStyles.statusIcons}>
                  <span className={frameStyles.signal} />
                  <span className={frameStyles.wifi} />
                  <span className={frameStyles.battery} />
                </div>
              </div>
              <div className={frameStyles.screenArea}>
                <div 
                  style={{position:'relative',width:'100%'}}
                  onMouseMove={e=>{
                    if(!showDev) return;
                    const imgEl = e.currentTarget.querySelector('img');
                    if(!imgEl) return;
                    const r = imgEl.getBoundingClientRect();
                    const px = ((e.clientX - r.left)/r.width)*100;
                    const py = ((e.clientY - r.top)/r.height)*100;
                    setDevPos({x: px.toFixed(2), y: py.toFixed(2)});
                  }}
                >
                  {showDev && <div className={frameStyles.devCoord}>{devPos.x}% , {devPos.y}% (d toggle)</div>}
                  <img src={screenshot} alt="문자 인사 학습 화면" className={frameStyles.screenshot} />
                  {/* 파란색 깜빡임(포커스 하이라이트) 제거: highlightLayer 렌더 제거 */}
                  {/* 모바일 도움말 모달 */}
                  {showHelp && (
                    <div className={frameStyles.mobileModalBackdrop} role="dialog" aria-modal="true">
                      <div className={frameStyles.mobileModalCard}>
                        <div className={frameStyles.mobileModalHeader}>
                          <h2 className={frameStyles.mobileModalTitle}>{current.title}</h2>
                          <button className={frameStyles.mobileModalClose} aria-label="닫기" onClick={()=> setShowHelp(false)}>✕</button>
                        </div>
                        <div className={frameStyles.mobileModalBody}>{current.instruction}</div>
                      </div>
                    </div>
                  )}
                  {step === total && (
                    <ChatInputBar
                      value={answer}
                      placeholder="마무리 답장을 입력해 보세요"
                      disabled={!canSubmit}
                      onChange={(val)=>{setAnswer(val); setFeedback('');}}
                      onSubmit={onSubmitAnswer}
                      offsetBottom={218} /* 오버레이 배치: 디바이스 화면 안쪽 */
                      offsetX={44} /* 오른쪽으로 44px (40에서 아주 소폭 추가 이동) */
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={frameStyles.sidePanel}>
          <div className={(frameStyles.captionBar) + (deviceWidth ? ' '+frameStyles.captionBarCompact : '')} ref={captionRef} style={isSide ? {width:'auto',maxWidth: deviceWidth ? 380 : 420, marginTop:0}:undefined}>
            <div className={frameStyles.progressHeader}>
              <div className={frameStyles.stepMeta}>
                <span className={frameStyles.stepCount}>{step} / {total}</span>
                <span className={frameStyles.stepTitle}>{current.title}</span>
              </div>
            </div>
            <div className={frameStyles.captionDivider} />
            <button type="button" onClick={speakCurrent} className={frameStyles.listenBtn} aria-label="현재 단계 설명 다시 듣기">🔊 {autoPlayed || speaking ? '다시 듣기' : '듣기'}</button>
            <p className={frameStyles.lessonInstruction}>{current.instruction}</p>
            {/* 피드백 영역: 항상 placeholder 렌더하여 단계 전환 시 버튼 위치 흔들림 방지 */}
            <div
              className={frameStyles.feedback}
              aria-live="polite"
              style={step === total && feedback ? {color: feedback.startsWith('좋아요') ? '#1d8c3f' : '#c34747'}:undefined}
            >{step === total ? feedback : ''}</div>
            <div className={frameStyles.actionRow}>
              <button type="button" onClick={prev} disabled={step===1} className={frameStyles.ghostBtn}>이전</button>
              {step < total ? (
                <button type="button" onClick={next} className={frameStyles.primaryBtn}>다음</button>
              ) : (
                <button type="button" onClick={()=>navigate('/sms/learn')} className={frameStyles.primaryBtn}>완료</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
