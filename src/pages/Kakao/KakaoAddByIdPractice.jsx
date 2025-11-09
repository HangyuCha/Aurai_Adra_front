import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import frameStyles from '../Sms/SmsLessonFrame.module.css';
import lt from '../../styles/learnTitle.module.css';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
import ChatInputBar from '../../components/ChatInputBar/ChatInputBar';
import VirtualKeyboard from '../../components/VirtualKeyboard/VirtualKeyboard';
import steps from './kakaofriendlessonsteps.js';
import kaddid from '../../assets/kaddid.png';
import kaddid1 from '../../assets/kaddid1.png';
import kaddid2 from '../../assets/kaddid2.png';
import kaddid3 from '../../assets/kaddid3.png';
import kaddid4 from '../../assets/kaddid4.png';
// kaddid5 not used
import { useScoringProgress } from '../../lib/useScoringProgress';
import { getChapterId, ChapterDomain } from '../../lib/chapters';
import api from '../../lib/api';

export default function KakaoAddByIdPractice(){
  const [step,setStep] = useState(1);
  const stepsConf = steps;
  const total = stepsConf.length;
  const shellRef = useRef(null);
  const shellAreaRef = useRef(null);
  const captionRef = useRef(null);
  const headerRef = useRef(null);
  const [_scale,setScale] = useState(1);
  const [answer, setAnswer] = useState('');
  const [comp, setComp] = useState({lead:'', vowel:'', tail:''});
  const compRef = useRef({lead:'', vowel:'', tail:''});
  const flushCompositionRef = useRef(null);
  function updateComp(next){ setComp(next); compRef.current = next; }
  function updateCompFn(fn){ setComp(prev=>{ const next = fn(prev); compRef.current = next; return next; }); }
  // updateCompFn intentionally unused in this practice variant

  // minimal composition helpers (copied from UiPractice)
  const CHO = ['\u0000','ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const JUNG = ['\u0000','ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
  const JONG = ['\u0000','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const VCOMB = { 'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ' };
  const JCOMB = { 'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ' };
  function flushComposition(snapshot){
    const {lead, vowel, tail} = snapshot || compRef.current;
    updateComp({lead:'', vowel:'', tail:''});
    if(!lead && !vowel && !tail) return;
    if(!lead && vowel){ setAnswer(a=> a + vowel); return; }
    const L = CHO.indexOf(lead) >= 0 ? CHO.indexOf(lead) : -1;
    const V = JUNG.indexOf(vowel) >= 0 ? JUNG.indexOf(vowel) : -1;
    const T = JONG.indexOf(tail) >= 0 ? JONG.indexOf(tail) : 0;
    if(L>0 && V>0){ const syll = String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T)); setAnswer(a=> a + syll); }
    else { const raw = (lead||'') + (vowel||'') + (tail||''); setAnswer(a=> a + raw); }
  }
  flushCompositionRef.current = flushComposition;
  function composePreview(){ const {lead, vowel, tail} = comp; if(!lead && !vowel && !tail) return ''; if(!lead && vowel) return vowel; const L = CHO.indexOf(lead) >= 0 ? CHO.indexOf(lead) : -1; const V = JUNG.indexOf(vowel) >= 0 ? JUNG.indexOf(vowel) : -1; const T = JONG.indexOf(tail) >= 0 ? JONG.indexOf(tail) : 0; if(L>0 && V>0){ return String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T)); } return (lead||'') + (vowel||'') + (tail||''); }

  const canSubmit = (answer + composePreview()).trim().length > 0;

  // replicate the tapHintConfig from the learn lesson so positions/behavior match exactly
  const tapHintConfig = {
    1: { offsetY: 335, offsetX: 60, width: '40px', height: '40px' },
    2: { offsetY: 295, offsetX: 35, width: '60px', height: '50px' },
    3: { hidden: false, width: '280px', height: '30px', offsetY: 300, offsetX: 0, suppressInitial: false },
    4: { hidden: false, selector: null, width: '25px', height: '25px', offsetY: 120, offsetX: 111, borderRadius: '50px', suppressInitial: false },
    5: { selector: null, offsetY: 162, offsetX: 60, width: '130px', height: '40px', suppressInitial: false }
  };

  const [hintCount, setHintCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const hintStorageKey = `practiceHintCount:kakao:addById`;
  const hintTimerRef = useRef(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const lastKeyRef = useRef({ch:null, t:0});
  useEffect(()=>{
    try{ const v = Number(localStorage.getItem(hintStorageKey) || '0') || 0; setHintCount(v);} catch { setHintCount(0); }
    // reset hint count for each run of the practice (do not persist across visits)
    try{ localStorage.setItem(hintStorageKey, '0'); setHintCount(0); } catch { /* ignore */ }
    return ()=>{ if(hintTimerRef.current) clearTimeout(hintTimerRef.current); };
  },[hintStorageKey]);

  const [showWrongPopup, setShowWrongPopup] = useState(false);

  // scoring/tracker
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  useEffect(()=>{
    const raw = localStorage.getItem('accessToken'); if(!raw) return; let mounted=true; (async()=>{ try{ const {data} = await api.get('/users/me'); if(mounted) setUser(data);} catch { /* ignore */ } })(); return ()=>{ mounted=false; };
  },[]);

  const chapterId = getChapterId(ChapterDomain.KAKAO, 0);
  const scoringHook = useScoringProgress({ user, chapterId, expertTimeSec: 20, stepsRequired: total, shouldSave: ()=> true });
  const tracker = scoringHook?.tracker;
  const finalizeSave = scoringHook?.finalizeAndSave;

  // timer/result
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

  async function submitPractice(){
    try{ tracker?.markCorrect && tracker.markCorrect(step); } catch { /* ignore */ }
    try{ tracker && typeof tracker.end === 'function' && tracker.end(); } catch { /* ignore */ }
    try{ flushCompositionRef.current && flushCompositionRef.current(); } catch { /* ignore */ }

    const expectsInput = Boolean(stepsConf.find(s=>s.id===step && s.inputPlaceholder));
    if (expectsInput && !((answer + composePreview()).trim().length > 0)){
      setResult({ error: '메시지를 입력한 후 전송해주세요.' });
      setTimeout(()=> setResult(null), 1500);
      return;
    }

    if(finalizeSave){
      try{
        const res = await finalizeSave();
        try{ const finalMs = startedAtRef.current ? (Date.now()-startedAtRef.current) : (res?.score?.derived?.elapsedSec? (res.score.derived.elapsedSec*1000):0); const finalSec = Math.round((finalMs/10))/100; if(res && res.score) res.score.derived = { ...(res.score.derived||{}), elapsedSec: finalSec }; } catch { /* ignore */ }
        // also attach elapsed to the top-level result so UI can read it consistently
        try{ res.elapsed = (typeof res.elapsed !== 'undefined') ? res.elapsed : (res?.score?.derived?.elapsedSec ?? null); } catch { /* ignore */ }
        setResult(res); try{ localStorage.setItem('practiceScore:kakao:addById', JSON.stringify(res?.score ?? null)); } catch { /* ignore */ }
        return;
      }catch(err){ console.debug('finalizeSave failed', err); }
    }

    try{
      const score = tracker?.scoreNow ? tracker.scoreNow() : null;
      try{ const finalMs = startedAtRef.current ? (Date.now()-startedAtRef.current) : (score?.derived?.elapsedSec ? (score.derived.elapsedSec*1000):0); const finalSec = Math.round((finalMs/10))/100; if(score) score.derived = { ...(score.derived||{}), elapsedSec: finalSec }; } catch { /* ignore */ }
      // attach elapsed at top-level for format/display
      setResult({ score, elapsed: (score?.derived?.elapsedSec ?? null) }); try{ localStorage.setItem('practiceScore:kakao:addById', JSON.stringify(score ?? null)); } catch { /* ignore */ }
    }catch(e){ console.debug('submit fallback failed', e); setResult({ score: { total:0, breakdown:{}, derived:{ elapsedSec } } }); }
  }

  const forceShowResult = useCallback(async ()=>{
    try{ tracker?.markCorrect && tracker.markCorrect(step); } catch { /* ignore */ }
    try{ tracker && typeof tracker.end === 'function' && tracker.end(); } catch { /* ignore */ }
    try{ flushCompositionRef.current && flushCompositionRef.current(); } catch { /* ignore */ }
    if(finalizeSave){ try{ const res = await finalizeSave(); try{ const finalMs = startedAtRef.current ? (Date.now()-startedAtRef.current) : (res?.score?.derived?.elapsedSec? (res.score.derived.elapsedSec*1000):0); const finalSec = Math.round((finalMs/10))/100; if(res && res.score) res.score.derived = { ...(res.score.derived||{}), elapsedSec: finalSec }; } catch { /* ignore */ } setResult(res); try{ localStorage.setItem('practiceScore:kakao:addById', JSON.stringify(res?.score ?? null)); } catch { /* ignore */ } return; }catch{ console.debug('finalizeSave failed in forceShowResult'); } }
  try{ const score = tracker?.scoreNow ? tracker.scoreNow() : null; try{ const finalMs = startedAtRef.current ? (Date.now()-startedAtRef.current) : (score?.derived?.elapsedSec? (score.derived.elapsedSec*1000):0); const finalSec = Math.round((finalMs/10))/100; if(score) score.derived = { ...(score.derived||{}), elapsedSec: finalSec }; } catch { /* ignore */ } setResult({ score, elapsed: (score?.derived?.elapsedSec ?? null) }); try{ localStorage.setItem('practiceScore:kakao:addById', JSON.stringify(score ?? null)); } catch { /* ignore */ } }catch(e){ console.debug('forceShowResult fallback failed', e); setResult({ score: { total:0, breakdown:{}, derived:{ elapsedSec } }, elapsed: (elapsedSec ?? null) }); }
  },[tracker, finalizeSave, step, elapsedSec]);

  // attach listener on final step for DOM hint clicks
  useEffect(()=>{
    if(step !== total) return undefined;
    function onHintClick(){ try{ forceShowResult(); } catch { /* ignore */ } }
    try{ const els = Array.from(document.querySelectorAll('button[aria-label="전송 버튼 힌트"]')); els.forEach(el=>el.addEventListener('click', onHintClick)); return ()=> els.forEach(el=>el.removeEventListener('click', onHintClick)); }catch{ return undefined; }
  },[step, total, forceShowResult]);

  // show wrong-click popup when user clicks on phone area outside allowed interactive elements
  useEffect(()=>{
    const el = shellRef.current;
    if(!el) return undefined;
    function onPhonePointerDown(ev){
      try{
        // if result modal is visible, ignore
        if(result) return;
        const t = ev.target;
        // allowed interactive selectors inside the phone frame
  const allowed = 'button[aria-label="메시지 보내기"], button[aria-label="힌트 보기"], input, textarea, form, [role="textbox"], .VirtualKeyboard, .virtualKeyboard, .vk-key, .chat-input-bar, .ChatInputBar, .TapHint, .tap-hint';
  if(t && t.closest && t.closest(allowed)) return;
  // also ignore any element that is (or is inside) a TapHint button by aria-label containing '힌트'
  try{ if(t && t.closest && t.closest('button[aria-label*="힌트"]')) return; } catch { /* ignore malformed selector */ }
  // ignore clicks inside the virtual keyboard (role/aria-label used in the component)
  try{ if(t && t.closest && (t.closest('[aria-label="가상 키보드"]') || t.closest('[role="application"][aria-label="가상 키보드"]'))) return; } catch { /* ignore malformed selector */ }
        // otherwise mark an error and show the popup
        try{ tracker?.markError && tracker.markError(); } catch { /* ignore */ }
        setShowWrongPopup(true);
      }catch{ /* ignore */ }
    }
    el.addEventListener('pointerdown', onPhonePointerDown, { capture: true });
    return ()=> el.removeEventListener('pointerdown', onPhonePointerDown, { capture: true });
  },[shellRef, tracker, result]);

  // layout scaling
  useLayoutEffect(()=>{ function recalc(){ const vw = window.innerWidth; const vh = window.innerHeight; const headerH = headerRef.current?.offsetHeight || 0; const captionH = captionRef.current?.offsetHeight || 0; const side = window.innerWidth >= 1100; const verticalPadding = 84; const horizontalPadding = 40; const availH = Math.max(160, vh - headerH - (side ? 0 : captionH) - verticalPadding); if(shellAreaRef.current){ shellAreaRef.current.style.minHeight = `${availH}px`; } const availW = Math.max(200, vw - horizontalPadding); if(!shellRef.current) return; const el = shellRef.current; const prevTransform = el.style.transform; el.style.transform = 'none'; const rect = el.getBoundingClientRect(); const baseW = rect.width || 1; const baseH = rect.height || 1; const ratioH = availH / baseH; const ratioW = availW / baseW; let next = Math.min(1, ratioH, ratioW); if(side && captionRef.current){ const captionW = captionRef.current.getBoundingClientRect().width; const gap = 32; const required = baseW + gap + captionW; const available = vw - horizontalPadding; if(required > available){ const shrink = available / required; next = Math.min(next, shrink); } } if(!isFinite(next) || next <= 0) next = 1; if(next < 0.5) next = 0.5; const finalScale = Math.abs(next - 1) < 0.002 ? 1 : next; setScale(finalScale); if(side && finalScale < 1){ el.style.transform = 'none'; } else { el.style.transform = prevTransform; } if(side && finalScale === 1){ const rect2 = el.getBoundingClientRect(); if(rect2.height > availH){ const fullscreenLike = (window.innerHeight >= 820); const targetRatio = availH / rect2.height; let shrink = targetRatio; if(fullscreenLike){ shrink -= 0.035; } if(shrink < 0.99){ shrink = Math.max(0.55, shrink); } } } } recalc(); window.addEventListener('resize', recalc); return ()=> window.removeEventListener('resize', recalc); },[]);

  const next = ()=>{ try{ tracker?.markCorrect && tracker.markCorrect(step); } catch { /* ignore */ } setShowHint(false); setStep(s=>Math.min(total, s+1)); };

  useEffect(()=>{ setShowHint(false); if(hintTimerRef.current){ clearTimeout(hintTimerRef.current); hintTimerRef.current = null; } },[step]);

  // show virtual keyboard when the current step expects input
  useEffect(()=>{ const expects = Boolean(stepsConf.find(s=>s.id===step && s.inputPlaceholder)); setKeyboardVisible(expects); },[step, total, stepsConf]);

  // composition input handling (copied/adapted from GenericLesson)
  function combineVowel(a,b){ if(!a||!b) return null; const key = `${a}${b}`; return VCOMB[key]||null; }
  function combineJong(a,b){ if(!a||!b) return null; const key = `${a}${b}`; return JCOMB[key]||null; }

  function handleJamoInput(ch){
    try{
      setAnswer(a=>a); // touch state
      const prev = compRef.current;
      if(JUNG.includes(ch)){
        if(prev.tail){
          const isCompositeTail = Object.values(JCOMB).includes(prev.tail);
          if(isCompositeTail){
            let left=null,right=null;
            for(const k in JCOMB){ if(JCOMB[k]===prev.tail){ left=k.charAt(0); right=k.charAt(1); break; } }
            if(left && right){ const snapLeft = {lead: prev.lead, vowel: prev.vowel, tail: left}; flushComposition(snapLeft); updateComp({lead: right, vowel: ch, tail: ''}); return; }
            flushComposition(prev); updateComp({lead:'', vowel: ch, tail: ''}); return;
          }
          const tailChar = prev.tail; const snap2 = {lead: prev.lead, vowel: prev.vowel, tail: ''}; flushComposition(snap2); updateComp({lead: tailChar, vowel: ch, tail: ''}); return;
        }
        if(prev.lead && prev.vowel){ const comb = combineVowel(prev.vowel, ch); if(comb){ updateComp({...prev, vowel: comb}); return; } flushComposition(prev); updateComp({lead:'', vowel: ch, tail:''}); return; }
        if(prev.lead && !prev.vowel){ updateComp({...prev, vowel: ch}); return; }
        if(!prev.lead){ setAnswer(a=> a + ch); return; }
        flushComposition(prev); setAnswer(a=> a + ch); return;
      }
      if(CHO.includes(ch)){
        if(!prev.lead){ updateComp({...prev, lead: ch}); return; }
        if(prev.lead && !prev.vowel){ flushComposition(prev); updateComp({lead: ch, vowel:'', tail:''}); return; }
        if(prev.lead && prev.vowel && !prev.tail){ if(JONG.includes(ch)){ updateComp({...prev, tail: ch}); return; } flushComposition(prev); updateComp({lead: ch, vowel:'', tail:''}); return; }
        if(prev.lead && prev.vowel && prev.tail){ const combined = combineJong(prev.tail, ch); if(combined){ updateComp({...prev, tail: combined}); return; } flushComposition(prev); updateComp({lead: ch, vowel:'', tail:''}); return; }
      }
      flushComposition(prev); setAnswer(a=> a + ch);
  } catch { /* ignore */ }
  }

  function handleHint(){ let nextv=null; try{ const cur = Number(localStorage.getItem(hintStorageKey) || '0') || 0; if(step <= 3){ nextv = cur + 1; localStorage.setItem(hintStorageKey, String(nextv)); setHintCount(nextv); } } catch { /* ignore */ } setShowHint(true); try{ if(step <= 3) tracker?.markHint && tracker.markHint(); } catch { /* ignore */ } }

  // show the TapHint visually for a short period, then hide it again
  function handleHintWithAutoHide(){
    if(hintTimerRef.current){ clearTimeout(hintTimerRef.current); hintTimerRef.current = null; }
    handleHint();
    try{ hintTimerRef.current = setTimeout(()=>{ setShowHint(false); hintTimerRef.current = null; }, 6000); } catch { /* ignore */ }
  }

  return (
    <div className={frameStyles.framePage}>
      <BackButton to="/kakao/practice" variant="fixed" />
      <header className={frameStyles.frameHeader} ref={headerRef}>
        <h1 className={`${frameStyles.frameTitle} ${lt.withAccent}`}>
          <span className="titleText">친구 추가하기 (아이디)</span>
          <span className={frameStyles.inlineTagline}>친구를 아이디로 추가하는 방법을 연습합니다.</span>
        </h1>
      </header>
      <div className={frameStyles.lessonRow}>
        <div className={frameStyles.deviceCol} ref={shellAreaRef}>
          <div ref={shellRef}>
            <PhoneFrame image={step===1? kaddid : (step===2? kaddid1 : (step===3? kaddid2 : (step===4? kaddid3 : kaddid4)))} screenWidth={'278px'} aspect={'278 / 450'} scale={1}>
              {
                (() => {
                  const raw = (tapHintConfig && tapHintConfig[step]);
                  const overrides = Array.isArray(raw) ? raw : [raw || {}];
                  const defaultProps = {
                    selector: 'button[aria-label="메시지 보내기"]',
                    width: step === 1 ? '279px' : step === 2 ? '180px' : step === 3 ? '60px' : '18%',
                    height: step === 1 ? '59px' : step === 2 ? '25px' : step === 3 ? '30px' : '8%',
                    offsetX: step === 1 ? 0 : step === 2 ? 38 : step === 3 ? 0 : 0,
                    offsetY: step === 1 ? 212 : step === 2 ? -67.5 : step === 3 ? 0 : 0,
                    borderRadius: '10px',
                    suppressInitial: step === total,
                    ariaLabel: '전송 버튼 힌트'
                  };
                  return overrides.map((override, idx) => {
                    const hintProps = { ...defaultProps, ...override };
                    if(hintProps.hidden) return null;
                    const onAct = (override && override.onActivate)
                      ? override.onActivate
                      : (() => {
                        // If we're on the second-to-last step, advance to the final
                        // step (so the user sees 6/6) then show the result shortly
                        // after to finalize.
                        if (step === total - 1) {
                          try{ next(); } catch { /* ignore */ }
                          try{ setTimeout(()=>{ try{ forceShowResult(); } catch { /* ignore */ } }, 350); } catch { /* ignore */ }
                          return;
                        }
                        if (step === total) { try{ forceShowResult(); } catch { /* ignore */ } }
                        else { next(); }
                      });
                    // For practice builds we keep TapHint visually hidden unless the user
                    // explicitly requests a hint (showHint). This ensures the hint markers
                    // don't distract users even if the learn lesson config sets them visible.
                    return (
                      <TapHint key={idx} {...hintProps} onActivate={onAct} invisible={!showHint} />
                    );
                  });
                })()
              }
              {stepsConf.find(s=>s.id===step && s.inputPlaceholder) && (
                <>
                <ChatInputBar
                  value={answer + composePreview()}
                  disabled={!canSubmit}
                  onChange={(val)=>{ setAnswer(val); }}
                  onSubmit={(e)=>{
                    e.preventDefault();
                    flushCompositionRef.current && flushCompositionRef.current();
                    if (step === total) {
                      submitPractice();
                    } else if (step === total - 1) {
                      // advance to last step then finalize so the user sees the final screen
                      try{ next(); } catch { /* ignore */ }
                      try{ setTimeout(()=> submitPractice(), 350); } catch { /* ignore */ }
                    } else {
                      next();
                    }
                  }}
                  offsetBottom={50}
                  offsetX={0}
                  className={frameStyles.inputRightCenter}
                  placeholder={stepsConf.find(s=>s.id===step).inputPlaceholder || '메시지를 입력하세요'}
                  readOnly={keyboardVisible}
                  onFocus={()=>{ setKeyboardVisible(true); }}
                  onBlur={()=>{ /* noop */ }}
                />

                {keyboardVisible && (
                  <VirtualKeyboard
                    allowEnglish={true}
                    onKey={(ch)=>{
                      const now = Date.now();
                      if(lastKeyRef.current.ch === ch && (now - lastKeyRef.current.t) < 120) { return; }
                      lastKeyRef.current = {ch, t: now};
                      try{
                        if(ch === ' ') { flushCompositionRef.current && flushCompositionRef.current(); setAnswer(a=> a + ' '); return; }
                        if(ch === 'return' || ch === '\n') { flushCompositionRef.current && flushCompositionRef.current(); setAnswer(a=> a + '\n'); return; }
                        handleJamoInput(ch);
                      } catch { /* ignore */ }
                    }}
                    onBackspace={() => {
                      try{
                        const ccur = compRef.current;
                        if(ccur.tail){ updateCompFn(c=> ({...c, tail:''})); return; }
                        if(ccur.vowel){ updateCompFn(c=> ({...c, vowel:''})); return; }
                        if(ccur.lead){ updateCompFn(c=> ({...c, lead:''})); return; }
                        setAnswer(a => a.slice(0,-1));
                      } catch { /* ignore */ }
                    }}
                    onEnter={() => { flushCompositionRef.current && flushCompositionRef.current(); setAnswer(a=> a + '\n'); }}
                  />
                )}
                </>
              )}
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
