import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
import VirtualKeyboard from '../../components/VirtualKeyboard/VirtualKeyboard';
import frameStyles from '../Sms/SmsLessonFrame.module.css';
import lt from '../../styles/learnTitle.module.css';
import chatInputStyles from '../../components/ChatInputBar/ChatInputBar.module.css';
import { buildCallLessonConfig, topicMeta } from './callDynamicSteps.js';
import { useScoringProgress } from '../../lib/useScoringProgress';
import { ChapterDomain, getChapterId } from '../../lib/chapters';

export default function CallFacePractice(){
  const navigate = useNavigate();
  const meta = topicMeta.face;

  // Load face and fix screens to mimic learn: override first 1~3 images with fix
  const { steps: faceRawSteps, screens: faceScreens } = useMemo(() => buildCallLessonConfig('face'), []);
  const { screens: fixScreens } = useMemo(() => buildCallLessonConfig('fix'), []);

  // Steps remap like CallFaceLesson: remove original step 3 and then remove new step 5
  const steps = useMemo(() => {
    const filtered = (faceRawSteps || []).filter(s => s.id !== 3);
    const remapped = filtered.map((s, idx) => ({ ...s, id: idx + 1 }));
    const removedStep5 = remapped.filter(s => s.id !== 5);
    const finalRemap = removedStep5.map((s, idx) => ({ ...s, id: idx + 1 }));
    return finalRemap.map(s => (s.id === 2 ? { ...s, inputPlaceholder: '수정할 내용을 입력하세요' } : s));
  }, [faceRawSteps]);

  const total = steps.length || 5;
  const [step, setStep] = useState(1);
  const current = useMemo(() => steps.find(s => s.id === step) || steps[0] || {}, [steps, step]);

  // Timer & scoring
  const chapterId = getChapterId(ChapterDomain.CALL, 3); // assume face topic index = 3
  const scoringHook = useScoringProgress({ user: null, chapterId, expertTimeSec: 35, stepsRequired: total, shouldSave: () => true });
  const tracker = scoringHook?.tracker;
  const finalizeAndSave = scoringHook?.finalizeAndSave;

  const startedAtRef = useRef(null);
  const timerRef = useRef(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  useEffect(()=>{
    startedAtRef.current = Date.now();
    setElapsedSec(0);
    timerRef.current = setInterval(()=>{
      const start = startedAtRef.current || Date.now();
      setElapsedSec(Math.floor((Date.now()-start)/1000));
    },250);
    try{ tracker?.start && tracker.start(); } catch {/* ignore */}
    return ()=>{ if(timerRef.current) clearInterval(timerRef.current); try{ tracker?.end && tracker.end(); } catch {/* ignore */} };
  }, [tracker]);
  function formatTime(sec){ const m=Math.floor(sec/60).toString().padStart(2,'0'); const s=Math.floor(sec%60).toString().padStart(2,'0'); return `${m}:${s}`; }
  function formatElapsedForResult(e){ if(e==null||Number.isNaN(Number(e))) return '-'; const n=Number(e); if(n>=60){ const mm=Math.floor(n/60).toString().padStart(2,'0'); const ss=Math.floor(n%60).toString().padStart(2,'0'); return `${mm}:${ss}`; } const s=Math.floor(n); const cs=Math.round((n-s)*100).toString().padStart(2,'0'); return `${s}초 ${cs}`; }

  // Hint usage (show TapHint only after pressing hint)
  const [showHint, setShowHint] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const hintKey = 'practiceHintCount:call:face';
  useEffect(()=>{ try{ localStorage.setItem(hintKey,'0'); } catch { /* ignore */ } setHintCount(0); return ()=>{ try{ localStorage.removeItem(hintKey); } catch { /* ignore */ } }; }, []);
  function useHint(){ try{ const cur=Number(localStorage.getItem(hintKey)||'0')||0; const next=cur+1; localStorage.setItem(hintKey,String(next)); setHintCount(next);} catch { /* ignore */ } setShowHint(true); try{ tracker?.markHint && tracker.markHint(); } catch { /* ignore */ } }
  useEffect(()=>{ setShowHint(false); }, [step]);

  // Face-specific UI state (mirrors learn)
  const [step2Upgraded, setStep2Upgraded] = useState(false);
  const [step4Upgraded, setStep4Upgraded] = useState(false);
  const [typedInStep2, setTypedInStep2] = useState(false);
  const [step2KeyPressCount, setStep2KeyPressCount] = useState(0);
  const [step2BottomText, setStep2BottomText] = useState('');
  const [step2TypedValue, setStep2TypedValue] = useState('');
  const [isStep3Active, setIsStep3Active] = useState(false);
  const [isStep5Active, setIsStep5Active] = useState(false);
  const [randName, setRandName] = useState('');
  const [randPhone, setRandPhone] = useState('');

  // VK key press count (ignores mode/shift)
  useEffect(()=>{
    function handlePointer(e){
      const spans = Array.from(document.querySelectorAll('span'));
      const progressSpan = spans.find(sp => (sp.textContent||'').trim() === `2 / ${total}`);
      if(!progressSpan) return;
      const kbRoot = e.target.closest?.('[data-virtual-keyboard="1"]');
      if(!kbRoot) return;
      const btn = e.target.closest('button');
      if(!btn) return;
      const label=(btn.getAttribute('aria-label')||btn.textContent||'').trim();
      if(['123','ABC','#+=','한','⇧'].includes(label)) return;
      setStep2KeyPressCount(c=>c+1);
    }
    window.addEventListener('pointerdown', handlePointer, true);
    return ()=> window.removeEventListener('pointerdown', handlePointer, true);
  }, [total]);

  // Upgrade image on first real input (step 2)
  useEffect(()=>{ if(step2KeyPressCount>=1 && !step2Upgraded){ setStep2Upgraded(true); } }, [step2KeyPressCount, step2Upgraded]);

  // After entering step 4, upgrade image after 1s
  useEffect(()=>{
    let pollTimer; let upgradeTimer;
    function poll(){
      const spans = Array.from(document.querySelectorAll('span'));
      const onStep4 = spans.some(sp => ((sp.textContent||'').trim() === `4 / ${total}`));
      if(onStep4 && !step4Upgraded && !upgradeTimer){ upgradeTimer = window.setTimeout(()=> setStep4Upgraded(true), 1000); }
      pollTimer = window.setTimeout(poll, 180);
    }
    poll();
    return ()=>{ if(pollTimer) window.clearTimeout(pollTimer); if(upgradeTimer) window.clearTimeout(upgradeTimer); };
  }, [total, step4Upgraded]);

  // Step 2 typed state and bottom helper text (no DOM polling)
  // Moved below composition helpers to avoid TDZ on composeStep2Preview

  // Step 3 and 5 random overlays
  useEffect(()=>{
    let timer;
    function poll(){
      const spans = Array.from(document.querySelectorAll('span'));
      const onStep3 = spans.some(sp => ((sp.textContent||'').trim() === `3 / ${total}`));
      const onStep5 = spans.some(sp => ((sp.textContent||'').trim() === `5 / ${total}`));
      setIsStep3Active(onStep3);
      setIsStep5Active(onStep5);
      if(onStep3){
        if(!randName){ const fallback=['김서연','이도윤','박지후','최하윤','정우진','한서준','홍길동','서지후','유하준','노아']; const picked=(step2TypedValue||'').trim(); setRandName(picked.length?picked:fallback[Math.floor(Math.random()*fallback.length)]);} 
        if(!randPhone){ const n4=()=> String(Math.floor(1000+Math.random()*9000)); setRandPhone(`010-${n4()}-${n4()}`);} 
      }
      timer = window.setTimeout(poll, 180);
    }
    poll();
    return ()=>{ if(timer) window.clearTimeout(timer); };
  }, [total, randName, randPhone, step2TypedValue]);

  // Merged screens (like learn): fix overrides for step 1~2, step2 upgrade to face[3], step4 upgrade to face[6]
  const mergedScreens = useMemo(()=>{
    const out = {};
    if(faceScreens){
      out[1] = (fixScreens && fixScreens[1]) ? fixScreens[1] : faceScreens[1];
      out[2] = step2Upgraded
        ? ((fixScreens && fixScreens[3]) ? fixScreens[3] : faceScreens[3])
        : ((fixScreens && fixScreens[2]) ? fixScreens[2] : faceScreens[2]);
      out[3] = faceScreens[4];
      out[4] = step4Upgraded ? faceScreens[6] : faceScreens[5];
      if(total >= 5){ out[5] = faceScreens[7]; }
    }
    return out;
  }, [faceScreens, fixScreens, step2Upgraded, step4Upgraded, total]);

  // ---- Step 2: VirtualKeyboard + Hangul composition (simple parity with other practices) ----
  const CHO = useMemo(()=>['\u0000','ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'], []);
  const JUNG = useMemo(()=>['\u0000','ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'], []);
  const JONG = useMemo(()=>['\u0000','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'], []);
  const VCOMB = { 'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ' };
  const JCOMB = { 'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ' };
  const [step2Comp, setStep2Comp] = useState({ lead:'', vowel:'', tail:'' });
  const step2CompRef = useRef(step2Comp);
  useEffect(()=>{ step2CompRef.current = step2Comp; }, [step2Comp]);
  const combineVowel = (a,b)=> (a && b ? (VCOMB[a+b]||null) : null);
  const combineJong = (a,b)=> (a && b ? (JCOMB[a+b]||null) : null);
  const composeStep2Preview = React.useCallback((snap)=>{ const src = snap || step2Comp; const {lead,vowel,tail} = src; if(!lead && !vowel && !tail) return ''; if(!lead && vowel) return vowel; const L = CHO.indexOf(lead); const Vv = JUNG.indexOf(vowel); const Tt = JONG.indexOf(tail); if(L>0 && Vv>0){ return String.fromCharCode(0xAC00 + (L-1)*21*28 + (Vv-1)*28 + (Tt>=0?Tt:0)); } return (lead||'') + (vowel||'') + (tail||''); }, [step2Comp, CHO, JUNG, JONG]);
  function flushStep2(snapshot){ const snap = snapshot || step2CompRef.current; const {lead,vowel,tail} = snap; setStep2Comp({lead:'', vowel:'', tail:''}); if(!lead && !vowel && !tail) return; if(!lead && vowel){ setStep2TypedValue(a=> (a||'') + vowel); return; } const L = CHO.indexOf(lead); const Vv = JUNG.indexOf(vowel); const Tt = JONG.indexOf(tail); if(L>0 && Vv>0){ const syll = String.fromCharCode(0xAC00 + (L-1)*21*28 + (Vv-1)*28 + (Tt>=0?Tt:0)); setStep2TypedValue(a=> (a||'') + syll); } else { setStep2TypedValue(a=> (a||'') + (lead||'') + (vowel||'') + (tail||'')); } }
  function handleStep2JamoInput(ch){ const prev = step2CompRef.current; if(JUNG.includes(ch)){ if(prev.tail){ const isCompositeTail = Object.values(JCOMB).includes(prev.tail); if(isCompositeTail){ let left=null,right=null; for(const k in JCOMB){ if(JCOMB[k]===prev.tail){ left=k.charAt(0); right=k.charAt(1); break; } } if(left && right){ flushStep2({lead: prev.lead, vowel: prev.vowel, tail: left}); setStep2Comp({lead: right, vowel: ch, tail:''}); return; } flushStep2(prev); setStep2Comp({lead:'', vowel: ch, tail:''}); return; } const tailChar = prev.tail; flushStep2({lead: prev.lead, vowel: prev.vowel, tail:''}); setStep2Comp({lead: tailChar, vowel: ch, tail:''}); return; } if(prev.lead && prev.vowel){ const comb2 = combineVowel(prev.vowel, ch); if(comb2){ setStep2Comp({...prev, vowel: comb2}); return; } flushStep2(prev); setStep2Comp({lead:'', vowel: ch, tail:''}); return; } if(prev.lead && !prev.vowel){ setStep2Comp({...prev, vowel: ch}); return; } if(!prev.lead){ setStep2TypedValue(a=> (a||'') + ch); return; } flushStep2(prev); setStep2TypedValue(a=> (a||'') + ch); return; }
    if(CHO.includes(ch)){ if(!prev.lead){ setStep2Comp({...prev, lead: ch}); return; } if(prev.lead && !prev.vowel){ flushStep2(prev); setStep2Comp({lead: ch, vowel:'', tail:''}); return; } if(prev.lead && prev.vowel && !prev.tail){ if(JONG.includes(ch)){ setStep2Comp({...prev, tail: ch}); return; } flushStep2(prev); setStep2Comp({lead: ch, vowel:'', tail:''}); return; } if(prev.lead && prev.vowel && prev.tail){ const comb3 = combineJong(prev.tail, ch); if(comb3){ setStep2Comp({...prev, tail: comb3}); return; } flushStep2(prev); setStep2Comp({lead: ch, vowel:'', tail:''}); return; } }
    flushStep2(prev); setStep2TypedValue(a=> (a||'') + ch); }
  function backspaceStep2(){ const c = step2CompRef.current; if(c.tail){ setStep2Comp({...c, tail:''}); return; } if(c.vowel){ setStep2Comp({...c, vowel:''}); return; } if(c.lead){ setStep2Comp({...c, lead:''}); return; } setStep2TypedValue(v=> (v||'').slice(0,-1)); }

  // Step 2 typed state and bottom helper text (no DOM polling)
  useEffect(()=>{
    const preview = composeStep2Preview();
    const hasText = (step2TypedValue + preview).trim().length > 0;
    if(!typedInStep2 && hasText) setTypedInStep2(true);
    if(step2KeyPressCount > 2){ setStep2BottomText((step2TypedValue + preview).trim()); }
    else { setStep2BottomText(''); }
  }, [step2TypedValue, step2KeyPressCount, composeStep2Preview, typedInStep2]);

  // TapHint configuration (like learn)
  const tapHintConfig = {
    1: { selector: null, x:'50%', y:'16.5%', width:'250px', height:'30px', borderRadius:'0%', offsetX:0, offsetY:0 },
    2: step2BottomText ? { selector:null, x:'50%', y:'16.5%', width:'250px', height:'30px', borderRadius:'0%', offsetX:0, offsetY:0 } : { hidden:true },
    3: { selector:null, x:'62%', y:'38.75%', width:'64px', height:'46px', borderRadius:'25%', offsetX:0, offsetY:0 },
    // 4단계: 탭힌트 누르면 바로 점수 모달(종료)
    4: step4Upgraded ? { selector:null, x:'87.25%', y:'17.5%', width:'40px', height:'40px', borderRadius:'50%', offsetX:0, offsetY:0, onActivate:()=> finalizePractice() } : { hidden:true },
    5: { selector:null, x:'91.5%', y:'9.25%', width:'38px', height:'24px', borderRadius:'25%', offsetX:0, offsetY:0 }
  };

  function renderTapHint(){
    const cfg = tapHintConfig[step];
    if(!cfg || cfg.hidden) return null;
    let onActivate;
    if(cfg.onActivate){
      onActivate = cfg.onActivate;
    } else if(step === 2){
      onActivate = ()=>{ try{ flushStep2(); } catch { /* ignore */ } next(); };
    } else if(step === 4){
      onActivate = ()=> finalizePractice();
    } else if(step === total){
      onActivate = ()=> finalizePractice();
    } else {
      onActivate = next;
    }
    return (
      <TapHint
        {...cfg}
        onActivate={onActivate}
        suppressInitial={false}
        invisible={!showHint}
      />
    );
  }

  // device overlays: disable ChatInputBar in face practice and provide cursor-like overlay + random name/phone display
  const extraOverlay = (
    <>
      <style>{`
        .${chatInputStyles.chatInputBarAbsolute}, .${chatInputStyles.chatInputBarSticky} { display: none !important; }
        @keyframes faceCursorBlink { 0%{opacity:1;} 49.9%{opacity:1;} 50%{opacity:0;} 100%{opacity:0;} }
        div[style*="z-index: 123"]::after { content:''; display:inline-block; width:2px; height:1.05em; margin-left:2px; vertical-align:text-bottom; background:#2980ff; border-radius:1.5px; animation:faceCursorBlink .9s steps(2,start) infinite; }
      `}</style>
      {step === 2 && (
        <div aria-hidden style={{position:'absolute', left:'13%', top:'4%', transform:'none', width:'88%', color:'#111', fontSize:'13px', fontWeight:300, textAlign:'left', whiteSpace:'nowrap', zIndex:123}}>
          {step2TypedValue}{composeStep2Preview()}
        </div>
      )}
      {(step === 2 && step2BottomText) && (
        <div role="button" aria-label="보조 텍스트 - 다음으로 이동" onClick={()=>{ try{ flushStep2(); } catch { /* ignore */ } next(); }}
          style={{position:'absolute', left:'6%', top:'15%', transform:'none', width:'88%', maxWidth:'88%', color:'#111', fontSize:'14px', fontWeight:400, textAlign:'left', whiteSpace:'nowrap', zIndex:124, pointerEvents:'auto', cursor:'pointer'}}>
          {step2BottomText}
        </div>
      )}
      {isStep3Active && randName && (
        <div aria-hidden style={{position:'absolute', left:'50%', top:'24%', transform:'translateX(-50%)', width:'84%', whiteSpace:'normal', fontSize:'30px', fontWeight:300, color:'#ffffffff', textAlign:'center', overflow:'hidden', zIndex:125}}>{randName}</div>
      )}
      {isStep3Active && randPhone && (
        <div aria-hidden style={{position:'absolute', left:'7%', top:'65%', transform:'none', minWidth:'40px', maxWidth:'84%', whiteSpace:'nowrap', fontSize:'13px', fontWeight:300, color:'#0073ffff', textAlign:'left', overflow:'hidden', zIndex:125}}>{randPhone}</div>
      )}
      {isStep5Active && randName && (
        <div aria-hidden style={{position:'absolute', left:'50%', top:'24%', transform:'translateX(-50%)', width:'84%', whiteSpace:'normal', fontSize:'30px', fontWeight:300, color:'#ffffffff', textAlign:'center', overflow:'hidden', zIndex:125}}>{randName}</div>
      )}
      {isStep5Active && randPhone && (
        <div aria-hidden style={{position:'absolute', left:'7%', top:'65%', transform:'none', minWidth:'40px', maxWidth:'84%', whiteSpace:'nowrap', fontSize:'13px', fontWeight:300, color:'#0073ffff', textAlign:'left', overflow:'hidden', zIndex:125}}>{randPhone}</div>
      )}
    </>
  );

  // Wrong-click popup
  const [showWrongPopup, setShowWrongPopup] = useState(false);
  function handleDeviceClickCapture(e){
    try{
      const path = e.nativeEvent?.composedPath ? e.nativeEvent.composedPath() : [];
      const allowByNode = (node)=>{
        try{
          if(!node) return false;
          if(node.getAttribute){
            const th = node.getAttribute('data-tap-hint'); if(th==='1') return true;
            const vk = node.getAttribute('data-virtual-keyboard'); if(vk==='1') return true;
            const al = (node.getAttribute('aria-label')||''); if(al.includes('힌트')) return true; if(al.includes('보조 텍스트')) return true;
          }
          if(node.closest){ if(node.closest('[data-tap-hint="1"]')) return true; if(node.closest('[data-virtual-keyboard="1"]')) return true; if(node.closest('[aria-label*="힌트"]')) return true; if(node.closest('[aria-label*="보조 텍스트"]')) return true; }
  } catch { /* ignore */ }
        return false;
      };
      if(path && path.length){ for(const n of path){ if(allowByNode(n)) return; } }
      else { const tgt=e.target; if(allowByNode(tgt)) return; }
    } catch { /* ignore */ }
    e.stopPropagation(); e.preventDefault();
    try{ tracker?.markError && tracker.markError(step); } catch { /* ignore */ }
    setShowWrongPopup(true);
  }

  // Step navigation and finalize
  function next(){ try{ tracker?.markCorrect && tracker.markCorrect(step); } catch { /* ignore */ } setStep(s=> Math.min(total, s+1)); }

  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  async function finalizePractice(){
  try{ tracker?.markCorrect && tracker.markCorrect(step); } catch { /* ignore */ }
  if(step < total){ for(let i=step+1;i<=total;i++){ try{ tracker?.markCorrect && tracker.markCorrect(i); } catch { /* ignore */ } } }
  try{ tracker?.end && tracker.end(); } catch { /* ignore */ }
    let res=null;
  try{ res = await finalizeAndSave(); } catch { /* ignore */ }
  if(!res){ try{ res={ score: tracker?.scoreNow ? tracker.scoreNow() : null }; } catch { /* ignore */ } }
  try{ const ms = startedAtRef.current ? (Date.now()-startedAtRef.current) : 0; const sec = Math.round(ms/10)/100; if(res){ res.score = res.score||{}; res.score.derived = { ...(res.score.derived||{}), elapsedSec: sec }; } } catch { /* ignore */ }
  try{ localStorage.setItem('practiceScore:call:face', JSON.stringify(res?.score ?? null)); } catch { /* ignore */ }
    setResult(res);
  }

  return (
    <div className={frameStyles.framePage}>
      <BackButton to="/call/practice" variant="fixed" />
      <header className={frameStyles.frameHeader}>
        <h1 className={`${frameStyles.frameTitle} ${lt.withAccent}`}>
          <span className="titleText">{meta.title} 연습</span>
          <span className={frameStyles.inlineTagline}>{meta.tagline}</span>
        </h1>
      </header>
      <div className={frameStyles.lessonRow}>
        <div className={frameStyles.deviceCol} onClickCapture={handleDeviceClickCapture}>
          <PhoneFrame image={mergedScreens[step] || mergedScreens[1]} screenWidth={'278px'} aspect={'278 / 450'} scale={1}>
            <style>{`
              .${chatInputStyles.chatInputBarAbsolute}, .${chatInputStyles.chatInputBarSticky} { display: none !important; }
            `}</style>
            {renderTapHint()}
            {extraOverlay}
            {step === 2 && (
              <VirtualKeyboard
                allowEnglish={false}
                onKey={(ch)=>{ handleStep2JamoInput(ch); setStep2KeyPressCount(c=>c+1); if(ch && String(ch).trim().length>0) setTypedInStep2(true); }}
                onBackspace={()=>{ backspaceStep2(); setStep2KeyPressCount(c=>c+1); }}
                onEnter={()=>{ flushStep2(); }}
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
            {/* No nav buttons; proceed with TapHint only */}
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
                  <button type="button" onClick={()=> setShowDetails(s=>!s)} className={frameStyles.ghostBtn} aria-expanded={showDetails} aria-controls="call-face-result-details" style={{ padding:'6px 10px', fontSize:13 }}>{showDetails ? '세부점수 숨기기' : '세부점수 보기'}</button>
                  <div style={{ color:'#666', fontSize:13 }}>시간: {formatElapsedForResult(result?.score?.derived?.elapsedSec)}</div>
                </div>
              </div>
            </div>
            {showDetails && (
              <div id="call-face-result-details" style={{ marginTop:14, padding:12, borderRadius:8, background:'#fafafa', border:'1px solid #eee' }}>
                <strong>세부 점수</strong>
                <div style={{ marginTop:8 }}>
                  <div>시간 점수: {result?.score?.breakdown?.timeScore ?? '-'} / 30</div>
                  <div>정확도 점수: {result?.score?.breakdown?.errorScore ?? '-'} / 20</div>
                  <div>성공 점수: {result?.score?.breakdown?.successScore ?? '-'} / 50</div>
                  <div>부분 진행 보너스: {result?.score?.breakdown?.progressBonus ?? '-'}/ 10</div>
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
