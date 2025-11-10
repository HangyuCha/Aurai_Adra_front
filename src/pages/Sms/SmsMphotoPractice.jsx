import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScoringProgress } from '../../lib/useScoringProgress';
import { getChapterId, ChapterDomain } from '../../lib/chapters';
import api from '../../lib/api';
import BackButton from '../../components/BackButton/BackButton';
import frameStyles from './SmsLessonFrame.module.css';
import lt from '../../styles/learnTitle.module.css';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
import ChatInputBar from '../../components/ChatInputBar/ChatInputBar';
import VirtualKeyboard from '../../components/VirtualKeyboard/VirtualKeyboard';
import screenshot4 from '../../assets/msend4.png';
import mpho1 from '../../assets/mpho1.png';
import mpho2 from '../../assets/mpho2.png';
import mpho3 from '../../assets/mpho3.png';
import mpho4 from '../../assets/mpho4.png';
import mpho5 from '../../assets/mpho5.png';
import stepsConfig from './SmsMphotoLessonSteps.js';

export default function SmsMphotoPractice(){
  // Copy of the learn flow for practice. Do not modify learn files.
  const [step, setStep] = useState(1);
  const steps = stepsConfig;
  const total = steps.length;
  const shellRef = useRef(null);
  const shellAreaRef = useRef(null);
  const [isSide, setIsSide] = useState(false);
  const captionRef = useRef(null);
  const headerRef = useRef(null);
  const [_scale, setScale] = useState(1);
  const [_deviceWidth, setDeviceWidth] = useState(null);
  const [answer, setAnswer] = useState('');
  const [comp, setComp] = useState({lead:'', vowel:'', tail:''});
  const compRef = useRef({lead:'', vowel:'', tail:''});

  function updateComp(next){ setComp(next); compRef.current = next; }
  function updateCompFn(fn){ setComp(prev=>{ const next = fn(prev); compRef.current = next; return next; }); }
  const [_feedback, setFeedback] = useState('');
  const [_speaking, setSpeaking] = useState(false);
  const [_autoPlayed, setAutoPlayed] = useState(false);
  const [voices, setVoices] = useState([]);
  const navigate = useNavigate();
  const current = steps.find(st => st.id === step) || steps[0];
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const lastKeyRef = useRef({ch:null, t:0});
  const [submittedText, setSubmittedText] = useState('');
  const [useSubmittedScreenshot, setUseSubmittedScreenshot] = useState(false);

  const CHO = ['\u0000','ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const JUNG = ['\u0000','ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
  const JONG = ['\u0000','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const VCOMB = { 'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ' };
  const JCOMB = { 'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ' };

  function combineVowel(a,b){ if(!a||!b) return null; const key = `${a}${b}`; return VCOMB[key]||null; }
  function combineJong(a,b){ if(!a||!b) return null; const key = `${a}${b}`; return JCOMB[key]||null; }

  function flushComposition(snapshot){ const {lead, vowel, tail} = snapshot || compRef.current; updateComp({lead:'', vowel:'', tail:''}); if(!lead && !vowel && !tail) return; if(!lead && vowel){ setAnswer(a=> a + vowel); return; } const L = CHO.indexOf(lead) >= 0 ? CHO.indexOf(lead) : -1; const V = JUNG.indexOf(vowel) >= 0 ? JUNG.indexOf(vowel) : -1; const T = JONG.indexOf(tail) >= 0 ? JONG.indexOf(tail) : 0; if(L>0 && V>0){ const syll = String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T)); setAnswer(a=> a + syll); } else { const raw = (lead||'') + (vowel||'') + (tail||''); setAnswer(a=> a + raw); } }

  function getCommittedFromComp(snapshot){ const {lead, vowel, tail} = snapshot || compRef.current; if(!lead && !vowel && !tail) return ''; if(!lead && vowel) return vowel; const L = CHO.indexOf(lead) >= 0 ? CHO.indexOf(lead) : -1; const V = JUNG.indexOf(vowel) >= 0 ? JUNG.indexOf(vowel) : -1; const T = JONG.indexOf(tail) >= 0 ? JONG.indexOf(tail) : 0; if(L>0 && V>0){ return String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T)); } return (lead||'') + (vowel||'') + (tail||''); }

  function handleJamoInput(ch){ setFeedback(''); const prev = compRef.current; if(JUNG.includes(ch)){ if(prev.tail){ const isCompositeTail = Object.values(JCOMB).includes(prev.tail); if(isCompositeTail){ let left=null,right=null; for(const k in JCOMB){ if(JCOMB[k]===prev.tail){ left=k.charAt(0); right=k.charAt(1); break; } } if(left && right){ const snapLeft = {lead: prev.lead, vowel: prev.vowel, tail: left}; flushComposition(snapLeft); updateComp({lead: right, vowel: ch, tail: ''}); return; } flushComposition(prev); updateComp({lead:'', vowel: ch, tail: ''}); return; } const tailChar = prev.tail; const snap2 = {lead: prev.lead, vowel: prev.vowel, tail: ''}; flushComposition(snap2); updateComp({lead: tailChar, vowel: ch, tail: ''}); return; } if(prev.lead && prev.vowel){ const comb = combineVowel(prev.vowel, ch); if(comb){ updateComp({...prev, vowel: comb}); return; } flushComposition(prev); updateComp({lead:'', vowel: ch, tail:''}); return; } if(prev.lead && !prev.vowel){ updateComp({...prev, vowel: ch}); return; } if(!prev.lead){ setAnswer(a=> a + ch); return; } flushComposition(prev); setAnswer(a=> a + ch); return; } if(CHO.includes(ch)){ if(!prev.lead){ updateComp({...prev, lead: ch}); return; } if(prev.lead && !prev.vowel){ flushComposition(prev); updateComp({lead: ch, vowel:'', tail:''}); return; } if(prev.lead && prev.vowel && !prev.tail){ if(JONG.includes(ch)){ updateComp({...prev, tail: ch}); return; } flushComposition(prev); updateComp({lead: ch, vowel:'', tail:''}); return; } if(prev.lead && prev.vowel && prev.tail){ const combined = combineJong(prev.tail, ch); if(combined){ updateComp({...prev, tail: combined}); return; } flushComposition(prev); updateComp({lead: ch, vowel:'', tail:''}); return; } } flushComposition(prev); setAnswer(a=> a + ch); return; }

  function composePreview(){ const {lead, vowel, tail} = comp; if(!lead && !vowel && !tail) return ''; if(!lead && vowel) return vowel; const L = CHO.indexOf(lead) >= 0 ? CHO.indexOf(lead) : -1; const V = JUNG.indexOf(vowel) >= 0 ? JUNG.indexOf(vowel) : -1; const T = JONG.indexOf(tail) >= 0 ? JONG.indexOf(tail) : 0; if(L>0 && V>0){ return String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T)); } return (lead||'') + (vowel||'') + (tail||''); }

  const canSubmit = (answer + composePreview()).trim().length > 0;

  

  const onSubmitAnswer = (e) => { e.preventDefault(); submitAnswer(); };

  function submitAnswer() {
    const commit = getCommittedFromComp(compRef.current);
    const final = (answer + commit).trim();
    if (!(step === total && final.length > 0)) return;
    if (commit) setAnswer(a => a + commit);
    updateComp({ lead: '', vowel: '', tail: '' });
    setFeedback('좋아요. 잘 입력되었어요.');
    setSubmittedText(final);
    setUseSubmittedScreenshot(true);
    setAnswer('');

    if (step === total && 'speechSynthesis' in window) {
      try {
        const msg = current.completionSpeak || '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?';
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(msg);
        u.lang = 'ko-KR';
        u.rate = 1;
        try {
          const pref = (localStorage.getItem('voice') || 'female');
          const v = pickPreferredVoice(pref, voices);
          if (v) u.voice = v;
        } catch (e) { void e; }
        u.onend = () => setSpeaking(false);
        u.onerror = () => setSpeaking(false);
        setSpeaking(true);
        window.speechSynthesis.speak(u);
      } catch (e) { void e; }
    }
  }

  useEffect(() => {
    setAnswer('');
    setFeedback('');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
    setAutoPlayed(false);

    const timer = setTimeout(() => {
      if ('speechSynthesis' in window) {
        const base = (Array.isArray(current.speak) ? current.speak.join(' ') : current.speak) || current.instruction;
        if (base) {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(base);
          u.lang = 'ko-KR';
          u.rate = 1;
          try {
            const pref = (localStorage.getItem('voice') || 'female');
            const v = pickPreferredVoice(pref, voices);
            if (v) u.voice = v;
          } catch (e) { void e; }
          u.onend = () => { setSpeaking(false); setAutoPlayed(true); };
          u.onerror = () => { setSpeaking(false); setAutoPlayed(true); };
          setSpeaking(true);
          window.speechSynthesis.speak(u);
        }
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [step, current, voices]);

  useEffect(()=>()=>{ if('speechSynthesis' in window) window.speechSynthesis.cancel(); }, []);
  useEffect(()=>{ if(step === total){ setKeyboardVisible(true); } }, [step, total]);
  useEffect(()=>{ if(!('speechSynthesis' in window)) return; function loadVoices(){ const list = window.speechSynthesis.getVoices(); if(list && list.length){ setVoices(list); } } loadVoices(); window.speechSynthesis.addEventListener('voiceschanged', loadVoices); return ()=> window.speechSynthesis.removeEventListener('voiceschanged', loadVoices); },[]);

  // fetch user (optional) for scoring hook
  const [user, setUser] = useState(null);
  useEffect(() => {
    const raw = localStorage.getItem('accessToken');
    if (!raw) return;
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/users/me');
        if (mounted) setUser(data);
      } catch (e) { void e; }
  })();
    return () => { mounted = false; };
  }, []);

  // scoring hook (local tracker + finalize function)
  const chapterId = getChapterId(ChapterDomain.SMS, 0);
  const scoringHook = useScoringProgress({ user, chapterId, expertTimeSec: 20, stepsRequired: total, shouldSave: () => true });
  const tracker = scoringHook?.tracker;
  const finalizeSave = scoringHook?.finalizeAndSave;


  function pickPreferredVoice(pref, all){ if(!all || !all.length) return null; const ko = all.filter(v=> (v.lang||'').toLowerCase().startsWith('ko')); if(!ko.length) return null; const maleKeys = ['male','남','man','boy','seong','min']; const femaleKeys = ['female','여','woman','girl','yuna','ara']; const wantMale = pref === 'male'; const keys = wantMale ? maleKeys : femaleKeys; const primary = ko.find(v=> keys.some(k=> (v.name||'').toLowerCase().includes(k)) ); if(primary) return primary; return ko[ wantMale ? (ko.length>1 ? 1 : 0) : 0 ]; }

  const [showDev,setShowDev] = useState(false);
  const [devPos,setDevPos] = useState({x:0,y:0});
  useEffect(()=>{ function key(e){ if(e.key==='d'){ setShowDev(s=>!s); } } window.addEventListener('keydown', key); return ()=> window.removeEventListener('keydown', key); },[]);

  useLayoutEffect(()=>{ function recalc(){ const vw = window.innerWidth; const vh = window.innerHeight; const headerH = headerRef.current?.offsetHeight || 0; const captionH = captionRef.current?.offsetHeight || 0; const side = window.innerWidth >= 1100; setIsSide(side); const verticalPadding = 84; const horizontalPadding = 40; const availH = Math.max(160, vh - headerH - (side ? 0 : captionH) - verticalPadding); if(shellAreaRef.current){ shellAreaRef.current.style.minHeight = `${availH}px`; } const availW = Math.max(200, vw - horizontalPadding); if(!shellRef.current) return; const el = shellRef.current; const prevTransform = el.style.transform; el.style.transform = 'none'; const rect = el.getBoundingClientRect(); const baseW = rect.width || 1; const baseH = rect.height || 1; const ratioH = availH / baseH; const ratioW = availW / baseW; let next = Math.min(1, ratioH, ratioW); if(side && captionRef.current){ const captionW = captionRef.current.getBoundingClientRect().width; const gap = 32; const required = baseW + gap + captionW; const available = vw - horizontalPadding; if(required > available){ const shrink = available / required; next = Math.min(next, shrink); } } if(!isFinite(next) || next <= 0) next = 1; if(next < 0.5) next = 0.5; const finalScale = Math.abs(next - 1) < 0.002 ? 1 : next; setScale(finalScale); if(side && finalScale < 1){ setDeviceWidth(Math.round(baseW * finalScale)); el.style.transform = 'none'; } else { setDeviceWidth(null); el.style.transform = prevTransform; } if(side && finalScale === 1){ const rect2 = el.getBoundingClientRect(); if(rect2.height > availH){ const fullscreenLike = (window.innerHeight >= 820); const targetRatio = availH / rect2.height; let shrink = targetRatio; if(fullscreenLike){ shrink -= 0.035; } if(shrink < 0.99){ shrink = Math.max(0.55, shrink); setDeviceWidth(Math.round(baseW * shrink)); } } } } recalc(); window.addEventListener('resize', recalc); return ()=> window.removeEventListener('resize', recalc); },[]);

  const next = () => {
    // record completion for this step (matches other practice pages)
    try { tracker?.markCorrect && tracker.markCorrect(step); } catch (e) { void e; }
    // hide any visible tap hint for the current step when advancing
    try { setTapHintVisible(false); } catch (e) { void e; }
    try { if (hintTimerRef.current) { clearTimeout(hintTimerRef.current); hintTimerRef.current = null; } } catch (e) { void e; }
    setStep(s => Math.min(total, s+1));
  };

  // Ensure the tap hint is cleared whenever the step changes (so hints don't persist into next step)
  useEffect(() => {
    try { setTapHintVisible(false); } catch (e) { void e; }
    try { if (hintTimerRef.current) { clearTimeout(hintTimerRef.current); hintTimerRef.current = null; } } catch (e) { void e; }
  }, [step]);
  
  // --- practice-only: timer and hint count ---
  const startedAtRef = useRef(null);
  const timerRef = useRef(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  useEffect(()=>{
    startedAtRef.current = Date.now(); setElapsedSec(0);
    timerRef.current = setInterval(()=>{ const start = startedAtRef.current || Date.now(); setElapsedSec(Math.floor((Date.now()-start)/1000)); },250);
  try { tracker?.start && tracker.start(); } catch (e) { void e; }
  return ()=>{ if(timerRef.current) clearInterval(timerRef.current); try { tracker?.end && tracker.end(); } catch (e) { void e; } };
  },[tracker]);

  function formatTime(sec){ const m = Math.floor(sec/60).toString().padStart(2,'0'); const s = Math.floor(sec%60).toString().padStart(2,'0'); return `${m}:${s}`; }

  const [tapHintVisible, setTapHintVisible] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const hintStorageKey = `practiceHintCount:sms:mphoto`;
  const hintTimerRef = useRef(null);
  useEffect(()=>{ try{ const v = Number(localStorage.getItem(hintStorageKey) || '0') || 0; setHintCount(v); } catch (e) { void e; } return ()=>{ try{ localStorage.removeItem(hintStorageKey); } catch (e) { void e; } if(hintTimerRef.current) clearTimeout(hintTimerRef.current); } },[hintStorageKey]);

  function useHint(){
    try{ const cur = Number(localStorage.getItem(hintStorageKey) || '0') || 0; const nextv = cur + 1; localStorage.setItem(hintStorageKey, String(nextv)); setHintCount(nextv); } catch (e) { void e; }
    // show the step's TapHint visually for a short duration so the user can see where to tap
    setTapHintVisible(true);
    if(hintTimerRef.current){ clearTimeout(hintTimerRef.current); hintTimerRef.current = null; }
    try{ hintTimerRef.current = setTimeout(()=>{ setTapHintVisible(false); hintTimerRef.current = null; }, 6000); } catch (e) { void e; }
    // record hint event in tracker (so hintCount contributes to scoring inputsEcho)
    try { tracker?.markHint && tracker.markHint(); } catch (e) { void e; }
  }

  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showWrongPopup, setShowWrongPopup] = useState(false);

  async function submitPractice(showDetails = false){
    // mark final step as correct then end tracker/timer
  try { tracker?.markCorrect && tracker.markCorrect(step); } catch (e) { void e; }
  try { tracker && typeof tracker.end === 'function' && tracker.end(); } catch (e) { void e; }

  // If this submission was triggered from the TapHint on late steps (showDetails === true)
  // and the tracker currently has fewer correct events than required, mark missing steps so
  // the scoring logic recognizes a full-success. This mirrors the user's expectation that
  // tapping the final hint completes the exercise as success.
  try {
    if (showDetails && tracker?.getMetrics) {
      const m = tracker.getMetrics();
      const correctNow = Number(m?.correctCount || 0);
      if (correctNow < total) {
        for (let i = 1; i <= total && (tracker.getMetrics().correctCount < total); i++) {
          try { tracker.markCorrect && tracker.markCorrect(i); } catch (ee) { void ee; }
        }
      }
    }
  } catch (e) { void e; }

    // flush composing jamo
    flushComposition();

    // finalize & compute score
    if (finalizeSave) {
      try {
        const res = await finalizeSave();
        // ensure elapsed in score uses local timer
        try {
          const finalMs = startedAtRef.current ? (Date.now() - startedAtRef.current) : 0;
          const finalSec = Math.round((finalMs / 10)) / 100;
          if (res && res.score) res.score.derived = { ...(res.score.derived || {}), elapsedSec: finalSec };
        } catch (e) { void e; }
  setResult(res);
  // if submitPractice was triggered with showDetails=true, open result details immediately
  if (showDetails) setShowDetails(true);
  try { localStorage.setItem('practiceScore:sms:mphoto', JSON.stringify(res?.score ?? null)); } catch (e) { void e; }
      } catch (e) { void e;
        try {
          const score = tracker?.scoreNow ? tracker.scoreNow() : null;
          try { const finalMs = startedAtRef.current ? (Date.now() - startedAtRef.current) : 0; const finalSec = Math.round((finalMs / 10)) / 100; if (score) score.derived = { ...(score.derived || {}), elapsedSec: finalSec }; } catch (e) { void e; }
          setResult({ score });
          if (showDetails) setShowDetails(true);
          try { localStorage.setItem('practiceScore:sms:mphoto', JSON.stringify(score ?? null)); } catch (e) { void e; }
        } catch (e) { void e; setResult(null); }
      }
    } else {
      try {
        const score = tracker?.scoreNow ? tracker.scoreNow() : null;
  setResult({ score });
  if (showDetails) setShowDetails(true);
  try { localStorage.setItem('practiceScore:sms:mphoto', JSON.stringify(score ?? null)); } catch (e) { void e; }
  } catch (e) { void e; setResult(null); }
    }
  }

  return (
    <div className={frameStyles.framePage}>
      <BackButton to="/sms/practice" variant="fixed" />
      <header className={frameStyles.frameHeader} ref={headerRef}>
        <h1 className={`${frameStyles.frameTitle} ${lt.withAccent}`}>
          <span className="titleText">사진 보내기</span>
          <span className={frameStyles.inlineTagline}>문자 앱으로 사진을 선택하고 전송하는 흐름을 연습합니다.</span>
        </h1>
      </header>
      <div className={frameStyles.lessonRow}>
        <div
          className={frameStyles.deviceCol}
          ref={shellAreaRef}
          onClickCapture={(e) => {
            // mimic SmsMsendPractice behavior: show a 'wrong' popup when user taps unrelated areas
            // Active on steps 1, 2 and the final step (matches msend behavior)
            if (![1, 2, total].includes(step)) return;
            try {
              const path = e.nativeEvent?.composedPath ? e.nativeEvent.composedPath() : (e.nativeEvent && e.nativeEvent.path) || [];
              if (path && path.length) {
                for (const node of path) {
                  if (!node || !node.getAttribute) continue;
                  const al = node.getAttribute('aria-label');
                  if (al === '가상 키보드' || al === '전송 버튼 힌트') return;
                  if (node.tagName === 'BUTTON' && node.getAttribute('aria-label') === '메시지 보내기') return;
                }
              } else {
                const tgt = e.target;
                if (tgt && tgt.closest && (tgt.closest('button[aria-label="메시지 보내기"]') || tgt.closest('[aria-label="가상 키보드"]') || tgt.closest('[aria-label="전송 버튼 힌트"]'))) {
                  return;
                }
              }
            } catch (E) { void E; 
              // defensive fallback: if we can't read composedPath, do a simple closest check
              const tgt = e.target;
              if (tgt && tgt.closest && (tgt.closest('button[aria-label="메시지 보내기"]') || tgt.closest('[aria-label="가상 키보드"]') || tgt.closest('[aria-label="전송 버튼 힌트"]'))) {
                return;
              }
            }
            // otherwise show wrong popup and record error
            e.stopPropagation();
            e.preventDefault();
            try { tracker?.markError && tracker.markError(step); } catch (err) { void err; }
            try { setShowWrongPopup(true); } catch (err) { void err; }
          }}
        >
          <div ref={shellRef} onMouseMove={(e)=>{ if(!showDev || !shellRef.current) return; const r = shellRef.current.getBoundingClientRect(); const px = ((e.clientX - r.left)/r.width)*100; const py = ((e.clientY - r.top)/r.height)*100; setDevPos({x: Number.isFinite(px)? px.toFixed(2):0, y: Number.isFinite(py)? py.toFixed(2):0}); }}>
            <PhoneFrame image={useSubmittedScreenshot ? screenshot4 : (step === 1 ? mpho1 : step === 2 ? mpho2 : step === 3 ? mpho3 : step === 4 ? mpho4 : mpho5)} screenWidth={'278px'} aspect={'278 / 450'} scale={1}>
              {showDev && <div className={frameStyles.devCoord}>{devPos.x}% , {devPos.y}% (d toggle)</div>}
              {step !== 5 && (
                <TapHint
                  selector={'button[aria-label="메시지 보내기"]'}
                  width={step === 1 ? '279px' : step === 2 ? '30px' : step === 3 ? '90px' : step === 4 ? '23px' : '18%'}
                  height={step === 1 ? '59px' : step === 2 ? '30px' : step === 3 ? '75px' : step === 4 ? '23px' : '8%'}
                  offsetX={step === 1 ? 0 : step === 2 ? -113 : step === 3 ? 90 : step === 4 ? 113 : 0}
                  offsetY={step === 1 ? 212 : step === 2 ? -64 : step === 3 ? 47 : step === 4 ? 96.5 : 0}
                  borderRadius={'10px'}
                  onActivate={() => {
                    // if on late practice steps, show results; otherwise keep advancing
                    if (step === 4 || step === 5) {
                      // request results and show details immediately when TapHint is used on late practice steps
                      submitPractice(true);
                    } else if (step === total) {
                      submitAnswer();
                    } else {
                      next();
                    }
                  }}
                  suppressInitial={false}
                  invisible={!tapHintVisible} /* hidden by default; become visible when user requests a hint */
                  ariaLabel={'전송 버튼 힌트'}
                />
              )}
              {/* 3, 4, 5번째 페이지에서는 키보드/입력창 숨김 */}
              {step === total && step !== 3 && step !== 4 && step !== 5 && (
                <ChatInputBar value={answer + composePreview()} disabled={!canSubmit} onChange={(val)=>{setAnswer(val); setFeedback('');}} onSubmit={onSubmitAnswer} offsetBottom={50} offsetX={0} className={frameStyles.inputRightCenter} placeholder={'메시지를 입력하세요'} readOnly={keyboardVisible} onFocus={()=>setKeyboardVisible(true)} onBlur={()=>{}} />
              )}
              {step === 3 || step === 4 || step === 5 ? null : null}
              {submittedText ? (
                <div style={{position:'absolute', right:14, left:'auto', bottom:229.5, maxWidth:'45%', padding:'4px 10px', borderRadius:10.5, backgroundColor:'#5AF575', boxShadow:'0 2px 6px rgba(0,0,0,0.12)', color:'#fff', fontSize:'12.75px', fontWeight:400, lineHeight:'1.2', fontFamily:'"Noto Sans KR", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', textAlign:'right', textShadow:'0 1px 2px rgba(0,0,0,0.2)'}}>
                  {submittedText}
                </div>
              ) : null}
              {keyboardVisible && step === total && step !== 3 && step !== 4 && step !== 5 && (
                <VirtualKeyboard onKey={(ch)=>{ const now = Date.now(); if(lastKeyRef.current.ch === ch && (now - lastKeyRef.current.t) < 120) { return; } lastKeyRef.current = {ch, t: now}; setFeedback(''); if(ch===' ') { flushComposition(); setAnswer(a=> a + ' '); } else if(ch === '\n'){ flushComposition(); setAnswer(a=> a + '\n'); } else { handleJamoInput(ch); } }} onBackspace={()=>{ const ccur = compRef.current; if(ccur.tail){ updateCompFn(c=> ({...c, tail:''})); return; } if(ccur.vowel){ updateCompFn(c=> ({...c, vowel:''})); return; } if(ccur.lead){ updateCompFn(c=> ({...c, lead:''})); return; } setAnswer(a => a.slice(0,-1)); }} onEnter={()=>{ flushComposition(); setAnswer(a=> a + '\n'); }} />
              )}
            </PhoneFrame>
          </div>
        </div>
        <div className={frameStyles.sidePanel}>
          <div className={frameStyles.captionBar} ref={captionRef} style={isSide ? {width:'auto', maxWidth:420, marginTop:0}:undefined}>
            <div className={frameStyles.progressHeader}>
              <div className={frameStyles.stepMeta}>
                <span className={frameStyles.stepCount}>{step} / {total}</span>
                <span className={frameStyles.stepTitle}>{current.title}</span>
              </div>
            </div>
            <div className={frameStyles.captionDivider} />

            {/* practice: show timer and hint usage like SmsMsendPractice */}
            <div style={{ marginTop: 8, color: '#666' }}>시간: {formatTime(elapsedSec)}</div>

            <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
              <button className={frameStyles.ghostBtn} aria-label="힌트 보기" onClick={useHint}>힌트 보기</button>
              <div style={{ color: '#666' }}>힌트 사용: {hintCount}</div>
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
          <div style={{ background: '#fff', padding: 22, borderRadius: 12, minWidth: 320, maxWidth: 560, boxShadow: '0 8px 30px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ flex: '0 0 120px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: '#10B981' }}>{result?.score?.total ?? '-'}</div>
                <div style={{ fontSize: 14, color: '#666' }}>/ 100</div>
              </div>
              <div style={{ flex: '1 1 auto' }}>
                <h3 style={{ margin: 0 }}>연습 결과</h3>
                <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setShowDetails(s => !s)}
                    className={frameStyles.ghostBtn}
                    aria-expanded={showDetails}
                    aria-controls="result-details"
                    style={{ padding: '6px 10px', fontSize: 13 }}
                  >
                    {showDetails ? '세부점수 숨기기' : '세부점수 보기'}
                  </button>
                  <div style={{ color: '#666', fontSize: 13 }}>시간: {formatTime(elapsedSec)}</div>
                </div>
              </div>
            </div>

            {showDetails && (
              <div id="result-details" style={{ marginTop: 14, padding: 12, borderRadius: 8, background: '#fafafa', border: '1px solid #eee' }}>
                <strong>세부 점수</strong>
                <div style={{ marginTop: 8 }}>
                  <div>시간 점수: {result?.score?.breakdown?.timeScore ?? '-'} / 30</div>
                  <div>정확도 점수: {result?.score?.breakdown?.errorScore ?? '-'} / 20</div>
                  <div>성공 점수: {result?.score?.breakdown?.successScore ?? '-'} / 50</div>
                  <div>부분 진행 보너스: {result?.score?.breakdown?.progressBonus ?? '-'} / 10</div>
                  <div>힌트 패널티: {result?.score?.breakdown?.hintPenalty ?? '-'} (힌트당 -5, 최대 감점 -20)</div>
                </div>
              </div>
            )}

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button className={frameStyles.primaryBtn} onClick={() => { setResult(null); navigate('/sms/practice'); }}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

