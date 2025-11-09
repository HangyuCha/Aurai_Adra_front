import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import frameStyles from '../Sms/SmsLessonFrame.module.css';
import lt from '../../styles/learnTitle.module.css';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
import steps from './KakaoMediaLessonSteps.js';
import { tapHintConfig } from './KakaoMediaTapHintConfig';
import kreser1 from '../../assets/kreser1.png';
import kreser2 from '../../assets/kreser2.png';
import kpic3 from '../../assets/kpic3.png';
import kpic4 from '../../assets/kpic4.png';
import kpic1 from '../../assets/kpic1.png';
import kpic2 from '../../assets/kpic2.png';
import { useScoringProgress } from '../../lib/useScoringProgress';
import { getChapterId, ChapterDomain } from '../../lib/chapters';
import api from '../../lib/api';

export default function KakaoMediaPractice(){
  const [step,setStep] = useState(1);
  const stepsConf = steps;
  const total = stepsConf.length;
  const shellRef = useRef(null);
  const shellAreaRef = useRef(null);
  const captionRef = useRef(null);
  const headerRef = useRef(null);
  const [_scale,setScale] = useState(1);

  

  const [hintCount, setHintCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const hintStorageKey = `practiceHintCount:kakao:media`;
  const hintTimerRef = useRef(null);

  useEffect(()=>{
    try{ const v = Number(localStorage.getItem(hintStorageKey) || '0') || 0; setHintCount(v);} catch { setHintCount(0); }
    try{ localStorage.setItem(hintStorageKey, '0'); setHintCount(0); } catch { /* ignore */ }
    return ()=>{ if(hintTimerRef.current) clearTimeout(hintTimerRef.current); };
  },[hintStorageKey]);

  const [showWrongPopup, setShowWrongPopup] = useState(false);

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  useEffect(()=>{ const raw = localStorage.getItem('accessToken'); if(!raw) return; let mounted=true; (async()=>{ try{ const {data} = await api.get('/users/me'); if(mounted) setUser(data);} catch { /* ignore */ } })(); return ()=>{ mounted=false; }; },[]);

  const chapterId = getChapterId(ChapterDomain.KAKAO, 0);
  const scoringHook = useScoringProgress({ user, chapterId, expertTimeSec: 20, stepsRequired: total, shouldSave: ()=> true });
  const tracker = scoringHook?.tracker;
  const finalizeSave = scoringHook?.finalizeAndSave;

  const startedAtRef = useRef(null);
  const timerRef = useRef(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  useEffect(()=>{
    startedAtRef.current = Date.now(); setElapsedSec(0);
    timerRef.current = setInterval(()=>{ const start = startedAtRef.current || Date.now(); setElapsedSec(Math.floor((Date.now()-start)/1000)); },250);
    try{ tracker?.start && tracker.start(); } catch { /* ignore */ }
    return ()=>{ if(timerRef.current) clearInterval(timerRef.current); try{ tracker?.end && tracker.end(); } catch { /* ignore */ } };
  },[tracker]);

  function formatTime(sec){ const m = Math.floor(sec/60).toString().padStart(2,'0'); const s = Math.floor(sec%60).toString().padStart(2,'0'); return `${m}:${s}`; }
  function formatElapsedForResult(elapsed){ if (elapsed == null || Number.isNaN(Number(elapsed))) return '-'; const e = Number(elapsed); if (e <= 0) return '0초 00'; if (e >= 60) { const mm = Math.floor(e/60).toString().padStart(2,'0'); const ss = Math.floor(e%60).toString().padStart(2,'0'); return `${mm}:${ss}`; } const sec = Math.floor(e); const centis = Math.round((e - sec) * 100); const cs = String(centis).padStart(2,'0'); return `${sec}초 ${cs}`; }

  

  const forceShowResult = useCallback(async ()=>{
    try{ tracker?.markCorrect && tracker.markCorrect(step); } catch { /* ignore */ }
    try{ tracker && typeof tracker.end === 'function' && tracker.end(); } catch { /* ignore */ }
    if(finalizeSave){ try{ const res = await finalizeSave(); try{ const finalMs = startedAtRef.current ? (Date.now()-startedAtRef.current) : (res?.score?.derived?.elapsedSec? (res.score.derived.elapsedSec*1000):0); const finalSec = Math.round((finalMs/10))/100; if(res && res.score) res.score.derived = { ...(res.score.derived||{}), elapsedSec: finalSec }; } catch { /* ignore */ } setResult(res); try{ localStorage.setItem('practiceScore:kakao:media', JSON.stringify(res?.score ?? null)); } catch { /* ignore */ } return; }catch{ console.debug('finalizeSave failed in forceShowResult'); } }
    try{ const score = tracker?.scoreNow ? tracker.scoreNow() : null; try{ const finalMs = startedAtRef.current ? (Date.now()-startedAtRef.current) : (score?.derived?.elapsedSec? (score.derived.elapsedSec*1000):0); const finalSec = Math.round((finalMs/10))/100; if(score) score.derived = { ...(score.derived||{}), elapsedSec: finalSec }; } catch { /* ignore */ } setResult({ score, elapsed: (score?.derived?.elapsedSec ?? null) }); try{ localStorage.setItem('practiceScore:kakao:media', JSON.stringify(score ?? null)); } catch { /* ignore */ } }catch(e){ console.debug('forceShowResult fallback failed', e); setResult({ score: { total:0, breakdown:{}, derived:{ elapsedSec } }, elapsed: (elapsedSec ?? null) }); }
  },[tracker, finalizeSave, step, elapsedSec]);

  useEffect(()=>{
    if(step !== total) return undefined;
    function onHintClick(){ try{ forceShowResult(); } catch { /* ignore */ } }
    try{ const els = Array.from(document.querySelectorAll('button[aria-label="전송 버튼 힌트"]')); els.forEach(el=>el.addEventListener('click', onHintClick)); return ()=> els.forEach(el=>el.removeEventListener('click', onHintClick)); }catch{ return undefined; }
  },[step, total, forceShowResult]);

  // wrong-click popup disabled for now per request (do not attach pointerdown guard)
  useEffect(()=>{ return; },[]);

  useLayoutEffect(()=>{ function recalc(){ const vw = window.innerWidth; const vh = window.innerHeight; const headerH = headerRef.current?.offsetHeight || 0; const captionH = captionRef.current?.offsetHeight || 0; const side = window.innerWidth >= 1100; const verticalPadding = 84; const horizontalPadding = 40; const availH = Math.max(160, vh - headerH - (side ? 0 : captionH) - verticalPadding); if(shellAreaRef.current){ shellAreaRef.current.style.minHeight = `${availH}px`; } const availW = Math.max(200, vw - horizontalPadding); if(!shellRef.current) return; const el = shellRef.current; const prevTransform = el.style.transform; el.style.transform = 'none'; const rect = el.getBoundingClientRect(); const baseW = rect.width || 1; const baseH = rect.height || 1; const ratioH = availH / baseH; const ratioW = availW / baseW; let next = Math.min(1, ratioH, ratioW); if(side && captionRef.current){ const captionW = captionRef.current.getBoundingClientRect().width; const gap = 32; const required = baseW + gap + captionW; const available = vw - horizontalPadding; if(required > available){ const shrink = available / required; next = Math.min(next, shrink); } } if(!isFinite(next) || next <= 0) next = 1; if(next < 0.5) next = 0.5; const finalScale = Math.abs(next - 1) < 0.002 ? 1 : next; setScale(finalScale); if(side && finalScale < 1){ el.style.transform = 'none'; } else { el.style.transform = prevTransform; } if(side && finalScale === 1){ const rect2 = el.getBoundingClientRect(); if(rect2.height > availH){ const fullscreenLike = (window.innerHeight >= 820); const targetRatio = availH / rect2.height; let shrink = targetRatio; if(fullscreenLike){ shrink -= 0.035; } if(shrink < 0.99){ shrink = Math.max(0.55, shrink); } } } } recalc(); window.addEventListener('resize', recalc); return ()=> window.removeEventListener('resize', recalc); },[]);

  const next = ()=>{ try{ tracker?.markCorrect && tracker.markCorrect(step); } catch { /* ignore */ } setShowHint(false); setStep(s=>Math.min(total, s+1)); };

  useEffect(()=>{ setShowHint(false); if(hintTimerRef.current){ clearTimeout(hintTimerRef.current); hintTimerRef.current = null; } },[step]);

  function handleHint(){ let nextv=null; try{ const cur = Number(localStorage.getItem(hintStorageKey) || '0') || 0; nextv = cur + 1; localStorage.setItem(hintStorageKey, String(nextv)); setHintCount(nextv); } catch { /* ignore */ } setShowHint(true); try{ tracker?.markHint && tracker.markHint(); } catch { /* ignore */ } }
  function handleHintWithAutoHide(){ if(hintTimerRef.current){ clearTimeout(hintTimerRef.current); hintTimerRef.current = null; } handleHint(); try{ hintTimerRef.current = setTimeout(()=>{ setShowHint(false); hintTimerRef.current = null; }, 6000); } catch { /* ignore */ } }

  // debug helper: log when hint button clicked
  function _dbgLogHint(){ try{ console.debug('[media practice] hint clicked - showHint currently', showHint); } catch(e){ void e; } }

  const imagesMap = {1: kreser1, 2: kreser2, 3: kpic1, 4: kpic3, 5: kpic2, 6: kpic4 };

  return (
    <div className={frameStyles.framePage}>
      <BackButton to="/kakao/practice" variant="fixed" />
      <header className={frameStyles.frameHeader} ref={headerRef}>
        <h1 className={`${frameStyles.frameTitle} ${lt.withAccent}`}>
          <span className="titleText">사진/파일 보내기</span>
          <span className={frameStyles.inlineTagline}>사진과 파일 전송, 삭제 흐름을 연습합니다.</span>
        </h1>
      </header>
      <div className={frameStyles.lessonRow}>
        <div className={frameStyles.deviceCol} ref={shellAreaRef}>
          <div ref={shellRef}>
            <PhoneFrame image={imagesMap[step]} screenWidth={'278px'} aspect={'278 / 450'} scale={1}>
              {
                (() => {
                  const raw = (tapHintConfig && tapHintConfig[step]);
                  const overrides = Array.isArray(raw) ? raw : [raw || {}];
                  const defaultProps = {
                    // match GenericLesson defaults so positions from the learn lesson land correctly
                    selector: 'button[aria-label="메시지 보내기"]',
                    width: step === 1 ? '279px' : step === 2 ? '180px' : step === 3 ? '60px' : '18%',
                    height: step === 1 ? '59px' : step === 2 ? '25px' : step === 3 ? '30px' : '8%',
                    offsetX: step === 1 ? 0 : step === 2 ? 38 : step === 3 ? 0 : 0,
                    offsetY: step === 1 ? 212 : step === 2 ? -67.5 : step === 3 ? 0 : 0,
                    borderRadius: '10px',
                    suppressInitial: step === total,
                    ariaLabel: tapHintConfig[step]?.ariaLabel || '힌트'
                  };
                  return overrides.map((override, idx) => {
                    const hintProps = { ...defaultProps, ...override };
                    if(hintProps.hidden) return null;
                    const onAct = (override && override.onActivate)
                      ? override.onActivate
                      : (() => {
                        if (step === total - 1) {
                          try{ next(); } catch { /* ignore */ }
                          try{ setTimeout(()=>{ try{ forceShowResult(); } catch { /* ignore */ } }, 350); } catch { /* ignore */ }
                          return;
                        }
                        if (step === total) { try{ forceShowResult(); } catch { /* ignore */ } }
                        else { next(); }
                      });
                    return (
                      <TapHint key={idx} {...hintProps} onActivate={onAct} invisible={!showHint} />
                    );
                  });
                })()
              }
            </PhoneFrame>
          </div>
        </div>
        <div className={frameStyles.sidePanel}>
          <div className={frameStyles.captionBar} ref={captionRef}>
            <div className={frameStyles.progressHeader}>
              <div className={frameStyles.stepMeta}>
                <span className={frameStyles.stepCount}>{step} / {total}</span>
                <span className={frameStyles.stepTitle}>{stepsConf.find(s=>s.id===step)?.title}</span>
              </div>
            </div>
            <div className={frameStyles.captionDivider} />
            {tracker && <div style={{marginTop:8,color:'rgb(102,102,102)'}}>시간: {formatTime(elapsedSec)}</div>}
            <div style={{marginTop:12, display:'flex', gap:10, alignItems:'center'}}>
              <button className={frameStyles.ghostBtn} aria-label="힌트 보기" onClick={handleHintWithAutoHide}>힌트 보기</button>
              <div style={{color:'rgb(102,102,102)'}}>힌트 사용: {hintCount}</div>
            </div>
          </div>
        </div>
      </div>

      {showWrongPopup && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)', zIndex: 120 }}>
          <div style={{ background: '#fff', padding: 18, borderRadius: 8, minWidth: 220 }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>틀렸습니다</div>
            <div style={{ marginBottom: 12 }}>다시 시도해 보세요.</div>
            <div style={{ textAlign: 'right' }}>
              <button className={frameStyles.primaryBtn} onClick={()=>setShowWrongPopup(false)}>확인</button>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)', zIndex: 200 }}>
          <div style={{ background: '#fff', padding: 22, borderRadius: 12, minWidth: 320, maxWidth: 560 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ flex: '0 0 120px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: '#10B981' }}>{result?.score?.total ?? '-'}</div>
                <div style={{ fontSize: 14, color: '#666' }}>/ 100</div>
              </div>
              <div style={{ flex: '1 1 auto' }}>
                <h3 style={{ margin: 0 }}>연습 결과</h3>
                <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button type="button" onClick={()=> setShowDetails(s=>!s)} className={frameStyles.ghostBtn} style={{ padding: '6px 10px', fontSize: 13 }}>{showDetails? '세부점수 숨기기' : '세부점수 보기'}</button>
                  <div style={{ color: '#666', fontSize: 13 }}>시간: {result?.score?.derived?.elapsedSec ?? '-'}</div>
                </div>
              </div>
            </div>

            {showDetails && (
              <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: '#fafafa', border: '1px solid #eee' }}>
                <strong>세부 점수</strong>
                <div style={{ marginTop: 8 }}>
                  <div>소요 시간: {formatElapsedForResult(result?.elapsed)}</div>
                  <div>시간 점수: {result?.score?.breakdown?.timeScore ?? '-'} / 30</div>
                  <div>정확도 점수: {result?.score?.breakdown?.errorScore ?? '-'} / 20</div>
                  <div>성공 점수: {result?.score?.breakdown?.successScore ?? '-'} / 50</div>
                  <div>부분 진행 보너스: {result?.score?.breakdown?.progressBonus ?? '-'} / 10</div>
                  <div>힌트 패널티: {result?.score?.breakdown?.hintPenalty ?? '-'} (힌트당 -5, 최대 감점 -20)</div>
                </div>
              </div>
            )}

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button className={frameStyles.primaryBtn} onClick={()=>{ setResult(null); navigate('/kakao/practice'); }}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

