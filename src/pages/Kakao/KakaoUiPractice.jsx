import React, { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import frameStyles from '../Sms/SmsLessonFrame.module.css';
import lt from '../../styles/learnTitle.module.css';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
import ChatInputBar from '../../components/ChatInputBar/ChatInputBar';
import VirtualKeyboard from '../../components/VirtualKeyboard/VirtualKeyboard';
import screenshot1 from '../../assets/msend3.png';
import screenshot4 from '../../assets/msend4.png';
import kemot1 from '../../assets/kreser1.png';
import kemot2 from '../../assets/kemot2.png';
import kemot3 from '../../assets/kemot3.png';
import kemot4 from '../../assets/kemot4.png';
import stepsConfig from './KakaoUiPracticeSteps.js';
import { useScoringProgress } from '../../lib/useScoringProgress';
import { getChapterId, ChapterDomain } from '../../lib/chapters';
import api from '../../lib/api';

export default function KakaoUiPractice(){
  const [step,setStep] = useState(1);
  const steps = stepsConfig;
  const total = steps.length;
  const shellRef = useRef(null);
  const shellAreaRef = useRef(null);
  
  const captionRef = useRef(null);
  const headerRef = useRef(null);
  const [_scale,setScale] = useState(1);
  const [_deviceWidth,setDeviceWidth] = useState(null);
  const [answer, setAnswer] = useState('');
  const [comp, setComp] = useState({lead:'', vowel:'', tail:''});
  const compRef = useRef({lead:'', vowel:'', tail:''});

  // keep a stable ref to the flushComposition function so callbacks can call it without
  // forcing it into dependency arrays (flushComposition is re-created inline later).
  const flushCompositionRef = useRef(null);

  function updateComp(next){ setComp(next); compRef.current = next; }
  function updateCompFn(fn){ setComp(prev=>{ const next = fn(prev); compRef.current = next; return next; }); }
  const [feedback, setFeedback] = useState('');
  const [speaking,setSpeaking] = useState(false);
  const [autoPlayed,setAutoPlayed] = useState(false);
  const [voices,setVoices] = useState([]);
  const current = steps.find(st => st.id === step) || steps[0];
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const lastKeyRef = useRef({ch:null, t:0});
  const [submittedText, setSubmittedText] = useState('');
  const [useSubmittedScreenshot, setUseSubmittedScreenshot] = useState(false);
  const [showKemot4, setShowKemot4] = useState(false);
  // keep reference to submittedText to avoid unused-var lint (we intentionally don't render the SMS bubble in Kakao lessons)
  useEffect(()=>{ void submittedText; }, [submittedText]);

  // minimal composition helpers reused
  const CHO = ['\u0000','ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const JUNG = ['\u0000','ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
  const JONG = ['\u0000','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const VCOMB = { 'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ' };
  const JCOMB = { 'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ' };

  function combineVowel(a,b){ if(!a||!b) return null; const key = `${a}${b}`; return VCOMB[key]||null; }
  function combineJong(a,b){ if(!a||!b) return null; const key = `${a}${b}`; return JCOMB[key]||null; }

  function flushComposition(snapshot){ const {lead, vowel, tail} = snapshot || compRef.current; updateComp({lead:'', vowel:'', tail:''}); if(!lead && !vowel && !tail) return; if(!lead && vowel){ setAnswer(a=> a + vowel); return; } const L = CHO.indexOf(lead) >= 0 ? CHO.indexOf(lead) : -1; const V = JUNG.indexOf(vowel) >= 0 ? JUNG.indexOf(vowel) : -1; const T = JONG.indexOf(tail) >= 0 ? JONG.indexOf(tail) : 0; if(L>0 && V>0){ const syll = String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T)); setAnswer(a=> a + syll); } else { const raw = (lead||'') + (vowel||'') + (tail||''); setAnswer(a=> a + raw); } }

  // keep flushComposition stable for callbacks by assigning to the ref each render
  flushCompositionRef.current = flushComposition;

  function getCommittedFromComp(snapshot){ const {lead, vowel, tail} = snapshot || compRef.current; if(!lead && !vowel && !tail) return ''; if(!lead && vowel) return vowel; const L = CHO.indexOf(lead) >= 0 ? CHO.indexOf(lead) : -1; const V = JUNG.indexOf(vowel) >= 0 ? JUNG.indexOf(vowel) : -1; const T = JONG.indexOf(tail) >= 0 ? JONG.indexOf(tail) : 0; if(L>0 && V>0){ return String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T)); } return (lead||'') + (vowel||'') + (tail||''); }

  function handleJamoInput(ch){ setFeedback(''); const prev = compRef.current; if(JUNG.includes(ch)){ if(prev.tail){ const isCompositeTail = Object.values(JCOMB).includes(prev.tail); if(isCompositeTail){ let left=null,right=null; for(const k in JCOMB){ if(JCOMB[k]===prev.tail){ left=k.charAt(0); right=k.charAt(1); break; } } if(left && right){ const snapLeft = {lead: prev.lead, vowel: prev.vowel, tail: left}; flushComposition(snapLeft); updateComp({lead: right, vowel: ch, tail: ''}); return; } flushComposition(prev); updateComp({lead:'', vowel: ch, tail: ''}); return; } const tailChar = prev.tail; const snap2 = {lead: prev.lead, vowel: prev.vowel, tail: ''}; flushComposition(snap2); updateComp({lead: tailChar, vowel: ch, tail: ''}); return; } if(prev.lead && prev.vowel){ const comb = combineVowel(prev.vowel, ch); if(comb){ updateComp({...prev, vowel: comb}); return; } flushComposition(prev); updateComp({lead:'', vowel: ch, tail:''}); return; } if(prev.lead && !prev.vowel){ updateComp({...prev, vowel: ch}); return; } if(!prev.lead){ setAnswer(a=> a + ch); return; } flushComposition(prev); setAnswer(a=> a + ch); return; } if(CHO.includes(ch)){ if(!prev.lead){ updateComp({...prev, lead: ch}); return; } if(prev.lead && !prev.vowel){ flushComposition(prev); updateComp({lead: ch, vowel:'', tail:''}); return; } if(prev.lead && prev.vowel && !prev.tail){ if(JONG.includes(ch)){ updateComp({...prev, tail: ch}); return; } flushComposition(prev); updateComp({lead: ch, vowel:'', tail:''}); return; } if(prev.lead && prev.vowel && prev.tail){ const combined = combineJong(prev.tail, ch); if(combined){ updateComp({...prev, tail: combined}); return; } flushComposition(prev); updateComp({lead: ch, vowel:'', tail:''}); return; } } flushComposition(prev); setAnswer(a=> a + ch); return; }

  function composePreview(){ const {lead, vowel, tail} = comp; if(!lead && !vowel && !tail) return ''; if(!lead && vowel) return vowel; const L = CHO.indexOf(lead) >= 0 ? CHO.indexOf(lead) : -1; const V = JUNG.indexOf(vowel) >= 0 ? JUNG.indexOf(vowel) : -1; const T = JONG.indexOf(tail) >= 0 ? JONG.indexOf(tail) : 0; if(L>0 && V>0){ return String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T)); } return (lead||'') + (vowel||'') + (tail||''); }

  const canSubmit = (answer + composePreview()).trim().length > 0;

  const speakCurrent = () => {
    if(!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const base = (Array.isArray(current.speak) ? current.speak.join(' ') : current.speak) || current.instruction;
    if(!base) return;
    const u = new SpeechSynthesisUtterance(base);
    u.lang = 'ko-KR';
    u.rate = 1;
    try { const pref = (localStorage.getItem('voice') || 'female'); const v = pickPreferredVoice(pref, voices); if(v) u.voice = v; } catch { /* ignore */ }
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };
  // reference to avoid unused-variable lint in this practice variant
  void speakCurrent;

  const onSubmitAnswer = (e) => { e.preventDefault(); submitAnswer(); if (step === total) { void submitPractice(); } };

  function submitAnswer(){ const commit = getCommittedFromComp(compRef.current); const final = (answer + commit).trim(); if(!(step === total && final.length > 0)) return; if(commit) setAnswer(a => a + commit); updateComp({lead:'', vowel:'', tail:''}); setFeedback('잘하셨어요. 전송되었습니다.'); setSubmittedText(final); setUseSubmittedScreenshot(true); setAnswer(''); if(step === total && 'speechSynthesis' in window){ try{ const msg = current.completionSpeak || '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?'; window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(msg); u.lang = 'ko-KR'; u.rate = 1; try{ const pref = (localStorage.getItem('voice') || 'female'); const v = pickPreferredVoice(pref, voices); if(v) u.voice = v; } catch { /* ignore */ } u.onend = () => setSpeaking(false); u.onerror = () => setSpeaking(false); setSpeaking(true); window.speechSynthesis.speak(u); } catch { /* ignore */ } } }

  useEffect(()=>{ setAnswer(''); setFeedback(''); if('speechSynthesis' in window){ window.speechSynthesis.cancel(); setSpeaking(false);} setAutoPlayed(false); const timer = setTimeout(()=>{ if('speechSynthesis' in window){ const base = (Array.isArray(current.speak) ? current.speak.join(' ') : current.speak) || current.instruction; if(base){ window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(base); u.lang='ko-KR'; u.rate=1; try { const pref = (localStorage.getItem('voice') || 'female'); const v = pickPreferredVoice(pref, voices); if(v) u.voice = v; } catch { /* ignore */ } u.onend=()=>{ setSpeaking(false); setAutoPlayed(true); }; u.onerror=()=>{ setSpeaking(false); setAutoPlayed(true); }; setSpeaking(true); window.speechSynthesis.speak(u); } } }, 250); return ()=> clearTimeout(timer); }, [step, current, voices]);

  useEffect(()=>()=>{ if('speechSynthesis' in window) window.speechSynthesis.cancel(); }, []);
  // show keyboard only when the current step actually expects input (has inputPlaceholder)
  useEffect(()=>{ setKeyboardVisible(Boolean(current && current.inputPlaceholder)); }, [step, total, current]);
  useEffect(()=>{ if(!('speechSynthesis' in window)) return; function loadVoices(){ const list = window.speechSynthesis.getVoices(); if(list && list.length){ setVoices(list); } } loadVoices(); window.speechSynthesis.addEventListener('voiceschanged', loadVoices); return ()=> window.removeEventListener('voiceschanged', loadVoices); },[]);

  // reset kemot4 override when leaving step 3
  useEffect(()=>{ if(step !== 3 && showKemot4){ setShowKemot4(false); } }, [step, showKemot4]);

  function pickPreferredVoice(pref, all){ if(!all || !all.length) return null; const ko = all.filter(v=> (v.lang||'').toLowerCase().startsWith('ko')); if(!ko.length) return null; const maleKeys = ['male','남','man','boy','seong','min']; const femaleKeys = ['female','여','woman','girl','yuna','ara']; const wantMale = pref === 'male'; const keys = wantMale ? maleKeys : femaleKeys; const primary = ko.find(v=> keys.some(k=> (v.name||'').toLowerCase().includes(k)) ); if(primary) return primary; return ko[ wantMale ? (ko.length>1 ? 1 : 0) : 0 ]; }

  const [showDev,setShowDev] = useState(false);
  const [devPos,setDevPos] = useState({x:0,y:0});
  const [hintCount, setHintCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const hintStorageKey = `practiceHintCount:kakao:ui`;
  const hintTimerRef = useRef(null);
  // initialize hint counter when entering this practice (start from existing or zero)
  useEffect(() => {
    try {
      const v = Number(localStorage.getItem(hintStorageKey) || '0') || 0;
      setHintCount(v);
    } catch {
      setHintCount(0);
    }
    return () => {
      // cleanup timer on unmount
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      try { localStorage.removeItem(hintStorageKey); } catch { /* ignore */ }
    };
  }, [hintStorageKey]);
  useEffect(()=>{ function key(e){ if(e.key==='d'){ setShowDev(s=>!s); } } window.addEventListener('keydown', key); return ()=> window.removeEventListener('keydown', key); },[]);

  const [showWrongPopup, setShowWrongPopup] = useState(false);
  
  // dev-only override for displayed score in result modal
  const [overrideScoreInput, setOverrideScoreInput] = useState('');
  const [submitCalledCount, setSubmitCalledCount] = useState(0);

  // scoring / tracking (mirror SmsMsendPractice)
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  useEffect(() => {
    const raw = localStorage.getItem('accessToken');
    if (!raw) return;
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/users/me');
        if (mounted) setUser(data);
      } catch {
        /* ignore */
      }
    })();
    return () => { mounted = false; };
  }, []);

  const chapterId = getChapterId(ChapterDomain.KAKAO, 0);
  const scoringHook = useScoringProgress({ user, chapterId, expertTimeSec: 20, stepsRequired: total, shouldSave: () => true });
  const localTracker = scoringHook?.tracker;
  const localFinalize = scoringHook?.finalizeAndSave;
  const tracker = localTracker;
  const finalizeSave = localFinalize;

  // practice timer / result
  const startedAtRef = useRef(null);
  const timerRef = useRef(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  useEffect(()=>{
    // start timer/tracker
    startedAtRef.current = Date.now();
    setElapsedSec(0);
    timerRef.current = setInterval(()=>{
      const start = startedAtRef.current || Date.now();
      setElapsedSec(Math.floor((Date.now() - start)/1000));
    }, 250);
    try { tracker?.start && tracker.start(); } catch { /* ignore */ }
    return ()=>{
      if(timerRef.current) clearInterval(timerRef.current);
      try { tracker?.end && tracker.end(); } catch { /* ignore */ }
    };
  }, [tracker]);

  function formatTime(sec){ const m = Math.floor(sec/60).toString().padStart(2,'0'); const s = Math.floor(sec%60).toString().padStart(2,'0'); return `${m}:${s}`; }
  function formatElapsedForResult(elapsed){ if (elapsed == null || Number.isNaN(Number(elapsed))) return '-'; const e = Number(elapsed); if (e <= 0) return '0초 00'; if (e >= 60) { const mm = Math.floor(e/60).toString().padStart(2,'0'); const ss = Math.floor(e%60).toString().padStart(2,'0'); return `${mm}:${ss}`; } const sec = Math.floor(e); const centis = Math.round((e - sec) * 100); const cs = String(centis).padStart(2,'0'); return `${sec}초 ${cs}`; }

  // finalize practice scoring (copied pattern from SmsMsendPractice)
  async function submitPractice(){
    console.debug('[KakaoUiPractice] submitPractice called', { step, total, answer, comp: compRef.current });
  try { setSubmitCalledCount(c => c + 1); } catch (e) { console.debug('submitCalledCount set error', e); }
    try { tracker?.markCorrect && tracker.markCorrect(step); } catch (e) { console.debug('tracker.markCorrect error', e); }
    try { tracker && typeof tracker.end === 'function' && tracker.end(); } catch (e) { console.debug('tracker.end error', e); }

    flushComposition();

    // basic validation: require non-empty text only if this step expects text input
    const expectsInput = Boolean(current && current.inputPlaceholder);
    if (expectsInput && !((answer + composePreview()).trim().length > 0)){
      console.debug('[KakaoUiPractice] submitPractice blocked: empty input for step that expects input', { step });
      setResult({ error: '메시지를 입력한 후 전송해주세요.' });
      setTimeout(()=> setResult(null), 1500);
      return;
    }

    if (finalizeSave) {
      try {
        const res = await finalizeSave();
        console.debug('[KakaoUiPractice] finalizeSave returned', res);
        try {
          const finalMs = startedAtRef.current ? (Date.now() - startedAtRef.current) : (res?.score?.derived?.elapsedSec ? (res.score.derived.elapsedSec * 1000) : 0);
          const finalSec = Math.round((finalMs / 10)) / 100;
          if (res && res.score) res.score.derived = { ...(res.score.derived || {}), elapsedSec: finalSec };
        } catch (e) { console.debug('finalizeSave formatting error', e); }
        setResult(res);
        try { localStorage.setItem('practiceScore:kakao:ui', JSON.stringify(res?.score ?? null)); } catch (e) { console.debug('localStorage set error', e); }
      } catch (err) {
        console.debug('[KakaoUiPractice] finalizeSave failed, falling back to tracker.scoreNow', err);
        try {
          const score = tracker?.scoreNow ? tracker.scoreNow() : null;
          try {
            const finalMs = startedAtRef.current ? (Date.now() - startedAtRef.current) : (score?.derived?.elapsedSec ? (score.derived.elapsedSec * 1000) : 0);
            const finalSec = Math.round((finalMs / 10)) / 100;
            if (score) score.derived = { ...(score.derived || {}), elapsedSec: finalSec };
          } catch (e) { console.debug('score formatting error', e); }
          setResult({ score });
          try { localStorage.setItem('practiceScore:kakao:ui', JSON.stringify(score ?? null)); } catch (e) { console.debug('localStorage set error', e); }
        } catch (e) {
          console.debug('[KakaoUiPractice] fallback failed', e);
          // final fallback: ensure some result so modal shows
          const fallback = { score: { total: 0, breakdown: {}, derived: { elapsedSec } } };
          setResult(fallback);
        }
      }
    } else {
      try {
        const score = tracker?.scoreNow ? tracker.scoreNow() : null;
        setResult({ score });
        try { localStorage.setItem('practiceScore:kakao:ui', JSON.stringify(score ?? null)); } catch (e) { console.debug('localStorage set error', e); }
      } catch (e) {
        console.debug('[KakaoUiPractice] final fallback when no finalizeSave', e);
        setResult({ score: { total: 0, breakdown: {}, derived: { elapsedSec } } });
      }
    }
  }

  // force-show result for TapHint final activation: skip input validation and always produce a result
  const forceShowResult = useCallback(async () => {
    console.debug('[KakaoUiPractice] forceShowResult called from TapHint');
  try { tracker?.markCorrect && tracker.markCorrect(step); } catch { /* ignore */ }
  try { tracker && typeof tracker.end === 'function' && tracker.end(); } catch { /* ignore */ }
  try { flushCompositionRef.current && flushCompositionRef.current(); } catch { /* ignore */ }

    if (finalizeSave) {
      try {
        const res = await finalizeSave();
        try {
          const finalMs = startedAtRef.current ? (Date.now() - startedAtRef.current) : (res?.score?.derived?.elapsedSec ? (res.score.derived.elapsedSec * 1000) : 0);
          const finalSec = Math.round((finalMs / 10)) / 100;
          if (res && res.score) res.score.derived = { ...(res.score.derived || {}), elapsedSec: finalSec };
        } catch { /* ignore */ }
        setResult(res);
        try { localStorage.setItem('practiceScore:kakao:ui', JSON.stringify(res?.score ?? null)); } catch { /* ignore */ }
        return;
      } catch {
        console.debug('[KakaoUiPractice] finalizeSave failed in forceShowResult, falling back');
      }
    }

    try {
      const score = tracker?.scoreNow ? tracker.scoreNow() : null;
      try {
        const finalMs = startedAtRef.current ? (Date.now() - startedAtRef.current) : (score?.derived?.elapsedSec ? (score.derived.elapsedSec * 1000) : 0);
        const finalSec = Math.round((finalMs / 10)) / 100;
        if (score) score.derived = { ...(score.derived || {}), elapsedSec: finalSec };
      } catch { /* ignore */ }
      setResult({ score });
      try { localStorage.setItem('practiceScore:kakao:ui', JSON.stringify(score ?? null)); } catch { /* ignore */ }
      return;
    } catch {
      console.debug('[KakaoUiPractice] forceShowResult fallback failed');
      setResult({ score: { total: 0, breakdown: {}, derived: { elapsedSec } } });
    }
  }, [tracker, finalizeSave, startedAtRef, elapsedSec, step]);

  // If the actual hint DOM button is clicked (some environments may render the TapHint
  // as a separate button with aria-label="전송 버튼 힌트"), ensure that click also
  // triggers the same finalization logic. We attach a short-lived listener only when
  // on the final step so users tapping that element get the result modal.
  useEffect(() => {
    if (step !== total) return undefined;
    function onHintClick() {
      try {
        console.debug('[KakaoUiPractice] hint DOM clicked -> forceShowResult');
        forceShowResult();
      } catch { /* ignore */ }
    }
    try {
      const els = Array.from(document.querySelectorAll('button[aria-label="전송 버튼 힌트"]'));
      els.forEach(el => el.addEventListener('click', onHintClick));
      return () => { els.forEach(el => el.removeEventListener('click', onHintClick)); };
    } catch { return undefined; }
  }, [step, total, forceShowResult]);

  // --- Debug helpers: expose quick functions to the window for manual testing ---
  // expose quick debug hooks; intentionally not re-wired on every render
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    try {
      window.__debug_submit = async () => {
        try {
          console.debug('[debug] window.__debug_submit called');
          await submitPractice();
        } catch (err) { console.debug('[debug] __debug_submit error', err); }
      };
      window.__debug_setResult = (n) => {
        try {
          const v = Number(n) || 0;
          const fake = { score: { total: v, breakdown: {}, derived: { elapsedSec } } };
          setResult(fake);
          console.debug('[debug] __debug_setResult applied', fake);
        } catch (err) { console.debug('[debug] __debug_setResult error', err); }
      };
    } catch (err) { console.debug('[debug] attach helpers error', err); }
    return () => {
      try { delete window.__debug_submit; delete window.__debug_setResult; } catch (err) { console.debug('[debug] delete helpers error', err); }
    };
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  function applyDevScore(){
    if(!showDev) return;
    const v = Number(overrideScoreInput);
    if(Number.isNaN(v)) return;
    const newScore = result?.score ? { ...result.score, total: v } : { total: v, breakdown: {}, derived: {} };
    const newResult = { ...(result || {}), score: newScore };
    setResult(newResult);
    try { localStorage.setItem('practiceScore:kakao:ui', JSON.stringify(newScore)); } catch { /* ignore */ }
  }

  useLayoutEffect(()=>{ function recalc(){ const vw = window.innerWidth; const vh = window.innerHeight; const headerH = headerRef.current?.offsetHeight || 0; const captionH = captionRef.current?.offsetHeight || 0; const side = window.innerWidth >= 1100; const verticalPadding = 84; const horizontalPadding = 40; const availH = Math.max(160, vh - headerH - (side ? 0 : captionH) - verticalPadding); if(shellAreaRef.current){ shellAreaRef.current.style.minHeight = `${availH}px`; } const availW = Math.max(200, vw - horizontalPadding); if(!shellRef.current) return; const el = shellRef.current; const prevTransform = el.style.transform; el.style.transform = 'none'; const rect = el.getBoundingClientRect(); const baseW = rect.width || 1; const baseH = rect.height || 1; const ratioH = availH / baseH; const ratioW = availW / baseW; let next = Math.min(1, ratioH, ratioW); if(side && captionRef.current){ const captionW = captionRef.current.getBoundingClientRect().width; const gap = 32; const required = baseW + gap + captionW; const available = vw - horizontalPadding; if(required > available){ const shrink = available / required; next = Math.min(next, shrink); } } if(!isFinite(next) || next <= 0) next = 1; if(next < 0.5) next = 0.5; const finalScale = Math.abs(next - 1) < 0.002 ? 1 : next; setScale(finalScale); if(side && finalScale < 1){ setDeviceWidth(Math.round(baseW * finalScale)); el.style.transform = 'none'; } else { setDeviceWidth(null); el.style.transform = prevTransform; } if(side && finalScale === 1){ const rect2 = el.getBoundingClientRect(); if(rect2.height > availH){ const fullscreenLike = (window.innerHeight >= 820); const targetRatio = availH / rect2.height; let shrink = targetRatio; if(fullscreenLike){ shrink -= 0.035; } if(shrink < 0.99){ shrink = Math.max(0.55, shrink); setDeviceWidth(Math.round(baseW * shrink)); } } } } recalc(); window.addEventListener('resize', recalc); return ()=> window.removeEventListener('resize', recalc); },[]);

  const next = () => {
    try { tracker?.markCorrect && tracker.markCorrect(step); } catch { /* ignore */ }
    // hide any visible hint when advancing
    setShowHint(false);
    setStep(s => Math.min(total, s+1));
  };
  // prev intentionally not used in practice UI

  // hide visual hint when step changes (mirror SmsMsendPractice behavior)
  useEffect(() => {
    setShowHint(false);
    if (hintTimerRef.current) { clearTimeout(hintTimerRef.current); hintTimerRef.current = null; }
  }, [step]);

  function handleHint() {
    let next = null;
    try {
      const cur = Number(localStorage.getItem(hintStorageKey) || '0') || 0;
      if (step <= 3) {
        next = cur + 1;
        localStorage.setItem(hintStorageKey, String(next));
        setHintCount(next);
      }
    } catch {
      // ignore storage errors
    }
    // keep the visual hint visible until the user advances to the next step
    setShowHint(true);
    try { if (step <= 3) tracker?.markHint && tracker.markHint(); } catch { /* ignore */ }
  }
  return (
    <div className={frameStyles.framePage}>
      <BackButton to="/kakao/practice" variant="fixed" />
      <header className={frameStyles.frameHeader} ref={headerRef}>
        <h1 className={`${frameStyles.frameTitle} ${lt.withAccent}`}>
          <span className="titleText">이모티콘 보내기</span>
          <span className={frameStyles.inlineTagline}>각종 이모티콘을 보내는 방법을 연습합니다.</span>
        </h1>
      </header>
      <div className={frameStyles.lessonRow}>
        <div className={frameStyles.deviceCol} ref={shellAreaRef}>
          <div ref={shellRef}
               onMouseMove={(e)=>{ if(!showDev || !shellRef.current) return; const r = shellRef.current.getBoundingClientRect(); const px = ((e.clientX - r.left)/r.width)*100; const py = ((e.clientY - r.top)/r.height)*100; setDevPos({x: Number.isFinite(px)? px.toFixed(2):0, y: Number.isFinite(py)? py.toFixed(2):0}); }}
               onClickCapture={(e) => {
                 // Active on steps 1,2 and final step as in SmsMsendPractice
                 if (![1,2,total].includes(step)) return;
                 try {
                   const path = e.nativeEvent?.composedPath ? e.nativeEvent.composedPath() : (e.nativeEvent && e.nativeEvent.path) || [];
                   if (path && path.length) {
                     for (const node of path) {
                       if (!node || !node.getAttribute) continue;
                       const al = node.getAttribute('aria-label');
                      if (al === '가상 키보드' || al === '전송 버튼 힌트') return;
                      if (node.tagName === 'BUTTON' && node.getAttribute('aria-label') === '메시지 보내기') { if (step === total) { try { forceShowResult(); } catch { /* ignore */ } } return; }
                     }
                   } else {
                     const tgt = e.target;
                     if (tgt && tgt.closest && (tgt.closest('button[aria-label="메시지 보내기"]') || tgt.closest('[aria-label="가상 키보드"]') || tgt.closest('[aria-label="전송 버튼 힌트"]'))) {
                      if (tgt.closest && tgt.closest('button[aria-label="메시지 보내기"]') && step === total) { try { forceShowResult(); } catch { /* ignore */ } }
                       return;
                     }
                   }
                 } catch {
                   const tgt = e.target;
                   if (tgt && tgt.closest && (tgt.closest('button[aria-label="메시지 보내기"]') || tgt.closest('[aria-label="가상 키보드"]') || tgt.closest('[aria-label="전송 버튼 힌트"]'))) {
                    if (tgt.closest && tgt.closest('button[aria-label="메시지 보내기"]') && step === total) { try { forceShowResult(); } catch { /* ignore */ } }
                     return;
                   }
                 }
                 // otherwise show wrong popup and mark error on tracker
                 e.stopPropagation();
                 e.preventDefault();
                 try { tracker?.markError && tracker.markError(step); } catch { /* ignore */ }
                 setShowWrongPopup(true);
               }}
          >
            <PhoneFrame image={useSubmittedScreenshot ? screenshot4 : (step === 1 ? kemot1 : (step === 2 ? kemot2 : (step === 3 ? (showKemot4 ? kemot4 : kemot3) : screenshot1)))} screenWidth={'278px'} aspect={'278 / 450'} scale={1}>
              {showDev && <div className={frameStyles.devCoord}>{devPos.x}% , {devPos.y}% (d toggle)</div>}
              {!showKemot4 && (
                <TapHint selector={'button[aria-label="메시지 보내기"]'} width={step === 1 ? '26px' : step === 2 ? '50px' : step === 3 ? '26px' : '18%'} height={step === 1 ? '27px' : step === 2 ? '50px' : step === 3 ? '26px' : '8%'} offsetX={step === 1 ? -120 : step === 2 ? 36 : step === 3 ? 123 : 0} offsetY={step === 1 ? -58 : step === 2 ? -15 : step === 3 ? 93 : 10} borderRadius={'10px'} onActivate={() => {
                    if (step === 3) { setShowKemot4(true); return; }
                    if (step === total) {
                      // final tap-hint should behave like the debug '결과 보기' button: call submitPractice
                      try { console.debug('[KakaoUiPractice] final TapHint activate -> calling forceShowResult'); } catch { /* ignore */ }
                      forceShowResult();
                    } else { next(); }
                  }} suppressInitial={false} invisible={!showHint && step !== total} ariaLabel={'전송 버튼 힌트'} />
              )}
              {current && current.inputPlaceholder && (
                <ChatInputBar value={answer + composePreview()} disabled={!canSubmit} onChange={(val)=>{setAnswer(val); setFeedback('');}} onSubmit={onSubmitAnswer} offsetBottom={50} offsetX={0} className={frameStyles.inputRightCenter} placeholder={current.inputPlaceholder || '메시지를 입력하세요'} readOnly={keyboardVisible} onFocus={()=>setKeyboardVisible(true)} onBlur={()=>{}} />
              )}
              {/* For Kakao lessons we don't show the green submitted-text bubble (SMS-specific UI) */}
              {keyboardVisible && current && current.inputPlaceholder && (
                <VirtualKeyboard onKey={(ch)=>{ const now = Date.now(); if(lastKeyRef.current.ch === ch && (now - lastKeyRef.current.t) < 120) { return; } lastKeyRef.current = {ch, t: now}; setFeedback(''); if(ch===' ') { flushComposition(); setAnswer(a=> a + ' '); } else if(ch === '\n'){ flushComposition(); setAnswer(a=> a + '\n'); } else { handleJamoInput(ch); } }} onBackspace={()=>{ const ccur = compRef.current; if(ccur.tail){ updateCompFn(c=> ({...c, tail:''})); return; } if(ccur.vowel){ updateCompFn(c=> ({...c, vowel:''})); return; } if(ccur.lead){ updateCompFn(c=> ({...c, lead:''})); return; } setAnswer(a => a.slice(0,-1)); }} onEnter={()=>{ flushComposition(); setAnswer(a=> a + '\n'); }} />
              )}
            </PhoneFrame>
          </div>
          <div style={{display: 'none'}} aria-hidden="true">{feedback}{speaking ? '' : ''}{autoPlayed ? '' : ''}</div>
        </div>
        <div className={frameStyles.sidePanel}>
          <div className={frameStyles.captionBar} ref={captionRef}>
            <div className={frameStyles.progressHeader}>
              <div className={frameStyles.stepMeta}>
                <span className={frameStyles.stepCount}>{step} / {total}</span>
                <span className={frameStyles.stepTitle}>{current.title}</span>
              </div>
            </div>
            <div className={frameStyles.captionDivider} />
            {tracker && <div style={{marginTop: 8, color: 'rgb(102, 102, 102)'}}>시간: {formatTime(elapsedSec)}</div>}
            <div style={{marginTop: 12, display: 'flex', gap: 10, alignItems: 'center'}}>
              <button className={frameStyles.ghostBtn} aria-label="힌트 보기" onClick={handleHint}>힌트 보기</button>
              <div style={{color: 'rgb(102, 102, 102)'}}>힌트 사용: {hintCount}</div>
            </div>
            {/* (debug button removed — final TapHint now triggers forceShowResult) */}
          </div>
        </div>
      </div>
      {submitCalledCount > 0 && (
        <div style={{ position: 'fixed', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '6px 10px', borderRadius: 6, zIndex: 900 }}>
          submitPractice 호출: {submitCalledCount}
        </div>
      )}
      {/* hint visual + storage behavior like SmsMsendPractice: */}
      {/* useHint defined below and TapHint visibility controlled by showHint */}

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
                  {showDev && (
                    <div style={{ marginLeft: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="number" value={overrideScoreInput} onChange={(e)=>setOverrideScoreInput(e.target.value)} placeholder="테스트 점수" style={{ width: 96, padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd' }} />
                      <button className={frameStyles.ghostBtn} onClick={applyDevScore} style={{ padding: '6px 10px' }}>적용</button>
                    </div>
                  )}
                  <div style={{ color: '#666', fontSize: 13 }}>시간: {formatElapsedForResult(result?.score?.derived?.elapsedSec)}</div>
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
              <button className={frameStyles.primaryBtn} onClick={() => { setResult(null); navigate('/kakao/practice'); }}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
