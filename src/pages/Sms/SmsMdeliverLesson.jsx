import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import frameStyles from './SmsLessonFrame.module.css';
import lt from '../../styles/learnTitle.module.css';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
import VirtualKeyboard from '../../components/VirtualKeyboard/VirtualKeyboard';
import mdeliver1 from '../../assets/mdeliver1.png';
import mdel1 from '../../assets/mdel1.png';
import mdel2 from '../../assets/mdel2.png';
import mdeliver2 from '../../assets/mdeliver2.png';
import mdeliver3 from '../../assets/mdeliver3.png';
import mdeliver4 from '../../assets/mdeliver4.png';
import mdeliver5 from '../../assets/mdeliver5.png';
import mdel3 from '../../assets/mdel3.png';
import stepsConfig from './SmsMdeliverLessonSteps.js';

export default function SmsMdeliverLesson(){
  // Template copied from msend lesson; adjust steps in SmsMdeliverLessonSteps.js
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

  function submitAnswer(){ const commit = getCommittedFromComp(compRef.current); const final = (answer + commit).trim(); if(!(step === total && final.length > 0)) return; if(commit) setAnswer(a => a + commit); updateComp({lead:'', vowel:'', tail:''}); setFeedback('좋아요. 잘 입력되었어요.'); setSubmittedText(final); setUseSubmittedScreenshot(true); setAnswer(''); if(step === total && 'speechSynthesis' in window){ try{ const msg = current.completionSpeak || '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?'; window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(msg); u.lang = 'ko-KR'; u.rate = 1; try{ const pref = (localStorage.getItem('voice') || 'female'); const v = pickPreferredVoice(pref, voices); if(v) u.voice = v; } catch { /* ignore */ } u.onend = () => setSpeaking(false); u.onerror = () => setSpeaking(false); setSpeaking(true); window.speechSynthesis.speak(u); } catch { /* ignore */ } } }

  useEffect(()=>{ setAnswer(''); setFeedback(''); if('speechSynthesis' in window){ window.speechSynthesis.cancel(); setSpeaking(false);} setAutoPlayed(false); const timer = setTimeout(()=>{ if('speechSynthesis' in window){ const base = (Array.isArray(current.speak) ? current.speak.join(' ') : current.speak) || current.instruction; if(base){ window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(base); u.lang='ko-KR'; u.rate=1; try { const pref = (localStorage.getItem('voice') || 'female'); const v = pickPreferredVoice(pref, voices); if(v) u.voice = v; } catch { /* ignore */ } u.onend=()=>{ setSpeaking(false); setAutoPlayed(true); }; u.onerror=()=>{ setSpeaking(false); setAutoPlayed(true); }; setSpeaking(true); window.speechSynthesis.speak(u); } } }, 250); return ()=> clearTimeout(timer); }, [step, current, voices]);

  useEffect(()=>()=>{ if('speechSynthesis' in window) window.speechSynthesis.cancel(); }, []);
  // Show keyboard only on step 4. Ensure it is hidden on other steps (including final).
  useEffect(() => {
    setKeyboardVisible(step === 5);
  }, [step]);
  useEffect(()=>{ if(!('speechSynthesis' in window)) return; function loadVoices(){ const list = window.speechSynthesis.getVoices(); if(list && list.length){ setVoices(list); } } loadVoices(); window.speechSynthesis.addEventListener('voiceschanged', loadVoices); return ()=> window.removeEventListener('voiceschanged', loadVoices); },[]);

  function pickPreferredVoice(pref, all){ if(!all || !all.length) return null; const ko = all.filter(v=> (v.lang||'').toLowerCase().startsWith('ko')); if(!ko.length) return null; const maleKeys = ['male','남','man','boy','seong','min']; const femaleKeys = ['female','여','woman','girl','yuna','ara']; const wantMale = pref === 'male'; const keys = wantMale ? maleKeys : femaleKeys; const primary = ko.find(v=> keys.some(k=> (v.name||'').toLowerCase().includes(k)) ); if(primary) return primary; return ko[ wantMale ? (ko.length>1 ? 1 : 0) : 0 ]; }

  const [showDev,setShowDev] = useState(false);
  const [devPos,setDevPos] = useState({x:0,y:0});
  useEffect(()=>{ function key(e){ if(e.key==='d'){ setShowDev(s=>!s); } } window.addEventListener('keydown', key); return ()=> window.removeEventListener('keydown', key); },[]);

  useLayoutEffect(()=>{ function recalc(){ const vw = window.innerWidth; const vh = window.innerHeight; const headerH = headerRef.current?.offsetHeight || 0; const captionH = captionRef.current?.offsetHeight || 0; const side = window.innerWidth >= 1100; setIsSide(side); const verticalPadding = 84; const horizontalPadding = 40; const availH = Math.max(160, vh - headerH - (side ? 0 : captionH) - verticalPadding); if(shellAreaRef.current){ shellAreaRef.current.style.minHeight = `${availH}px`; } const availW = Math.max(200, vw - horizontalPadding); if(!shellRef.current) return; const el = shellRef.current; const prevTransform = el.style.transform; el.style.transform = 'none'; const rect = el.getBoundingClientRect(); const baseW = rect.width || 1; const baseH = rect.height || 1; const ratioH = availH / baseH; const ratioW = availW / baseW; let next = Math.min(1, ratioH, ratioW); if(side && captionRef.current){ const captionW = captionRef.current.getBoundingClientRect().width; const gap = 32; const required = baseW + gap + captionW; const available = vw - horizontalPadding; if(required > available){ const shrink = available / required; next = Math.min(next, shrink); } } if(!isFinite(next) || next <= 0) next = 1; if(next < 0.5) next = 0.5; const finalScale = Math.abs(next - 1) < 0.002 ? 1 : next; setScale(finalScale); if(side && finalScale < 1){ setDeviceWidth(Math.round(baseW * finalScale)); el.style.transform = 'none'; } else { setDeviceWidth(null); el.style.transform = prevTransform; } if(side && finalScale === 1){ const rect2 = el.getBoundingClientRect(); if(rect2.height > availH){ const fullscreenLike = (window.innerHeight >= 820); const targetRatio = availH / rect2.height; let shrink = targetRatio; if(fullscreenLike){ shrink -= 0.035; } if(shrink < 0.99){ shrink = Math.max(0.55, shrink); setDeviceWidth(Math.round(baseW * shrink)); } } } } recalc(); window.addEventListener('resize', recalc); return ()=> window.removeEventListener('resize', recalc); },[]);

  const next = () => {
    setStep(s => {
      const from = s;
      const to = Math.min(total, s+1);
      // If moving from step 4 to 5, capture typed text and show it on page 5
  if(from === 5){
          try{
            // Use composePreview() so we include any currently composing jamo
            const preview = composePreview();
            const final = (answer || '') + (preview || '');
            if(final.length > 0){
              // persist the submitted text so it appears on step 5
              setSubmittedText(final);
              // keep PhoneFrame image mapping (don't switch to screenshot)
              setUseSubmittedScreenshot(false);
              // clear editor state
              setAnswer('');
              updateComp({lead:'', vowel:'', tail:''});
            } else {
              // ensure previous submittedText is cleared if nothing typed
              setSubmittedText('');
              setUseSubmittedScreenshot(false);
            }
          } catch {
            // ignore errors
          }
        }
        // If moving into step 6, clear any submitted preview text so page 6 doesn't show it
        if(to === 7){
          setSubmittedText('');
          setUseSubmittedScreenshot(false);
        }
      return to;
    });
  };
  const prev = () => setStep(s => Math.max(1, s-1));

  return (
    <div className={frameStyles.framePage}>
      <BackButton to="/sms/learn" variant="fixed" />
      <header className={frameStyles.frameHeader} ref={headerRef}>
        <h1 className={`${frameStyles.frameTitle} ${lt.withAccent}`}>
          <span className="titleText">문자 전달하기</span>
          <span className={frameStyles.inlineTagline}>다른 사람에게 받은 문자를 전달하는 과정을 연습합니다.</span>
        </h1>
      </header>
      <div className={frameStyles.lessonRow}>
        <div className={frameStyles.deviceCol} ref={shellAreaRef}>
          <div ref={shellRef} onMouseMove={(e)=>{ if(!showDev || !shellRef.current) return; const r = shellRef.current.getBoundingClientRect(); const px = ((e.clientX - r.left)/r.width)*100; const py = ((e.clientY - r.top)/r.height)*100; setDevPos({x: Number.isFinite(px)? px.toFixed(2):0, y: Number.isFinite(py)? py.toFixed(2):0}); }}>
            <PhoneFrame image={useSubmittedScreenshot ? mdeliver3 : (step === 1 ? mdel1 : (step === 2 ? mdel2 : (step === 3 ? mdel3 : (step === 4 ? mdeliver1 : (step === 5 ? mdeliver2 : (step === 6 ? mdeliver3 : (step === 7 ? mdeliver4 : (step === 8 ? mdeliver5 : mdeliver3))))))))} screenWidth={'278px'} aspect={'278 / 450'} scale={1}>
              {showDev && <div className={frameStyles.devCoord}>{devPos.x}% , {devPos.y}% (d toggle)</div>}

              {/* Live preview + blinking caret for '받는 사람:' (appears on step 5) */}
              {step === 5 && (
                <>
                  <style>{`@keyframes smsCaretBlink { 0% { opacity: 1 } 50% { opacity: 0 } 100% { opacity: 1 } }`}</style>
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      left: 68,
                      top: 23,
                      maxWidth: '65%',
                      color: '#111',
                      fontSize: '13px',
                      fontWeight: 400,
                      lineHeight: '1.2',
                      fontFamily: '"Noto Sans KR", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      textAlign: 'left',
                      whiteSpace: 'pre-wrap',
                      pointerEvents: 'none',
                      zIndex: 180,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <div style={{display: 'inline-block'}}>{(answer || '') + composePreview()}</div>
                    <div style={{width:2, height:20, background:'#111', borderRadius:1, animation: 'smsCaretBlink 1s steps(1) infinite'}} />
                  </div>
                </>
              )}

              {/* In-phone marker for step 4 so TapHint can reliably position itself */}
              {step === 4 && (
                <div
                aria-hidden
                    className="sms-deliver-send-target"
                    style={{
                      position: 'absolute',
                      right: -55,
                      bottom: 425,
                      width: 270, // increased so TapHint computed width is larger
                      height: 28,
                      borderRadius: 999,
                      transform: 'none',
                      pointerEvents: 'none',
                      zIndex: 125,
                    }}
                />
              )}
              {/* In-phone marker for step 6 (complete/confirmation area) so TapHint can target it */}
              {step === 6 && (
                <div
                  aria-hidden
                  className="sms-deliver-complete-target"
                  style={{
                    position: 'absolute',
                    right: 13,
                    bottom: 365,
                    width: 260,
                    height: 36,
                    borderRadius: 12,
                    transform: 'none',
                    pointerEvents: 'none',
                    zIndex: 125,
                  }}
                />
              )}

              <TapHint
                selector={step === 4 ? '.sms-deliver-send-target' : step === 6 ? '.sms-deliver-complete-target' : 'button[aria-label="메시지 보내기"]'}
                width={step === 1 ? '279px' : step === 2 ? '52px' : step === 3 ? '90px' : step === 4 ? '200px' : step === 5 ? '52px' : step === 6 ? '140px' : step === 7 ? '35px' : '18%'}
                height={step === 1 ? '59px' : step === 2 ? '30px' : step === 3 ? '20px' : step === 4 ? '30px' : step === 5 ? '40px' : step === 6 ? '36px' : step === 7 ? '25px' : '8%'}
                offsetX={step === 1 ? 0 : step === 2 ? 100 : step === 3 ? 85 : step === 4 ? -60 : step === 5 ? 106.4 : step === 6 ? 0 : step === 7 ? 102 : 0}
                offsetY={step === 1 ? 212 : step === 2 ? 150 : step === 3 ? 105 : step === 4 ? -18 : step === 5 ? -33.5 : step === 6 ? -12 : step === 7 ? -60 : 0}
                borderRadius={step === 3 ? '14px' : step === 4 ? '18px' : step === 5 ? '12px' : step === 6 ? '12px' : step === 7 ? '15px' : '10px'}
                onActivate={step === total ? submitAnswer : next}
                suppressInitial={step === total}
                ariaLabel={'전송 버튼 힌트'}
              />
              {/* ChatInputBar removed per request: keep only VirtualKeyboard on step 5 */}
              {submittedText && step !== 7 ? (
                <div style={{
                  position: 'absolute',
                  left: 65,
                  bottom: 402,
                  maxWidth: '70%',
                  padding: '4px 8px',
                  color: '#111',
                  fontSize: '12.75px',
                  fontWeight: 400,
                  lineHeight: '1.2',
                  fontFamily: '"Noto Sans KR", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap'
                }}>
                  {submittedText}
                </div>
              ) : null}
              {step === 5 && submittedText ? (
                <div style={{
                  position: 'absolute',
                  left: 36,
                  bottom: 367,
                  maxWidth: '70%',
                  padding: '4px 8px',
                  color: '#green',
                  fontSize: '12.75px',
                  fontWeight: 400,
                  lineHeight: '1.2',
                  fontFamily: '"Noto Sans KR", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap'
                }}>
                  {submittedText}
                </div>
              ) : null}
              {step === 6 && submittedText ? (
                <div style={{
                  position: 'absolute',
                  left: 34,
                  bottom: 367,
                  maxWidth: '70%',
                  padding: '4px 8px',
                  color: 'green',
                  background: 'transparent',
                  fontSize: '12.75px',
                  fontWeight: 400,
                  lineHeight: '1.2',
                  fontFamily: '"Noto Sans KR", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap',
                  pointerEvents: 'none'
                }}>
                  {submittedText}
                </div>
              ) : null}
              {step === 6 && submittedText ? (
                <div style={{
                  position: 'absolute',
                  left: 10,
                  bottom: 360,
                  maxWidth: '65%',
                  padding: '4px 8px',
                  color: 'white',
                  background: 'transparent',
                  fontSize: '12.5px',
                  fontWeight: 400,
                  lineHeight: '1.2',
                  fontFamily: '"Noto Sans KR", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap',
                  pointerEvents: 'none',
                  opacity: 0.95
                }}>
                  {(() => {
                    const s = (submittedText || '').replace(/^\s+/, '');
                    return s ? s.charAt(0) : '';
                  })()}
                </div>
              ) : null}
              {step === 5 && submittedText ? (
                <div style={{
                  position: 'absolute',
                  left: 7,
                  bottom: 358,
                  maxWidth: '60%',
                  padding: '6px 10px',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 500,
                  lineHeight: '1.2',
                  fontFamily: '"Noto Sans KR", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap',
                  pointerEvents: 'none'
                }}>
                  {(() => {
                    const s = (submittedText || '').replace(/^\s+/, '');
                    return s ? s.charAt(0) : '';
                  })()}
                </div>
              ) : null}
              {keyboardVisible && step === 5 && (
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
