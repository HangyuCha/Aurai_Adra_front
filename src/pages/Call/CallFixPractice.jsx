import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
import VirtualKeyboard from '../../components/VirtualKeyboard/VirtualKeyboard';
import frameStyles from '../Sms/SmsLessonFrame.module.css';
import lt from '../../styles/learnTitle.module.css';
import { buildCallLessonConfig, topicMeta } from './callDynamicSteps.js';
import { useScoringProgress } from '../../lib/useScoringProgress';
import { ChapterDomain, getChapterId } from '../../lib/chapters';

// 연락처 수정하기 연습 (CallFixLesson 기반, learn 파일 수정 없음)
// 연습은 4단계로 축소: 1) 수정 진입, 2) 이름 편집, 3) 번호 편집, 4) 저장 (탭 시 즉시 채점)
export default function CallFixPractice({ practiceTracker = null, finalizeAndSave = null }) {
  const navigate = useNavigate();
  // 원본 fix 토픽 단계 + 스크린 로드
  const { steps: rawSteps, screens: rawScreens } = useMemo(() => buildCallLessonConfig('fix'), []);

  // 1~4 단계만 사용 (저장 직전까지만 연습)
  const steps = useMemo(() => {
    const s1 = rawSteps.find(s => s.id === 1);
    const s2 = rawSteps.find(s => s.id === 2);
    const s3 = rawSteps.find(s => s.id === 3);
    const s4 = rawSteps.find(s => s.id === 4);
    return [
      s1 ? { ...s1, id: 1 } : { id: 1, title: '연락처 선택', instruction: '수정할 연락처를 선택해 보세요.' },
      s2 ? { ...s2, id: 2 } : { id: 2, title: '이름 편집', instruction: '이름 입력 영역을 눌러 편집해 보세요.' },
      s3 ? { ...s3, id: 3 } : { id: 3, title: '번호 편집', instruction: '전화번호 입력 영역을 눌러 편집해 보세요.' },
      s4 ? { ...s4, id: 4 } : { id: 4, title: '저장', instruction: '저장 버튼을 눌러 변경을 저장해 보세요.' },
    ];
  }, [rawSteps]);

  // 화면 이미지: 첫 4장만 사용
  const screens = useMemo(() => {
    const out = {};
    for (let i = 1; i <= 4; i++) out[i] = rawScreens[i] || rawScreens[1];
    return out;
  }, [rawScreens]);

  const total = steps.length || 4;
  const [step, setStep] = useState(1);
  const current = useMemo(() => steps.find(s => s.id === step) || steps[0] || {}, [steps, step]);

  // Scoring
  const chapterId = getChapterId(ChapterDomain.CALL, 2); // CALL 도메인 세번째 토픽 (연락처 수정)
  const scoringHook = useScoringProgress({ user: null, chapterId, expertTimeSec: 35, stepsRequired: total, shouldSave: () => true });
  const tracker = practiceTracker || scoringHook?.tracker;
  const finalizeSave = finalizeAndSave || scoringHook?.finalizeAndSave;

  // Timer
  const startedAtRef = useRef(null);
  const timerRef = useRef(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  useEffect(() => {
    startedAtRef.current = Date.now();
    setElapsedSec(0);
    timerRef.current = setInterval(() => {
      const start = startedAtRef.current || Date.now();
      setElapsedSec(Math.floor((Date.now() - start) / 1000));
    }, 250);
    try { tracker?.start && tracker.start(); } catch { /* ignore */ }
    return () => { if (timerRef.current) clearInterval(timerRef.current); try { tracker?.end && tracker.end(); } catch { /* ignore */ } };
  }, [tracker]);

  function formatTime(sec){ const m=Math.floor(sec/60).toString().padStart(2,'0'); const s=Math.floor(sec%60).toString().padStart(2,'0'); return `${m}:${s}`; }
  function formatElapsedForResult(e){ if(e==null||Number.isNaN(Number(e))) return '-'; const n=Number(e); if(n>=60){ const mm=Math.floor(n/60).toString().padStart(2,'0'); const ss=Math.floor(n%60).toString().padStart(2,'0'); return `${mm}:${ss}`; } const s=Math.floor(n); const cs=Math.round((n-s)*100).toString().padStart(2,'0'); return `${s}초 ${cs}`; }

  // Hint system
  const [showHint, setShowHint] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const hintKey = 'practiceHintCount:call:fix';
  useEffect(()=>{ try { localStorage.setItem(hintKey,'0'); } catch { /* ignore */ } setHintCount(0); return ()=>{ try { localStorage.removeItem(hintKey); } catch { /* ignore */ } }; }, []);
  function useHint(){ try { const cur = Number(localStorage.getItem(hintKey)||'0')||0; const next = cur+1; localStorage.setItem(hintKey,String(next)); setHintCount(next); } catch { /* ignore */ } setShowHint(true); try { tracker?.markHint && tracker.markHint(); } catch { /* ignore */ } }
  useEffect(()=>{ setShowHint(false); }, [step]);

  // Result & wrong-click
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showWrongPopup, setShowWrongPopup] = useState(false);

  async function finalizePractice(){
    try { tracker?.markCorrect && tracker.markCorrect(step); } catch { /* ignore */ }
    if(step < total){ for(let i=step+1;i<=total;i++){ try { tracker?.markCorrect && tracker.markCorrect(i); } catch { /* ignore */ } } }
    try { tracker?.end && tracker.end(); } catch { /* ignore */ }
    if(finalizeSave){
      try {
        const res = await finalizeSave();
        try { const ms = startedAtRef.current ? (Date.now()-startedAtRef.current) : 0; const sec = Math.round(ms/10)/100; if(res && res.score){ res.score.derived = { ...(res.score.derived||{}), elapsedSec: sec }; } } catch { /* ignore */ }
        setResult(res);
        try { localStorage.setItem('practiceScore:call:fix', JSON.stringify(res?.score ?? null)); } catch { /* ignore */ }
        return;
      } catch { /* ignore */ }
    }
    try { const score = tracker?.scoreNow ? tracker.scoreNow() : null; setResult({ score }); try { localStorage.setItem('practiceScore:call:fix', JSON.stringify(score ?? null)); } catch { /* ignore */ } } catch { setResult(null); }
  }

  function next(){ try { tracker?.markCorrect && tracker.markCorrect(step); } catch { /* ignore */ } setStep(s => Math.min(total, s+1)); }

  // 입력 상태 (step2 이름, step3 번호)
  const [nameValue, setNameValue] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  function handleVKKey(ch){ if(step === 2){ setNameValue(v => v + ch); } else if(step === 3){ setPhoneValue(v => v + ch); } }
  function handleVKBackspace(){ if(step === 2){ setNameValue(v => v.slice(0,-1)); } else if(step === 3){ setPhoneValue(v => v.slice(0,-1)); } }
  function handleVKEnter(){ if(step === 2) setNameValue(v => v + '\n'); if(step === 3) setPhoneValue(v => v + '\n'); }

  // TapHint geometry (CallFixLesson 참조 일부 값 재사용)
  const tapHintConfig = {
    1: { selector: null, x:'50%', y:'16.5%', offsetX:0, offsetY:0, width:'250px', height:'30px', borderRadius:'0%', ariaLabel:'연락처 선택 힌트' },
    2: { selector: null, x:'50%', y:'16.5%', offsetX:0, offsetY:0, width:'250px', height:'30px', borderRadius:'0%', ariaLabel:'이름 입력 영역 힌트' },
    3: { selector: null, x:'90%', y:'5.5%', offsetX:0, offsetY:0, width:'40px', height:'24px', borderRadius:'25%', ariaLabel:'전화번호 입력 영역 힌트' },
    4: { selector: null, x:'91.5%', y:'9.25%', offsetX:0, offsetY:0, width:'38px', height:'24px', borderRadius:'25%', ariaLabel:'저장 버튼 힌트' }
  };

  function renderTapHint(){
    const cfg = tapHintConfig[step];
    if(!cfg) return null;
    const onActivate = step === 4 ? finalizePractice : next;
    return (
      <TapHint
        {...cfg}
        onActivate={onActivate}
        suppressInitial={false}
        invisible={!showHint}
      />
    );
  }

  function renderNameOverlay(){
    if(step !== 2) return null;
    return (
      <div aria-hidden style={{position:'absolute', left:'6%', top:'18%', transform:'none', minWidth:'40px', maxWidth:'88%', whiteSpace:'nowrap', fontSize:'13px', fontWeight:300, color:'#111', textAlign:'left', overflow:'hidden'}}>
        <span>{nameValue}</span>
        <span className="callCursor" aria-hidden="true"></span>
      </div>
    );
  }
  function renderPhoneOverlay(){
    if(step !== 3) return null;
    return (
      <div aria-hidden style={{position:'absolute', left:'37%', top:'36%', transform:'none', minWidth:'40px', maxWidth:'60%', whiteSpace:'nowrap', fontSize:'13px', fontWeight:300, color:'#111', textAlign:'left', overflow:'hidden'}}>
        <span>{phoneValue}</span>
        <span className="callCursor" aria-hidden="true"></span>
      </div>
    );
  }

  // Wrong-click popup (TapHint & VirtualKeyboard 허용)
  function handleDeviceClickCapture(e){
    try {
      const path = e.nativeEvent?.composedPath ? e.nativeEvent.composedPath() : [];
      if(path && path.length){
        for(const node of path){
          if(!node) continue;
          if(node.getAttribute && (node.getAttribute('data-tap-hint') === '1' || (node.getAttribute('aria-label')||'').includes('힌트'))) return;
          if(node.getAttribute && node.getAttribute('data-virtual-keyboard') === '1') return;
        }
      } else {
        const tgt = e.target;
        if(tgt && tgt.closest){
          if(tgt.closest('[data-tap-hint="1"]') || tgt.closest('[aria-label*="힌트"]') || tgt.closest('[data-virtual-keyboard="1"]')) return;
        }
      }
    } catch { /* ignore */ }
    e.stopPropagation(); e.preventDefault();
    try { tracker?.markError && tracker.markError(step); } catch { /* ignore */ }
    setShowWrongPopup(true);
  }

  return (
    <div className={frameStyles.framePage}>
      <BackButton to="/call/practice" variant="fixed" />
      <header className={frameStyles.frameHeader}>
        <h1 className={`${frameStyles.frameTitle} ${lt.withAccent}`}>
          <span className="titleText">{topicMeta.fix.title} 연습</span>
          <span className={frameStyles.inlineTagline}>{current.instruction || topicMeta.fix.tagline}</span>
        </h1>
      </header>
      <div className={frameStyles.lessonRow}>
        <div className={frameStyles.deviceCol} onClickCapture={handleDeviceClickCapture}>
          <PhoneFrame image={screens[step] || screens[1]} screenWidth={'278px'} aspect={'278 / 450'} scale={1}>
            <style>{`
              @keyframes callCursorBlink { 0% { opacity:1; } 49.9% { opacity:1; } 50% { opacity:0; } 100% { opacity:0; } }
              .callCursor { display:inline-block; width:2px; margin-left:2px; height:1.05em; vertical-align:text-bottom; border-radius:1.5px; background:#2980ff; box-shadow:0 0 4px #5aa4ff,0 0 8px rgba(41,128,255,0.65); animation: callCursorBlink 0.9s steps(2, start) infinite; }
            `}</style>
            {renderTapHint()}
            {renderNameOverlay()}
            {renderPhoneOverlay()}
            {(step === 2 || step === 3) && (
              <VirtualKeyboard allowEnglish={false} onKey={handleVKKey} onBackspace={handleVKBackspace} onEnter={handleVKEnter} />
            )}
          </PhoneFrame>
        </div>
        <div className={frameStyles.sidePanel}>
          <div className={frameStyles.captionBar}>
            <div className={frameStyles.progressHeader}>
              <div className={frameStyles.stepMeta}>
                <span className={frameStyles.stepCount}>{step} / {total}</span>
                <span className={frameStyles.stepTitle}>{current.title}</span>
              </div>
            </div>
            <div className={frameStyles.captionDivider} />
            <div style={{ marginTop:8, color:'#666' }}>시간: {formatTime(elapsedSec)}</div>
            <div style={{ marginTop:12, display:'flex', gap:10, alignItems:'center' }}>
              <button className={frameStyles.ghostBtn} onClick={useHint} aria-label="힌트 보기">힌트 보기</button>
              <div style={{ color:'#666' }}>힌트 사용: {hintCount}</div>
            </div>
            <div style={{ marginTop:18, display:'flex', gap:8 }}>
              <button className={frameStyles.ghostBtn} disabled={step===1} onClick={()=> setStep(s=> Math.max(1,s-1))}>이전</button>
              {step < total ? (
                <button className={frameStyles.primaryBtn} onClick={next}>다음</button>
              ) : (
                <button className={frameStyles.primaryBtn} onClick={finalizePractice}>완료</button>
              )}
            </div>
          </div>
        </div>
      </div>
      {showWrongPopup && (
        <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.35)', zIndex:160 }}>
          <div style={{ background:'#fff', padding:18, borderRadius:10, minWidth:240 }}>
            <div style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>틀렸습니다</div>
            <div style={{ marginBottom:14 }}>다시 시도해 보세요.</div>
            <div style={{ textAlign:'right' }}>
              <button className={frameStyles.primaryBtn} onClick={()=> setShowWrongPopup(false)}>확인</button>
            </div>
          </div>
        </div>
      )}
      {result && (
        <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.4)', zIndex:200 }}>
          <div style={{ background:'#fff', padding:22, borderRadius:12, minWidth:320, maxWidth:560 }}>
            <div style={{ display:'flex', alignItems:'center', gap:18 }}>
              <div style={{ flex:'0 0 120px', textAlign:'center' }}>
                <div style={{ fontSize:48, fontWeight:800, color:'#10B981' }}>{result?.score?.total ?? '-'}</div>
                <div style={{ fontSize:14, color:'#666' }}>/ 100</div>
              </div>
              <div style={{ flex:'1 1 auto' }}>
                <h3 style={{ margin:0 }}>연습 결과</h3>
                <div style={{ marginTop:8, display:'flex', gap:8, alignItems:'center' }}>
                  <button type="button" onClick={()=> setShowDetails(s=>!s)} className={frameStyles.ghostBtn} aria-expanded={showDetails} aria-controls="call-fix-result-details" style={{ padding:'6px 10px', fontSize:13 }}>{showDetails ? '세부점수 숨기기' : '세부점수 보기'}</button>
                  <div style={{ color:'#666', fontSize:13 }}>시간: {formatElapsedForResult(result?.score?.derived?.elapsedSec)}</div>
                </div>
              </div>
            </div>
            {showDetails && (
              <div id="call-fix-result-details" style={{ marginTop:14, padding:12, borderRadius:8, background:'#fafafa', border:'1px solid #eee' }}>
                <strong>세부 점수</strong>
                <div style={{ marginTop:8 }}>
                  <div>시간 점수: {result?.score?.breakdown?.timeScore ?? '-'} / 30</div>
                  <div>정확도 점수: {result?.score?.breakdown?.errorScore ?? '-'} / 20</div>
                  <div>성공 점수: {result?.score?.breakdown?.successScore ?? '-'} / 50</div>
                  <div>부분 진행 보너스: {result?.score?.breakdown?.progressBonus ?? '-'} / 10</div>
                  <div>힌트 패널티: {result?.score?.breakdown?.hintPenalty ?? '-'} (힌트당 -5, 최대 감점 -20)</div>
                </div>
              </div>
            )}
            <div style={{ marginTop:16, display:'flex', justifyContent:'flex-end' }}>
              <button className={frameStyles.primaryBtn} onClick={()=> { setResult(null); navigate('/call/practice'); }}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
