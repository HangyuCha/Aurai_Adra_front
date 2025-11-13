import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import frameStyles from './SmsLessonFrame.module.css';
import lt from '../../styles/learnTitle.module.css';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
import { useScoringProgress } from '../../lib/useScoringProgress';
import { getChapterId, ChapterDomain } from '../../lib/chapters';
import stepsConfig from './SmsMphotoLessonSteps.js';
import mpho1 from '../../assets/mpho1.png';
import mpho2 from '../../assets/mpho2.png';
import mpho3 from '../../assets/mpho3.png';
import mpho4 from '../../assets/mpho4.png';
import mpho5 from '../../assets/mpho5.png';

// Practice variant for 사진 보내기 (mphoto)
// Option C: finalize and show result modal when TapHint is activated at step 4 (of 5)
export default function SmsMphotoPractice({ practiceTracker = null, finalizeAndSave = null }) {
  const navigate = useNavigate();
  const steps = stepsConfig;
  const total = steps.length; // expected 5
  const [step, setStep] = useState(1);
  const current = steps.find(s => s.id === step) || steps[0];

  // scoring setup
  const chapterId = getChapterId(ChapterDomain.SMS, 1); // assume chapter index 1 for mphoto
  const scoringHook = useScoringProgress({ user: null, chapterId, expertTimeSec: 25, stepsRequired: total, shouldSave: () => true });
  const localTracker = scoringHook?.tracker;
  const localFinalize = scoringHook?.finalizeAndSave;
  const tracker = practiceTracker || localTracker;
  const finalizeSave = finalizeAndSave || localFinalize;

  // timer
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
    try { tracker?.start && tracker.start(); } catch (e) { void e; }
    return () => { if (timerRef.current) clearInterval(timerRef.current); try { tracker?.end && tracker.end(); } catch (e) { void e; } };
  }, [tracker]);

  function formatTime(sec){ const m = Math.floor(sec/60).toString().padStart(2,'0'); const s = Math.floor(sec%60).toString().padStart(2,'0'); return `${m}:${s}`; }
  function formatElapsedForResult(elapsed){ if (elapsed == null || Number.isNaN(Number(elapsed))) return '-'; const e = Number(elapsed); if (e <= 0) return '0초 00'; if (e >= 60){ const mm = Math.floor(e/60).toString().padStart(2,'0'); const ss = Math.floor(e%60).toString().padStart(2,'0'); return `${mm}:${ss}`; } const sec = Math.floor(e); const centis = Math.round((e-sec)*100).toString().padStart(2,'0'); return `${sec}초 ${centis}`; }

  // hint system
  const [showHint, setShowHint] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const hintStorageKey = 'practiceHintCount:sms:mphoto';
  useEffect(()=>{ try { localStorage.setItem(hintStorageKey,'0'); } catch(e){ void e; } setHintCount(0); return ()=>{ try { localStorage.removeItem(hintStorageKey); } catch(e){ void e; } }; }, [hintStorageKey]);
  function useHint(){ try { const cur = Number(localStorage.getItem(hintStorageKey)||'0')||0; if(step <= 3){ const next = cur+1; localStorage.setItem(hintStorageKey,String(next)); setHintCount(next); } } catch(e){ void e; } setShowHint(true); try { if(step <= 3) tracker?.markHint && tracker.markHint(); } catch(e){ void e; } }
  useEffect(()=>{ setShowHint(false); }, [step]);

  // result modal
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showWrongPopup, setShowWrongPopup] = useState(false);

  async function finalizePractice(){
    // ensure all remaining steps marked correct to satisfy success scoring if early finalize
    try {
      tracker?.markCorrect && tracker.markCorrect(step);
      if(step < total){ for(let i=step+1;i<=total;i++){ try { tracker?.markCorrect && tracker.markCorrect(i); } catch(e){ void e; } } }
    } catch(e){ void e; }
    try { tracker?.end && tracker.end(); } catch(e){ void e; }
    if(finalizeSave){
      try {
        const res = await finalizeSave();
        try { const ms = startedAtRef.current ? (Date.now() - startedAtRef.current) : 0; const sec = Math.round(ms/10)/100; if(res && res.score){ res.score.derived = { ...(res.score.derived||{}), elapsedSec: sec }; } } catch(e){ void e; }
        setResult(res);
        try { localStorage.setItem('practiceScore:sms:mphoto', JSON.stringify(res?.score ?? null)); } catch(e){ void e; }
        return;
      } catch(e){ void e; }
    }
    // fallback manual score
    try { const score = tracker?.scoreNow ? tracker.scoreNow() : null; setResult({ score }); try { localStorage.setItem('practiceScore:sms:mphoto', JSON.stringify(score ?? null)); } catch(e){ void e; } } catch(e){ void e; setResult(null); }
  }

  // previous dynamic geometry helper removed after switching to explicit marker targets

  function imageFor(step){
    if(step === 1) return mpho1;
    if(step === 2) return mpho2;
    if(step === 3) return mpho3;
    if(step === 4) return mpho4;
    return mpho5;
  }

  // old dynamic hint config no longer used after adding explicit marker targets

  function advance(){ try { tracker?.markCorrect && tracker.markCorrect(step); } catch(e){ void e; } setShowHint(false); setStep(s => Math.min(total, s+1)); }

  return (
    <div className={frameStyles.framePage}>
      <BackButton to="/sms/practice" variant="fixed" />
      <header className={frameStyles.frameHeader}>
        <h1 className={`${frameStyles.frameTitle} ${lt.withAccent}`}>
          <span className="titleText">사진 보내기 연습</span>
          <span className={frameStyles.inlineTagline}>사진 선택 및 전송 흐름을 실전처럼 연습합니다.</span>
        </h1>
      </header>
      <div className={frameStyles.lessonRow}>
        <div
          className={frameStyles.deviceCol}
          onClickCapture={(e)=>{
            // allow TapHint elements only
            try {
              const path = e.nativeEvent?.composedPath ? e.nativeEvent.composedPath() : [];
              if(path && path.length){
                for(const node of path){
                  if(!node || !node.getAttribute) continue;
                  const al = node.getAttribute('aria-label')||'';
                  if(al.includes('힌트')) return; // allow hint
                }
              } else {
                const tgt = e.target;
                if(tgt && tgt.closest && tgt.closest('[aria-label*="힌트"]')) return;
              }
            } catch(e){ void e; }
            e.stopPropagation(); e.preventDefault();
            try { tracker?.markError && tracker.markError(step); } catch(e){ void e; }
            setShowWrongPopup(true);
          }}
        >
          <PhoneFrame image={imageFor(step)} screenWidth={'278px'} aspect={'278 / 450'} scale={1}>
            {/* TapHint geometry aligned to learn version (SmsMphotoLesson.jsx).
                We reproduce the same width/height/offsetX/offsetY mapping used there:
                step1: width 279px height 59px offsetX 0 offsetY 212
                step2: width 30px height 30px offsetX -113 offsetY -64
                step3: width 90px height 75px offsetX 90 offsetY 47
                step4: width 23px height 23px offsetX 113 offsetY 96.5 (finalize)
                step5: no hint.
                The lesson used a selector pointing to an absent button; we mimic its behavior by omitting selector so fallback positioning applies.
                Center base (50%,50%) then offsets replicate previous positioning. */}
            {step < 5 && (
              <TapHint
                /* No selector: use fallback center + offsets exactly like learn file effectively did */
                x={'50%'}
                y={'80%'}
                width={step === 1 ? '279px' : step === 2 ? '30px' : step === 3 ? '90px' : '23px'}
                height={step === 1 ? '59px' : step === 2 ? '30px' : step === 3 ? '75px' : '23px'}
                offsetX={step === 1 ? 0 : step === 2 ? -113 : step === 3 ? 90 : 113}
                offsetY={step === 1 ? 212 : step === 2 ? -64 : step === 3 ? 47 : 96.5}
                borderRadius={'10px'}
                onActivate={step === 4 ? finalizePractice : advance}
                suppressInitial={false}
                invisible={!showHint}
                ariaLabel={'전송 버튼 힌트'}
              />
            )}
            {/* Step 5: completion only, no TapHint */}
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
              {step === total && (
                <button className={frameStyles.primaryBtn} onClick={()=> navigate('/sms/practice')}>완료</button>
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
                  <button type="button" onClick={()=> setShowDetails(s=>!s)} className={frameStyles.ghostBtn} aria-expanded={showDetails} aria-controls="mphoto-result-details" style={{ padding:'6px 10px', fontSize:13 }}>{showDetails ? '세부점수 숨기기' : '세부점수 보기'}</button>
                  <div style={{ color:'#666', fontSize:13 }}>시간: {formatElapsedForResult(result?.score?.derived?.elapsedSec)}</div>
                </div>
              </div>
            </div>
            {showDetails && (
              <div id="mphoto-result-details" style={{ marginTop:14, padding:12, borderRadius:8, background:'#fafafa', border:'1px solid #eee' }}>
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
              <button className={frameStyles.primaryBtn} onClick={()=> { setResult(null); navigate('/sms/practice'); }}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
