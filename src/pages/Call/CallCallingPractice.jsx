import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
import frameStyles from '../Sms/SmsLessonFrame.module.css';
import lt from '../../styles/learnTitle.module.css';
import { buildCallLessonConfig, topicMeta } from './callDynamicSteps.js';
import { useScoringProgress } from '../../lib/useScoringProgress';
import { ChapterDomain, getChapterId } from '../../lib/chapters';

/**
 * Practice for Call "전화걸기"
 * - Mirrors learn content but adds timer, hint usage, wrong-click popup, and scoring
 * - TapHint uses focusAreas geometry from CallCallingLessonSteps.js
 * - Without pressing "힌트 보기", tapping the correct area still advances (hint overlay is invisible but clickable)
 */
export default function CallCallingPractice({ practiceTracker = null, finalizeAndSave = null }){
  const navigate = useNavigate();
  // Load raw config (images and base steps), then condense to 3-step flow like learn
  const { steps: rawSteps, screens: rawScreens } = useMemo(() => buildCallLessonConfig('calling'), []);
  // Map screens: real steps use image 1,2 and last; with an intermediate preview (usually image 3)
  const screenMap = useMemo(() => {
    const keys = Object.keys(rawScreens||{}).map(n=>parseInt(n,10)).filter(Number.isFinite);
    const maxIdx = keys.length ? Math.max(...keys) : 1;
    const finalIdx = rawScreens[4] ? 4 : maxIdx;
    const interIdx = rawScreens[3] ? 3 : Math.max(1, finalIdx - 1);
    return { real: {1:1, 2:2, 3:finalIdx}, intermediate: interIdx };
  }, [rawScreens]);
  const steps = useMemo(() => {
    const s1 = rawSteps.find(s=>s.id===1);
    const s2 = rawSteps.find(s=>s.id===2);
    const s3 = rawSteps.find(s=>s.id===3) || { id:3, title:'통화 종료', instruction:'통화를 종료하세요.', speak:'통화를 종료하세요.' };
    return [ s1 ? {...s1, id:1} : {id:1,title:'단계 1',instruction:'전화번호를 입력하세요.', speak:'전화번호를 입력하세요.'}, s2 ? {...s2, id:2} : {id:2,title:'단계 2',instruction:'발신 후 연결을 확인하세요.', speak:'발신 후 연결을 확인하세요.'}, {...s3, id:3} ];
  }, [rawSteps]);
  const screens = rawScreens;
  const total = steps.length || 1;
  const [step, setStep] = useState(1);
  const current = useMemo(()=> (steps.find(s=>s.id===step) || steps[0] || {}), [steps, step]);
  const [showIntermediate, setShowIntermediate] = useState(false);
  const interTimerRef = useRef(null);

  // scoring & timer
  const chapterId = getChapterId(ChapterDomain.CALL, 0); // calling assumed to be first CALL topic
  const scoringHook = useScoringProgress({ user: null, chapterId, expertTimeSec: 25, stepsRequired: total, shouldSave: () => true });
  const tracker = practiceTracker || scoringHook?.tracker;
  const finalizeSave = finalizeAndSave || scoringHook?.finalizeAndSave;

  const startedAtRef = useRef(null);
  const timerRef = useRef(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  useEffect(()=>{
    startedAtRef.current = Date.now();
    setElapsedSec(0);
    timerRef.current = setInterval(()=>{
      const start = startedAtRef.current || Date.now();
      setElapsedSec(Math.floor((Date.now() - start)/1000));
    }, 250);
    try { tracker?.start && tracker.start(); } catch { /* ignore */ }
    return ()=> { if(timerRef.current) clearInterval(timerRef.current); try { tracker?.end && tracker.end(); } catch { /* ignore */ } };
  }, [tracker]);

  function formatTime(sec){ const m=Math.floor(sec/60).toString().padStart(2,'0'); const s=Math.floor(sec%60).toString().padStart(2,'0'); return `${m}:${s}`; }
  function formatElapsedForResult(e){ if(e==null||Number.isNaN(Number(e))) return '-'; const n=Number(e); if(n>=60){ const mm=Math.floor(n/60).toString().padStart(2,'0'); const ss=Math.floor(n%60).toString().padStart(2,'0'); return `${mm}:${ss}`; } const s=Math.floor(n); const cs=Math.round((n-s)*100).toString().padStart(2,'0'); return `${s}초 ${cs}`; }

  // hint system
  const [showHint, setShowHint] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const hintKey = 'practiceHintCount:call:calling';
  useEffect(()=>{ try { localStorage.setItem(hintKey,'0'); } catch { /* ignore */ } setHintCount(0); return ()=>{ try { localStorage.removeItem(hintKey); } catch { /* ignore */ } }; }, []);
  function useHint(){ try { const cur = Number(localStorage.getItem(hintKey)||'0')||0; const next = cur+1; localStorage.setItem(hintKey,String(next)); setHintCount(next); } catch { /* ignore */ } setShowHint(true); try { tracker?.markHint && tracker.markHint(); } catch { /* ignore */ } }
  useEffect(()=>{ setShowHint(false); }, [step]);

  // result modal
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showWrongPopup, setShowWrongPopup] = useState(false);

  async function finalizePractice(){
    try { tracker?.markCorrect && tracker.markCorrect(step); } catch { /* ignore */ }
    if(step < total){ for(let i=step+1;i<=total;i++){ try { tracker?.markCorrect && tracker.markCorrect(i); } catch { /* ignore */ } } }
    try { tracker?.end && tracker.end(); } catch { /* ignore */ }
    if(finalizeSave){
      try { const res = await finalizeSave(); try { const ms = startedAtRef.current ? (Date.now()-startedAtRef.current) : 0; const sec = Math.round(ms/10)/100; if(res&&res.score){ res.score.derived = { ...(res.score.derived||{}), elapsedSec: sec }; } } catch { /* ignore */ } setResult(res); try { localStorage.setItem('practiceScore:call:calling', JSON.stringify(res?.score ?? null)); } catch { /* ignore */ } return; } catch { /* ignore */ }
    }
    try { const score = tracker?.scoreNow ? tracker.scoreNow() : null; setResult({ score }); try { localStorage.setItem('practiceScore:call:calling', JSON.stringify(score ?? null)); } catch { /* ignore */ } } catch { setResult(null); }
  }

  function next(){ try { tracker?.markCorrect && tracker.markCorrect(step); } catch { /* ignore */ } setStep(s=> Math.min(total, s+1)); }

  // keypad / dial state (to mirror learn behavior)
  const [dialed, setDialed] = useState('');

  // Step 2 TapHint activate -> show intermediate preview then move to final step
  const handleStep2Activate = () => {
    // Early finalize: when user taps the step 2 hint, immediately finalize and show score.
    // Mark step 2 correct (and finalizePractice will mark remaining steps, including step 3).
    try { tracker?.markCorrect && tracker.markCorrect(2); } catch { /* ignore */ }
    // Move UI to final step for consistency before finalize.
    setStep(3);
    // Skip intermediate preview entirely for early completion.
    setShowIntermediate(false);
    if(interTimerRef.current){ clearTimeout(interTimerRef.current); interTimerRef.current = null; }
    finalizePractice();
  };

  // Click capture: allow TapHint and keypad/call/delete buttons; otherwise error popup
  function handleDeviceClickCapture(e){
    try {
      const path = e.nativeEvent?.composedPath ? e.nativeEvent.composedPath() : [];
      if(path && path.length){
        for(const node of path){ if(!node || !node.getAttribute) continue; const al=node.getAttribute('aria-label')||''; if(al.includes('힌트') || al.startsWith('키패드') || al==='발신' || al==='지우기' || al==='메시지 보내기') return; }
      } else {
        const tgt = e.target; if(tgt && tgt.closest){ if(tgt.closest('[aria-label*="힌트"]') || tgt.closest('[aria-label^="키패드"]') || tgt.closest('[aria-label="발신"]') || tgt.closest('[aria-label="지우기"]') || tgt.closest('[aria-label="메시지 보내기"]')) return; }
      }
    } catch { /* ignore */ }
    e.stopPropagation(); e.preventDefault();
    try { tracker?.markError && tracker.markError(step); } catch { /* ignore */ }
    setShowWrongPopup(true);
  }

  const isLast = (step === total);

  return (
    <div className={frameStyles.framePage}>
      <BackButton to="/call/practice" variant="fixed" />
      <header className={frameStyles.frameHeader}>
        <h1 className={`${frameStyles.frameTitle} ${lt.withAccent}`}>
          <span className="titleText">{topicMeta.calling.title} 연습</span>
          <span className={frameStyles.inlineTagline}>{current.instruction || topicMeta.calling.tagline}</span>
        </h1>
      </header>
      <div className={frameStyles.lessonRow}>
        <div className={frameStyles.deviceCol} onClickCapture={handleDeviceClickCapture}>
          <PhoneFrame image={screens[ showIntermediate ? screenMap.intermediate : (screenMap.real[step] || step) ]} screenWidth={'278px'} aspect={'278 / 450'} scale={1}>
            {/* Step 1 and 2 overlays to match learn behavior */}
            {(step === 1 || step === 2) && (
              <>
                {/* Step 2 status text */}
                {step === 2 && !showIntermediate && (
                  <div aria-hidden="true" style={{ position:'absolute', left:'50%', top:'3.5%', transform:'translateX(-50%)', width:'84%', minHeight:'22px', textAlign:'center', fontSize:'13px', fontWeight:400, color:'#333', letterSpacing:'1px', zIndex:3, pointerEvents:'none', textShadow:'0 1px 2px rgba(255,255,255,0.6)'}}>
                    휴대전화 연결 중...
                  </div>
                )}
                {/* Dialed number */}
                <div aria-live="polite" style={{ position:'absolute', left:'50%', top:'8%', transform:'translateX(-50%)', width:'80%', minHeight:'24px', textAlign:'center', fontSize: step===1 ? '22px' : '20px', fontWeight:400, color:'#111', letterSpacing:'2px', zIndex:3, pointerEvents:'none', textShadow:'0 1px 2px rgba(255,255,255,0.6)'}}>
                  {dialed}
                </div>
              </>
            )}

            {/* Step 1 keypad and buttons */}
            {step === 1 && (
              <>
                {[ {ch:'1', x:'25%', y:'calc(30% - 6px)'}, {ch:'2', x:'50%', y:'calc(30% - 6px)'}, {ch:'3', x:'75%', y:'calc(30% - 6px)'},
                   {ch:'4', x:'25%', y:'calc(43% - 6px)'}, {ch:'5', x:'50%', y:'calc(43% - 6px)'}, {ch:'6', x:'75%', y:'calc(43% - 6px)'},
                   {ch:'7', x:'25%', y:'calc(56% - 6px)'}, {ch:'8', x:'50%', y:'calc(56% - 6px)'}, {ch:'9', x:'75%', y:'calc(56% - 6px)'},
                   {ch:'*', x:'25%', y:'calc(69% - 6px)'}, {ch:'0', x:'50%', y:'calc(69% - 6px)'}, {ch:'#', x:'75%', y:'calc(69% - 6px)'}
                ].map((b, idx) => (
                  <button key={idx} type="button" aria-label={`키패드 ${b.ch}`} onClick={()=> setDialed(d=> d + b.ch)}
                    style={{ position:'absolute', left:b.x, top:b.y, transform:'translate(-50%, -50%)', width:'55px', height:'55px', borderRadius:'50%', background:'transparent', border:'none', cursor:'pointer', boxShadow:'none', transition:'background .12s, transform .15s', zIndex:3 }}
                    onMouseDown={e=>{ e.currentTarget.style.background='rgba(0,0,0,0.10)'; e.currentTarget.style.transform='translate(-50%, -50%) scale(0.95)'; }}
                    onMouseUp={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                    onTouchStart={e=>{ e.currentTarget.style.background='rgba(0,0,0,0.12)'; e.currentTarget.style.transform='translate(-50%, -50%) scale(0.95)'; }}
                    onTouchEnd={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                    onTouchCancel={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                  />
                ))}
                {/* Call button (green) */}
                <button type="button" aria-label="발신" disabled={!dialed.length} onClick={()=> { if(dialed.length) next(); }}
                  style={{ position:'absolute', left:'50%', top:'calc(84% - 10px)', transform:'translate(-50%, -50%)', width:'55px', height:'55px', borderRadius:'50%', background:'transparent', border:'none', cursor: dialed.length ? 'pointer' : 'default', boxShadow:'none', color:'transparent', fontSize:'0', zIndex:3 }}
                  onMouseDown={e=>{ if(!dialed.length) return; e.currentTarget.style.background='rgba(40,190,60,0.25)'; e.currentTarget.style.transform='translate(-50%, -50%) scale(0.95)'; }}
                  onMouseUp={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                  onTouchStart={e=>{ if(!dialed.length) return; e.currentTarget.style.background='rgba(40,190,60,0.25)'; e.currentTarget.style.transform='translate(-50%, -50%) scale(0.95)'; }}
                  onTouchEnd={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                  onTouchCancel={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                />
                {/* Backspace */}
                <button type="button" aria-label="지우기" disabled={!dialed.length} onClick={()=> setDialed(d => d.slice(0, -1))}
                  style={{ position:'absolute', left:'calc(82% - 20px)', top:'calc(84% - 10px)', transform:'translate(-50%, -50%)', width:'5.5%', height:'4%', borderRadius:'8px', background:'transparent', border:'none', cursor: dialed.length ? 'pointer' : 'default', zIndex:3 }}
                  onMouseDown={e=>{ if(!dialed.length) return; e.currentTarget.style.background='rgba(0,0,0,0.10)'; e.currentTarget.style.transform='translate(-50%, -50%) scale(0.95)'; }}
                  onMouseUp={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                  onTouchStart={e=>{ if(!dialed.length) return; e.currentTarget.style.background='rgba(0,0,0,0.12)'; e.currentTarget.style.transform='translate(-50%, -50%) scale(0.95)'; }}
                  onTouchEnd={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                  onTouchCancel={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                />

                {/* TapHint for call button (step 1) – matches learn */}
                <TapHint
                  selector={'button[aria-label="발신"]'}
                  width={'55px'}
                  height={'55px'}
                  offsetX={0}
                  offsetY={0}
                  borderRadius={'50%'}
                  onActivate={()=>{ next(); }}
                  suppressInitial={false}
                  invisible={!showHint}
                  ariaLabel={'발신 버튼 힌트'}
                />
              </>
            )}

            {/* Step 2 TapHint – use fallback positioning like learn (no real target button) */}
            {step === 2 && !showIntermediate && (
              <TapHint
                x={'50%'}
                y={'80%'}
                width={'65px'}
                height={'65px'}
                offsetX={(38 - 37)}
                offsetY={(-67.5 + 50)}
                borderRadius={'50%'}
                onActivate={handleStep2Activate}
                suppressInitial={false}
                invisible={false}
                ariaLabel={'전송 버튼 힌트'}
              />
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
              {!isLast ? (
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
                  <button type="button" onClick={()=> setShowDetails(s=>!s)} className={frameStyles.ghostBtn} aria-expanded={showDetails} aria-controls="call-calling-result-details" style={{ padding:'6px 10px', fontSize:13 }}>{showDetails ? '세부점수 숨기기' : '세부점수 보기'}</button>
                  <div style={{ color:'#666', fontSize:13 }}>시간: {formatElapsedForResult(result?.score?.derived?.elapsedSec)}</div>
                </div>
              </div>
            </div>
            {showDetails && (
              <div id="call-calling-result-details" style={{ marginTop:14, padding:12, borderRadius:8, background:'#fafafa', border:'1px solid #eee' }}>
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
