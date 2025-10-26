import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import frameStyles from './SmsLessonFrame.module.css';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
import ChatInputBar from '../../components/ChatInputBar/ChatInputBar';
import VirtualKeyboard from '../../components/VirtualKeyboard/VirtualKeyboard';
import screenshot1 from '../../assets/test1.png';
import screenshot2 from '../../assets/test2.png';
import screenshot3 from '../../assets/test3.png';
import screenshot4 from '../../assets/test4.png';
import stepsConfig from './SmsMsearchLessonSteps.js';

export default function SmsMsearchLesson(){
  // Template copied from msend lesson; adjust steps in SmsMsearchLessonSteps.js
  const navigate = useNavigate();
  const [step,setStep] = useState(1);
  const steps = stepsConfig;
  const total = steps.length;
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
  const current = steps.find(st => st.id === step) || steps[0];
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const lastKeyRef = useRef({ch:null, t:0});
  const [submittedText, setSubmittedText] = useState('');
  const [useSubmittedScreenshot, setUseSubmittedScreenshot] = useState(false);

  // Composer helpers
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

  function submitAnswer(){ const commit = getCommittedFromComp(compRef.current); const final = (answer + commit).trim(); if(!(step === total && final.length > 0)) return; if(commit) setAnswer(a => a + commit); updateComp({lead:'', vowel:'', tail:''}); setFeedback('좋아요. 잘 입력되었어요.'); setSubmittedText(final); setUseSubmittedScreenshot(true); setAnswer(''); if(step === total && 'speechSynthesis' in window){ try{ const msg = current.completionSpeak || '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?'; window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(msg); u.lang = 'ko-KR'; u.rate = 1; try{ const pref = (localStorage.getItem('voice') || 'female'); const v = pickPreferredVoice(pref, voices); if(v) u.voice = v; } catch { /* ignore */ } u.onend = () => setSpeaking(false); u.onerror = () => setSpeaking(false); setSpeaking(true); window.speechSynthesis.speak(u); } catch { /* ignore */ } } }

  useEffect(()=>{ setAnswer(''); setFeedback(''); if('speechSynthesis' in window){ window.speechSynthesis.cancel(); setSpeaking(false);} setAutoPlayed(false); const timer = setTimeout(()=>{ if('speechSynthesis' in window){ const base = (Array.isArray(current.speak) ? current.speak.join(' ') : current.speak) || current.instruction; if(base){ window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(base); u.lang='ko-KR'; u.rate=1; try { const pref = (localStorage.getItem('voice') || 'female'); const v = pickPreferredVoice(pref, voices); if(v) u.voice = v; } catch { /* ignore */ } u.onend=()=>{ setSpeaking(false); setAutoPlayed(true); }; u.onerror=()=>{ setSpeaking(false); setAutoPlayed(true); }; setSpeaking(true); window.speechSynthesis.speak(u); } } }, 250); return ()=> clearTimeout(timer); }, [step, current, voices]);

  useEffect(()=>()=>{ if('speechSynthesis' in window) window.speechSynthesis.cancel(); }, []);
  useEffect(()=>{ if(step === total){ setKeyboardVisible(true); } }, [step, total]);
  useEffect(()=>{ if(!('speechSynthesis' in window)) return; function loadVoices(){ const list = window.speechSynthesis.getVoices(); if(list && list.length){ setVoices(list); } } loadVoices(); window.speechSynthesis.addEventListener('voiceschanged', loadVoices); return ()=> window.removeEventListener('voiceschanged', loadVoices); },[]);

  function pickPreferredVoice(pref, all){ if(!all || !all.length) return null; const ko = all.filter(v=> (v.lang||'').toLowerCase().startsWith('ko')); if(!ko.length) return null; const maleKeys = ['male','남','man','boy','seong','min']; const femaleKeys = ['female','여','woman','girl','yuna','ara']; const wantMale = pref === 'male'; const keys = wantMale ? maleKeys : femaleKeys; const primary = ko.find(v=> keys.some(k=> (v.name||'').toLowerCase().includes(k)) ); if(primary) return primary; return ko[ wantMale ? (ko.length>1 ? 1 : 0) : 0 ]; }

  const [showDev,setShowDev] = useState(false);
  const [devPos,setDevPos] = useState({x:0,y:0});
  useEffect(()=>{ function key(e){ if(e.key==='d'){ setShowDev(s=>!s); } } window.addEventListener('keydown', key); return ()=> window.removeEventListener('keydown', key); },[]);

  useLayoutEffect(()=>{ function recalc(){ const vw = window.innerWidth; const vh = window.innerHeight; const headerH = headerRef.current?.offsetHeight || 0; const captionH = captionRef.current?.offsetHeight || 0; const side = window.innerWidth >= 1100; setIsSide(side); const verticalPadding = 84; const horizontalPadding = 40; const availH = Math.max(160, vh - headerH - (side ? 0 : captionH) - verticalPadding); if(shellAreaRef.current){ shellAreaRef.current.style.minHeight = `${availH}px`; } const availW = Math.max(200, vw - horizontalPadding); if(!shellRef.current) return; const el = shellRef.current; const prevTransform = el.style.transform; el.style.transform = 'none'; const rect = el.getBoundingClientRect(); const baseW = rect.width || 1; const baseH = rect.height || 1; const ratioH = availH / baseH; const ratioW = availW / baseW; let next = Math.min(1, ratioH, ratioW); if(side && captionRef.current){ const captionW = captionRef.current.getBoundingClientRect().width; const gap = 32; const required = baseW + gap + captionW; const available = vw - horizontalPadding; if(required > available){ const shrink = available / required; next = Math.min(next, shrink); } } if(!isFinite(next) || next <= 0) next = 1; if(next < 0.5) next = 0.5; const finalScale = Math.abs(next - 1) < 0.002 ? 1 : next; setScale(finalScale); if(side && finalScale < 1){ setDeviceWidth(Math.round(baseW * finalScale)); el.style.transform = 'none'; } else { setDeviceWidth(null); el.style.transform = prevTransform; } if(side && finalScale === 1){ const rect2 = el.getBoundingClientRect(); if(rect2.height > availH){ const fullscreenLike = (window.innerHeight >= 820); const targetRatio = availH / rect2.height; let shrink = targetRatio; if(fullscreenLike){ shrink -= 0.035; } if(shrink < 0.99){ shrink = Math.max(0.55, shrink); setDeviceWidth(Math.round(baseW * shrink)); } } } } recalc(); window.addEventListener('resize', recalc); return ()=> window.removeEventListener('resize', recalc); },[]);

  const next = () => setStep(s => Math.min(total, s+1));
  const prev = () => setStep(s => Math.max(1, s-1));

  return (
    <div className={frameStyles.framePage}>
      <BackButton to="/sms/learn" variant="fixed" />
      <header className={frameStyles.frameHeader} ref={headerRef}>
        <h1 className={frameStyles.frameTitle}>
          문자 검색하기
          <span className={frameStyles.inlineTagline}>특정 단어로 과거 문자를 검색하는 방법을 연습합니다.</span>
        </h1>
      </header>
      <div className={frameStyles.lessonRow}>
        <div className={frameStyles.deviceCol} ref={shellAreaRef}>
          <div ref={shellRef} onMouseMove={(e)=>{ if(!showDev || !shellRef.current) return; const r = shellRef.current.getBoundingClientRect(); const px = ((e.clientX - r.left)/r.width)*100; const py = ((e.clientY - r.top)/r.height)*100; setDevPos({x: Number.isFinite(px)? px.toFixed(2):0, y: Number.isFinite(py)? py.toFixed(2):0}); }}>
            <PhoneFrame image={useSubmittedScreenshot ? screenshot4 : (step === 1 ? screenshot2 : (step === 2 ? screenshot3 : screenshot1))} screenWidth={'278px'} aspect={'278 / 450'} scale={1}>
              {showDev && <div className={frameStyles.devCoord}>{devPos.x}% , {devPos.y}% (d toggle)</div>}
              <TapHint selector={'button[aria-label="메시지 보내기"]'} width={step === 1 ? '279px' : step === 2 ? '180px' : step === 3 ? '60px' : '18%'} height={step === 1 ? '59px' : step === 2 ? '25px' : step === 3 ? '30px' : '8%'} offsetX={step === 1 ? 0 : step === 2 ? 38 : step === 3 ? 0 : 0} offsetY={step === 1 ? 212 : step === 2 ? -67.5 : step === 3 ? 0 : 0} borderRadius={'10px'} onActivate={step === total ? submitAnswer : next} suppressInitial={step === total} ariaLabel={'전송 버튼 힌트'} />
              {step === total && (
                <ChatInputBar value={answer + composePreview()} disabled={!canSubmit} onChange={(val)=>{setAnswer(val); setFeedback('');}} onSubmit={onSubmitAnswer} offsetBottom={50} offsetX={0} className={frameStyles.inputRightCenter} placeholder={'메시지를 입력하세요'} readOnly={keyboardVisible} onFocus={()=>setKeyboardVisible(true)} onBlur={()=>{}} />
              )}
              {submittedText ? (
                <div style={{position:'absolute', right:14, left:'auto', bottom:229.5, maxWidth:'45%', padding:'4px 10px', borderRadius:10.5, backgroundColor:'#5AF575', boxShadow:'0 2px 6px rgba(0,0,0,0.12)', color:'#fff', fontSize:'12.75px', fontWeight:400, lineHeight:'1.2', fontFamily:'"Noto Sans KR", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', textAlign:'right', textShadow:'0 1px 2px rgba(0,0,0,0.2)'}}>
                  {submittedText}
                </div>
              ) : null}
              {keyboardVisible && step === total && (
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
            <button type="button" onClick={speakCurrent} className={frameStyles.listenBtn} aria-label="현재 단계 설명 다시 듣기">🔊 {autoPlayed || speaking ? '다시 듣기' : '듣기'}</button>
            <p className={frameStyles.lessonInstruction}>{current.instruction}</p>
            <div className={frameStyles.feedback} aria-live="polite" style={step === total && feedback ? {color: feedback.startsWith('좋아요') ? '#1d8c3f' : '#c34747'}:undefined}>{step === total ? feedback : ''}</div>
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
