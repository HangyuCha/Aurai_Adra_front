import React, { useState, useRef, useLayoutEffect, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import frameStyles from '../Sms/SmsLessonFrame.module.css';
import lt from '../../styles/learnTitle.module.css';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
import ChatInputBar from '../../components/ChatInputBar/ChatInputBar';
import VirtualKeyboard from '../../components/VirtualKeyboard/VirtualKeyboard';
import screenshot1_default from '../../assets/msend3.png';
import screenshot2_default from '../../assets/msend1.png';
import screenshot3_default from '../../assets/msend2.png';
import screenshot4_default from '../../assets/msend4.png';
import { markAppProgress } from '../../lib/appProgressApi';

// Hangul composition tables - module scope so they're stable across renders
const CHO = ['\u0000','ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNG = ['\u0000','ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONG = ['\u0000','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const VCOMB = { 'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ' };
const JCOMB = { 'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ' };

export default function GenericLesson({ steps = [], backPath = '/', headerTitle = '학습', headerTagline = '', donePath = null, images = {}, tapHintConfig = {}, textOverlayConfig = {}, imageOverlayConfig = {}, showSubmittedBubble = true, extraOverlay = null, videos = {}, posters = {} }){
  const navigate = useNavigate();
  const location = useLocation();
  // debug mount
  console.log('[GenericLesson] mount', { headerTitle, stepCount: (steps || []).length });

  // allow callers to override screenshots (e.g., pass { screenshot2: kreser1 })
  const screenshot1 = images.screenshot1 || screenshot1_default;
  const screenshot2 = images.screenshot2 || screenshot2_default;
  const screenshot3 = images.screenshot3 || screenshot3_default;
  const screenshot4 = images.screenshot4 || screenshot4_default;
  const screenMap = (images && images.screens) || {};
  const [step,setStep] = useState(1);
  const total = steps.length || 1;
  const shellRef = useRef(null);
  const shellAreaRef = useRef(null);
  const [isSide,setIsSide] = useState(false);
  const captionRef = useRef(null);
  const headerRef = useRef(null);
  const [_scale,setScale] = useState(1);
  const [_deviceWidth,setDeviceWidth] = useState(null);
  const [answer, setAnswer] = useState('');
  const [comp, setComp] = useState({lead:'', vowel:'', tail:''});
  const compRef = useRef({lead:'', vowel:'', tail:''});

  function updateComp(next){ setComp(next); compRef.current = next; }
  function updateCompFn(fn){ setComp(prev=>{ const next = fn(prev); compRef.current = next; return next; }); }
  const [feedback, setFeedback] = useState('');
  const [speaking,setSpeaking] = useState(false);
  const [autoPlayed,setAutoPlayed] = useState(false);
  const [voices,setVoices] = useState([]);
  const current = useMemo(() => (steps.find(st => st.id === step) || steps[0] || {}), [steps, step]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const lastKeyRef = useRef({ch:null, t:0});
  const [submittedText, setSubmittedText] = useState('');
  const [submittedByStep, setSubmittedByStep] = useState({});
  const [useSubmittedScreenshot, setUseSubmittedScreenshot] = useState(false);
  const lastStepRef = useRef(step);

  // completion marker: infer appId/sessionKeys from URL and persist to localStorage + server
  const markCompletion = useMemo(() => {
    function inferFromPathname(pathname){
      try{
        // Expect patterns like: /sms/learn/:key, /gpt/learn/:key, /call/learn/:key, /kakao/learn/(friend|friend/num|room|media|ui)
        const parts = (pathname || '/').split('/').filter(Boolean);
        const appId = parts[0] || null;
        const section = parts[1] || null; // 'learn' | 'practice'
        if(section !== 'learn') return null;
        // everything after '/learn' is the lesson key path
        const rest = parts.slice(2).join('/');
        if(!appId || !rest) return null;
        // kakao special mapping
        if(appId === 'kakao'){
          if(rest === 'friend') return { appId, sessionKeys: ['addById'] };
          if(rest === 'friend/num') return { appId, sessionKeys: ['addByPhone'] };
          if(rest === 'room') return { appId, sessionKeys: ['inviteRoom', 'leaveGroup'] };
          // ui, media already match topic keys
          return { appId, sessionKeys: [rest] };
        }
        // others: use the rest as key directly (call/save/fix/face, sms keys, gpt keys)
        return { appId, sessionKeys: [rest] };
      } catch { return null; }
    }
    return async function doMark(){
      try{
        const info = inferFromPathname(location?.pathname || '/');
        if(!info) return;
        const { appId, sessionKeys } = info;
        if(!appId || !Array.isArray(sessionKeys) || sessionKeys.length === 0) return;
        for(const key of sessionKeys){
          try { await markAppProgress(appId, 'learn', key, null); } catch { /* ignore per-key */ }
        }
      } catch { /* ignore */ }
    };
  }, [location?.pathname]);

  

  function combineVowel(a,b){ if(!a||!b) return null; const key = `${a}${b}`; return VCOMB[key]||null; }
  function combineJong(a,b){ if(!a||!b) return null; const key = `${a}${b}`; return JCOMB[key]||null; }

  function flushComposition(snapshot){ const {lead, vowel, tail} = snapshot || compRef.current; updateComp({lead:'', vowel:'', tail:''}); if(!lead && !vowel && !tail) return; if(!lead && vowel){ setAnswer(a=> a + vowel); return; } const L = CHO.indexOf(lead) >= 0 ? CHO.indexOf(lead) : -1; const V = JUNG.indexOf(vowel) >= 0 ? JUNG.indexOf(vowel) : -1; const T = JONG.indexOf(tail) >= 0 ? JONG.indexOf(tail) : 0; if(L>0 && V>0){ const syll = String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T)); setAnswer(a=> a + syll); } else { const raw = (lead||'') + (vowel||'') + (tail||''); setAnswer(a=> a + raw); } }

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

  const onSubmitAnswer = (e) => { e.preventDefault(); submitAnswer(); };

  async function submitAnswer(){
    const commit = getCommittedFromComp(compRef.current);
    const final = (answer + commit).trim();
    if(!(step === total && final.length > 0)) return;
    if(commit) setAnswer(a => a + commit);
    updateComp({lead:'', vowel:'', tail:''});
    setFeedback('좋아요. 잘 입력되었어요.');
    setSubmittedText(final);
    setUseSubmittedScreenshot(true);
    setAnswer('');
    // mark completion (best-effort)
    try { await markCompletion(); } catch { /* ignore */ }
    if(step === total && 'speechSynthesis' in window){
      try{
        const msg = current.completionSpeak || '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?';
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(msg);
        u.lang = 'ko-KR';
        u.rate = 1;
        try{ const pref = (localStorage.getItem('voice') || 'female'); const v = pickPreferredVoice(pref, voices); if(v) u.voice = v; } catch { /* ignore */ }
        u.onend = () => setSpeaking(false);
        u.onerror = () => setSpeaking(false);
        setSpeaking(true);
        window.speechSynthesis.speak(u);
      } catch { /* ignore */ }
      if(donePath){ navigate(donePath); }
    }
  }

  useEffect(()=>{ setAnswer(''); setFeedback(''); if('speechSynthesis' in window){ window.speechSynthesis.cancel(); setSpeaking(false);} setAutoPlayed(false); const timer = setTimeout(()=>{ if('speechSynthesis' in window){ const base = (Array.isArray(current.speak) ? current.speak.join(' ') : current.speak) || current.instruction; if(base){ window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(base); u.lang='ko-KR'; u.rate=1; try { const pref = (localStorage.getItem('voice') || 'female'); const v = pickPreferredVoice(pref, voices); if(v) u.voice = v; } catch { /* ignore */ } u.onend=()=>{ setSpeaking(false); setAutoPlayed(true); }; u.onerror=()=>{ setSpeaking(false); setAutoPlayed(true); }; setSpeaking(true); window.speechSynthesis.speak(u); } } }, 250); return ()=> clearTimeout(timer); }, [step, current, voices]);
  // clear any leftover composition state when step changes to avoid cross-step composition artifacts
  useEffect(()=>{ updateComp({lead:'', vowel:'', tail:''}); }, [step]);

  useEffect(()=>()=>{ if('speechSynthesis' in window) window.speechSynthesis.cancel(); }, []);
  // enable keyboardVisible when the current step expects text input (has inputPlaceholder)
  useEffect(()=>{ setKeyboardVisible(Boolean(current && current.inputPlaceholder)); }, [step, total, current]);
  useEffect(()=>{ if(!('speechSynthesis' in window)) return; function loadVoices(){ const list = window.speechSynthesis.getVoices(); if(list && list.length){ setVoices(list); } } loadVoices(); window.speechSynthesis.addEventListener('voiceschanged', loadVoices); return ()=> window.removeEventListener('voiceschanged', loadVoices); },[]);

  function pickPreferredVoice(pref, all){ if(!all || !all.length) return null; const ko = all.filter(v=> (v.lang||'').toLowerCase().startsWith('ko')); if(!ko.length) return null; const maleKeys = ['male','남','man','boy','seong','min']; const femaleKeys = ['female','여','woman','girl','yuna','ara']; const wantMale = pref === 'male'; const keys = wantMale ? maleKeys : femaleKeys; const primary = ko.find(v=> keys.some(k=> (v.name||'').toLowerCase().includes(k)) ); if(primary) return primary; return ko[ wantMale ? (ko.length>1 ? 1 : 0) : 0 ]; }

  const [showDev,setShowDev] = useState(false);
  const [devPos,setDevPos] = useState({x:0,y:0});
  useEffect(()=>{ function key(e){ if(e.key==='d'){ setShowDev(s=>!s); } } window.addEventListener('keydown', key); return ()=> window.removeEventListener('keydown', key); },[]);

  useLayoutEffect(()=>{ function recalc(){ const vw = window.innerWidth; const vh = window.innerHeight; const headerH = headerRef.current?.offsetHeight || 0; const captionH = captionRef.current?.offsetHeight || 0; const side = window.innerWidth >= 1100; setIsSide(side); const verticalPadding = 84; const horizontalPadding = 40; const availH = Math.max(160, vh - headerH - (side ? 0 : captionH) - verticalPadding); if(shellAreaRef.current){ shellAreaRef.current.style.minHeight = `${availH}px`; } const availW = Math.max(200, vw - horizontalPadding); if(!shellRef.current) return; const el = shellRef.current; const prevTransform = el.style.transform; el.style.transform = 'none'; const rect = el.getBoundingClientRect(); const baseW = rect.width || 1; const baseH = rect.height || 1; const ratioH = availH / baseH; const ratioW = availW / baseW; let next = Math.min(1, ratioH, ratioW); if(side && captionRef.current){ const captionW = captionRef.current.getBoundingClientRect().width; const gap = 32; const required = baseW + gap + captionW; const available = vw - horizontalPadding; if(required > available){ const shrink = available / required; next = Math.min(next, shrink); } } if(!isFinite(next) || next <= 0) next = 1; if(next < 0.5) next = 0.5; const finalScale = Math.abs(next - 1) < 0.002 ? 1 : next; setScale(finalScale); if(side && finalScale < 1){ setDeviceWidth(Math.round(baseW * finalScale)); el.style.transform = 'none'; } else { setDeviceWidth(null); el.style.transform = prevTransform; } if(side && finalScale === 1){ const rect2 = el.getBoundingClientRect(); if(rect2.height > availH){ const fullscreenLike = (window.innerHeight >= 820); const targetRatio = availH / rect2.height; let shrink = targetRatio; if(fullscreenLike){ shrink -= 0.035; } if(shrink < 0.99){ shrink = Math.max(0.55, shrink); setDeviceWidth(Math.round(baseW * shrink)); } } } } recalc(); window.addEventListener('resize', recalc); return ()=> window.removeEventListener('resize', recalc); },[]);

  const next = () => setStep(s => Math.min(total, s+1));
  const prev = () => setStep(s => Math.max(1, s-1));
  
  function handleTapHintActivate(){
    // if current step has input, preserve the committed text into submittedText
    try{
      const commit = getCommittedFromComp(compRef.current);
      const final = (answer + commit).trim();
      if(current && current.inputPlaceholder && final.length){
        setSubmittedText(final);
      }
  } catch { /* ignore */ }
    if(step === total){ submitAnswer(); } else { next(); }
  }

  // when navigating forward from a step that had inputPlaceholder, preserve the typed message
  // commit typed input when advancing from an input step
  useEffect(()=>{
    const prev = lastStepRef.current;
    if(step === prev + 1){
      try{
        const prevStep = steps.find(s => s.id === prev) || {};
        if(prevStep.inputPlaceholder){
          // compute committed composition without depending on the helper function to avoid hook deps
          const snap = compRef.current;
          const lead = snap.lead, vowel = snap.vowel, tail = snap.tail;
          let commit = '';
          if(lead || vowel || tail){
            if(!lead && vowel) commit = vowel;
            else {
              const L = CHO.indexOf(lead) >= 0 ? CHO.indexOf(lead) : -1;
              const V = JUNG.indexOf(vowel) >= 0 ? JUNG.indexOf(vowel) : -1;
              const T = JONG.indexOf(tail) >= 0 ? JONG.indexOf(tail) : 0;
              if(L>0 && V>0){ commit = String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T)); }
              else { commit = (lead||'') + (vowel||'') + (tail||''); }
            }
          }
          const final = (answer + (commit || '')).trim();
          if(final.length){ 
            setSubmittedText(final);
            setSubmittedByStep(m=> ({ ...m, [prev]: final }));
          }
        }
      } catch { /* ignore */ }
    }
    lastStepRef.current = step;
  }, [step, answer, steps]);

  return (
    <div className={frameStyles.framePage}>
      <BackButton to={backPath} variant="fixed" />
      <header className={frameStyles.frameHeader} ref={headerRef}>
        <h1 className={`${frameStyles.frameTitle} ${lt.withAccent}`}>
          <span className="titleText">{headerTitle}</span>
          <span className={frameStyles.inlineTagline}>{headerTagline || current.instruction || ''}</span>
        </h1>
      </header>
      <div className={frameStyles.lessonRow}>
        <div className={frameStyles.deviceCol} ref={shellAreaRef}>
          <div ref={shellRef} onMouseMove={(e)=>{ if(!showDev || !shellRef.current) return; const r = shellRef.current.getBoundingClientRect(); const px = ((e.clientX - r.left)/r.width)*100; const py = ((e.clientY - r.top)/r.height)*100; setDevPos({x: Number.isFinite(px)? px.toFixed(2):0, y: Number.isFinite(py)? py.toFixed(2):0}); }}>
            {/* choose the screen media per-step: optional video, otherwise image (images.screens[step] > submitted screenshot > defaults) */}
            <PhoneFrame
              image={useSubmittedScreenshot ? screenshot4 : (screenMap[step] || (step === 1 ? screenshot2 : (step === 2 ? screenshot3 : screenshot1)))}
              videoSrc={videos && videos[step]}
              videoPoster={(posters && posters[step]) || (screenMap[step] || (step === 1 ? screenshot2 : (step === 2 ? screenshot3 : screenshot1)))}
              screenWidth={'278px'}
              aspect={'278 / 450'}
              scale={1}
            >
              {showDev && <div className={frameStyles.devCoord}>{devPos.x}% , {devPos.y}% (d toggle)</div>}
              {
                (() => {
                  // allow per-lesson overrides via tapHintConfig[step]
                  // support either a single config object or an array of configs to render multiple hints
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
                    const onAct = (override && override.onActivate) ? override.onActivate : handleTapHintActivate;
                    return (
                      <TapHint key={idx} {...hintProps} onActivate={onAct}>
                        {(override && override.inner) ? override.inner : null}
                      </TapHint>
                    );
                  });
                })()
              }
              {/* Live text overlay (per-step) - rendered inside PhoneFrame.overlay so coordinates are percent-based relative to the screenshot */}
              {
                (() => {
                  // optional image overlay (e.g., kreser4) rendered under the live text
                  const imgCfg = (imageOverlayConfig && imageOverlayConfig[step]) || null;
                  if(!imgCfg) return null;
                  const style = {
                    position: 'absolute',
                    left: imgCfg.x || '50%',
                    top: imgCfg.y || '50%',
                    transform: imgCfg.transform || 'translate(-50%, -50%)',
                    width: imgCfg.width || '60%',
                    pointerEvents: 'none',
                    zIndex: imgCfg.zIndex || 1,
                    opacity: imgCfg.opacity != null ? imgCfg.opacity : 1
                  };
                  return (
                    <img aria-hidden src={imgCfg.src} alt="overlay" style={style} />
                  );
                })()
              }
              {
                (() => {
                  const cfg = (textOverlayConfig && textOverlayConfig[step]) || null;
                  if(!cfg) return null;
                  // allow callers to inject an explicit value for the text overlay via cfg.value
                  // or request the submitted text from a specific earlier step via cfg.valueFromStep
                  let value = '';
                  if(cfg && cfg.valueFromStep !== undefined){
                    value = (submittedByStep && submittedByStep[cfg.valueFromStep]) || '';
                  } else if(cfg && cfg.value !== undefined){
                    value = (cfg.value || '');
                  } else {
                    value = (submittedText || (answer + composePreview()) || '');
                  }
                  const style = {
                    position: 'absolute',
                    left: cfg.x || '50%',
                    top: cfg.y || '50%',
                    transform: cfg.transform || 'translate(-50%, -50%)',
                    width: cfg.width || '60%',
                    color: cfg.color || '#111',
                    fontSize: cfg.fontSize || '14px',
                    fontWeight: cfg.fontWeight || 400,
                    textAlign: cfg.textAlign || 'left',
                    pointerEvents: 'none',
                    whiteSpace: cfg.whiteSpace || 'pre-wrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    zIndex: cfg.zIndex || 2
                  };
                  return (
                    <div aria-hidden style={style}>
                      {value}
                    </div>
                  );
                })()
              }
              {/* allow a lesson to render custom overlay content (calendar, pickers, etc.) inside the PhoneFrame overlay */}
              {extraOverlay}
              {/* Render input bar when the current step expects input (has inputPlaceholder) */}
              {current && current.inputPlaceholder && (
                <ChatInputBar value={answer + composePreview()} disabled={!canSubmit} onChange={(val)=>{setAnswer(val); setFeedback('');}} onSubmit={onSubmitAnswer} offsetBottom={50} offsetX={0} className={frameStyles.inputRightCenter} placeholder={current.inputPlaceholder || '메시지를 입력하세요'} readOnly={keyboardVisible} onFocus={()=>setKeyboardVisible(true)} onBlur={()=>{}} />
              )}
              {showSubmittedBubble && submittedText ? (
                <div style={{position:'absolute', right:14, left:'auto', bottom:229.5, maxWidth:'45%', padding:'4px 10px', borderRadius:10.5, backgroundColor:'#5AF575', boxShadow:'0 2px 6px rgba(0,0,0,0.12)', color:'#fff', fontSize:'12.75px', fontWeight:400, lineHeight:'1.2', fontFamily:'"Noto Sans KR", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', textAlign:'right', textShadow:'0 1px 2px rgba(0,0,0,0.2)'}}>
                  {submittedText}
                </div>
              ) : null}
              {keyboardVisible && (current && current.inputPlaceholder) && (
                <VirtualKeyboard
                  allowEnglish={Boolean(current && current.allowEnglish)}
                  onKey={(ch)=>{
                    const now = Date.now();
                    if(lastKeyRef.current.ch === ch && (now - lastKeyRef.current.t) < 120) { return; }
                    lastKeyRef.current = {ch, t: now};
                    setFeedback('');
                    if(ch===' ') { flushComposition(); setAnswer(a=> a + ' '); }
                    else if(ch === '\n'){ flushComposition(); setAnswer(a=> a + '\n'); }
                    else { handleJamoInput(ch); }
                  }}
                  onBackspace={()=>{
                    const ccur = compRef.current;
                    // If composing, delete composition parts first (tail -> vowel -> lead)
                    if(ccur.tail){ updateCompFn(c=> ({...c, tail:''})); return; }
                    if(ccur.vowel){ updateCompFn(c=> ({...c, vowel:''})); return; }
                    if(ccur.lead){ updateCompFn(c=> ({...c, lead:''})); return; }
                    // No active composition: perform Hangul-aware backspace on committed text
                    setAnswer(a => {
                      if(!a || a.length === 0) return a;
                      const last = a.charAt(a.length - 1);
                      const code = last.charCodeAt(0);
                      // Hangul syllable block range
                      if(code >= 0xAC00 && code <= 0xD7A3){
                        const SIndex = code - 0xAC00;
                        const LIndex = Math.floor(SIndex / (21*28));
                        const VIndex = Math.floor((SIndex % (21*28)) / 28);
                        const TIndex = SIndex % 28; // 0 means no jong
                        if(TIndex > 0){
                          // Remove final consonant (jongseong)
                          const newCode = 0xAC00 + (LIndex*21 + VIndex) * 28; // TIndex -> 0
                          const withoutJong = String.fromCharCode(newCode);
                          return a.slice(0, -1) + withoutJong;
                        }
                        // No jong: replace syllable with its initial consonant jamo (CHO)
                        const lead = CHO[LIndex + 1] || last;
                        return a.slice(0, -1) + lead;
                      }
                      // If last is jamo already, just delete one char
                      return a.slice(0, -1);
                    });
                  }}
                  onEnter={()=>{ flushComposition(); setAnswer(a=> a + '\n'); }}
                />
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
            <button type="button" onClick={speakCurrent} className={frameStyles.listenBtn} aria-label="현재 단계 설명 다시 듣기">🔊 {autoPlayed || speaking ? '다시 듣기' : '듣기'}</button>
            <p className={frameStyles.lessonInstruction}>{current.instruction}</p>
            <div className={frameStyles.feedback} aria-live="polite" style={step === total && feedback ? {color: feedback.startsWith('좋아요') ? '#1d8c3f' : '#c34747'}:undefined}>{step === total ? feedback : ''}</div>
            <div className={frameStyles.actionRow}>
              <button type="button" onClick={prev} disabled={step===1} className={frameStyles.ghostBtn}>이전</button>
              {step < total ? (
                <button type="button" onClick={next} className={frameStyles.primaryBtn}>다음</button>
              ) : (
                <button
                  type="button"
                  onClick={async ()=>{ try { await markCompletion(); } catch { /* ignore */ } navigate(backPath); }}
                  className={frameStyles.primaryBtn}
                >완료</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
