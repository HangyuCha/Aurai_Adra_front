import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import frameStyles from '../Sms/SmsLessonFrame.module.css';
import steps from './GptAskLessonSteps.js';
import gptAsk from '../../assets/gptAsk.png';
import gptAsk2 from '../../assets/gptAsk2.png';
import gptAsk3 from '../../assets/gptAsk3.png';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
import VirtualKeyboard from '../../components/VirtualKeyboard/VirtualKeyboard';

export default function GptAskLesson(){
  const navigate = useNavigate();
  const [step,setStep] = useState(1);
  const total = steps.length;
  const shellRef = useRef(null);
  const shellAreaRef = useRef(null);
  const captionRef = useRef(null);
  const headerRef = useRef(null);
  const [scale,setScale] = useState(1);
  const [deviceWidth,setDeviceWidth] = useState(null);
  const [inputText, setInputText] = useState('');
  const [notice, setNotice] = useState('');
  const noticeTimerRef = useRef(null);
  const [noticePersistent, setNoticePersistent] = useState(false);
  const [comp, setComp] = useState({lead:'', vowel:'', tail:''});
  const compRef = useRef({lead:'', vowel:'', tail:''});
  function updateComp(next){ setComp(next); compRef.current = next; }
  function updateCompFn(fn){ setComp(prev=>{ const next = fn(prev); compRef.current = next; return next; }); }
  const lastKeyRef = useRef({ch:null, t:0});

  // Hangul composition tables (same logic used in SMS lessons)
  const CHO = ['\u0000','ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const JUNG = ['\u0000','ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
  const JONG = ['\u0000','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const VCOMB = { 'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ' };
  const JCOMB = { 'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ' };

  function combineVowel(a,b){ if(!a||!b) return null; const key = `${a}${b}`; return VCOMB[key]||null; }
  function combineJong(a,b){ if(!a||!b) return null; const key = `${a}${b}`; return JCOMB[key]||null; }

  function flushComposition(snapshot){ const {lead, vowel, tail} = snapshot || compRef.current; updateComp({lead:'', vowel:'', tail:''}); if(!lead && !vowel && !tail) return; if(!lead && vowel){ setInputText(a=> a + vowel); return; } const L = CHO.indexOf(lead) >= 0 ? CHO.indexOf(lead) : -1; const V = JUNG.indexOf(vowel) >= 0 ? JUNG.indexOf(vowel) : -1; const T = JONG.indexOf(tail) >= 0 ? JONG.indexOf(tail) : 0; if(L>0 && V>0){ const syll = String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T)); setInputText(a=> a + syll); } else { const raw = (lead||'') + (vowel||'') + (tail||''); setInputText(a=> a + raw); } }

  function getCommittedFromComp(snapshot){ const {lead, vowel, tail} = snapshot || compRef.current; if(!lead && !vowel && !tail) return ''; if(!lead && vowel) return vowel; const L = CHO.indexOf(lead) >= 0 ? CHO.indexOf(lead) : -1; const V = JUNG.indexOf(vowel) >= 0 ? JUNG.indexOf(vowel) : -1; const T = JONG.indexOf(tail) >= 0 ? JONG.indexOf(tail) : 0; if(L>0 && V>0){ return String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T)); } return (lead||'') + (vowel||'') + (tail||''); }

  function handleJamoInput(ch){ const prev = compRef.current; if(JUNG.includes(ch)){ if(prev.tail){ const isCompositeTail = Object.values(JCOMB).includes(prev.tail); if(isCompositeTail){ let left=null,right=null; for(const k in JCOMB){ if(JCOMB[k]===prev.tail){ left=k.charAt(0); right=k.charAt(1); break; } } if(left && right){ const snapLeft = {lead: prev.lead, vowel: prev.vowel, tail: left}; flushComposition(snapLeft); updateComp({lead: right, vowel: ch, tail: ''}); return; } flushComposition(prev); updateComp({lead:'', vowel: ch, tail: ''}); return; } const tailChar = prev.tail; const snap2 = {lead: prev.lead, vowel: prev.vowel, tail: ''}; flushComposition(snap2); updateComp({lead: tailChar, vowel: ch, tail: ''}); return; } if(prev.lead && prev.vowel){ const comb = combineVowel(prev.vowel, ch); if(comb){ updateComp({...prev, vowel: comb}); return; } flushComposition(prev); updateComp({lead:'', vowel: ch, tail:''}); return; } if(prev.lead && !prev.vowel){ updateComp({...prev, vowel: ch}); return; } if(!prev.lead){ setInputText(a=> a + ch); return; } flushComposition(prev); setInputText(a=> a + ch); return; } if(CHO.includes(ch)){ if(!prev.lead){ updateComp({...prev, lead: ch}); return; } if(prev.lead && !prev.vowel){ flushComposition(prev); updateComp({lead: ch, vowel:'', tail:''}); return; } if(prev.lead && prev.vowel && !prev.tail){ if(JONG.includes(ch)){ updateComp({...prev, tail: ch}); return; } flushComposition(prev); updateComp({lead: ch, vowel:'', tail:''}); return; } if(prev.lead && prev.vowel && prev.tail){ const combined = combineJong(prev.tail, ch); if(combined){ updateComp({...prev, tail: combined}); return; } flushComposition(prev); updateComp({lead: ch, vowel:'', tail:''}); return; } } flushComposition(prev); setInputText(a=> a + ch); return; }

  function composePreview(){ const {lead, vowel, tail} = comp; if(!lead && !vowel && !tail) return ''; if(!lead && vowel) return vowel; const L = CHO.indexOf(lead) >= 0 ? CHO.indexOf(lead) : -1; const V = JUNG.indexOf(vowel) >= 0 ? JUNG.indexOf(vowel) : -1; const T = JONG.indexOf(tail) >= 0 ? JONG.indexOf(tail) : 0; if(L>0 && V>0){ return String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T)); } return (lead||'') + (vowel||'') + (tail||''); }
  const [voices,setVoices] = useState([]);
  const [speaking,setSpeaking] = useState(false);
  const [autoPlayed,setAutoPlayed] = useState(false);
  // static GPT mock image (add the file at src/assets/gpt-mock-2.png)
  // If you don't add the image file, the import will fail; you can place the screenshot at the path above.

  const current = steps.find(s=>s.id===step) || steps[0];

  const speakCurrent = () => {
    if(!globalThis.speechSynthesis) return;
    globalThis.speechSynthesis.cancel();
    const text = current.speak || current.instruction;
    if(!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang='ko-KR'; u.rate=0.95; u.pitch=1;
    const pref = (localStorage.getItem('gpt_voice_name')||'');
    const v = (voices.find(vc=>vc.name===pref) || voices.find(vc=> (vc.lang||'').toLowerCase().startsWith('ko')) );
    if(v) u.voice = v;
    u.onstart = ()=> setSpeaking(true);
    u.onend = ()=> { setSpeaking(false); setAutoPlayed(true); };
    u.onerror = ()=> setSpeaking(false);
    globalThis.speechSynthesis.speak(u);
  };

  useEffect(()=>{
    setAutoPlayed(false);
    const t = setTimeout(()=>{ speakCurrent(); }, 250);
    return ()=> clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[step, voices]);

  // clear any notice timer when unmounting
  useEffect(()=>{
    return ()=>{ if(noticeTimerRef.current){ clearTimeout(noticeTimerRef.current); noticeTimerRef.current = null; } };
  },[]);

  function showNotice(msg, { autoHide = true, duration = 1800 } = {}){
    setNotice(msg);
    setNoticePersistent(!autoHide);
    if(noticeTimerRef.current){ clearTimeout(noticeTimerRef.current); noticeTimerRef.current = null; }
    if(autoHide){
      noticeTimerRef.current = setTimeout(()=>{ setNotice(''); noticeTimerRef.current = null; }, duration);
    }
  }


  useEffect(()=>{
    if(!globalThis.speechSynthesis) return;
    function loadVoices(){ const list = globalThis.speechSynthesis.getVoices?.() || []; if(list.length) setVoices(list); }
    loadVoices();
    globalThis.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return ()=> globalThis.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  },[]);

  // remove the outer device shell's heavy border/shadow for this page only
  useEffect(()=>{
    const el = shellRef.current;
    if(!el) return;
    const prevBorder = el.style.border;
    const prevBoxShadow = el.style.boxShadow;
    const prevBackground = el.style.background;
    const prevBorderRadius = el.style.borderRadius;

    // neutralize the visual chrome but keep layout intact
    el.style.border = 'none';
    el.style.boxShadow = 'none';
    el.style.background = 'transparent';

    return ()=>{
      // restore previous inline styles
      if(!el) return;
      el.style.border = prevBorder || '';
      el.style.boxShadow = prevBoxShadow || '';
      el.style.background = prevBackground || '';
      el.style.borderRadius = prevBorderRadius || '';
    };
  },[]);

  useEffect(()=>{
    function recalc(){
      const vw = window.innerWidth, vh = window.innerHeight;
      const headerH = headerRef.current?.offsetHeight || 0;
      const captionH = captionRef.current?.offsetHeight || 0;
      const side = window.innerWidth >= 1100;
      const verticalPadding = 84; const horizontalPadding = 40;
      const availH = Math.max(160, vh - headerH - (side ? 0 : captionH) - verticalPadding);
      if(shellAreaRef.current) shellAreaRef.current.style.minHeight = `${availH}px`;
      if(!shellRef.current) return;
      const el = shellRef.current; const prev = el.style.transform; el.style.transform='none';
      const rect = el.getBoundingClientRect(); const baseW = rect.width || 1; const baseH = rect.height || 1;
      const ratioH = availH / baseH; const ratioW = Math.max(200, vw - horizontalPadding) / baseW;
      let next = Math.min(1, ratioH, ratioW);
      if(side && captionRef.current){ const captionW = captionRef.current.getBoundingClientRect().width; const gap = 32; const required = baseW + gap + captionW; const available = vw - horizontalPadding; if(required > available){ next = Math.min(next, available/required); } }
      if(!Number.isFinite(next) || next <= 0) next = 1;
      if(next < 0.5) next = 0.5;
      const final = Math.abs(next - 1) < 0.002 ? 1 : next;
      setScale(final);
      if(side && final < 1){
        setDeviceWidth(Math.round(baseW * final));
        el.style.transform = 'none';
      } else {
        setDeviceWidth(null);
        el.style.transform = prev;
      }
    }
    recalc(); window.addEventListener('resize', recalc); return ()=> window.removeEventListener('resize', recalc);
  },[]);

  // prevent page-level scrolling while this lesson is mounted
  useEffect(()=>{
    const docEl = document.documentElement;
    const body = document.body;
    const prevDocOverflow = docEl.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevDocHeight = docEl.style.height;
    const prevBodyHeight = body.style.height;
    const prevBodyMargin = body.style.margin;

    // hide scrollbars and lock scroll via inline styles
    docEl.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    docEl.style.height = '100%';
    body.style.height = '100%';
    body.style.margin = '0';

    // also inject a stylesheet to force-hide scrollbars across browsers
    const style = document.createElement('style');
  style.dataset.hideScroll = 'gpt-lesson';
    style.textContent = `
      /* hide scrollbars */
      html, body, #root { height: 100% !important; overflow: hidden !important; margin: 0 !important; }
      ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
      html, body { -ms-overflow-style: none !important; scrollbar-width: none !important; }
    `;
    document.head.appendChild(style);

    // prevent wheel/touch/key scroll events while mounted
    const prevent = (e) => { e.preventDefault(); return false; };
    const preventKeys = (e) => {
      // keys that typically scroll the page
      const keys = new Set(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End','Space',' ','Spacebar']);
      if(keys.has(e.key) || keys.has(e.code)){
        e.preventDefault(); return false;
      }
      return true;
    };
    globalThis.addEventListener('wheel', prevent, { passive: false });
    globalThis.addEventListener('touchmove', prevent, { passive: false });
    globalThis.addEventListener('keydown', preventKeys, { passive: false });

    return ()=>{
      // restore previous inline styles
      docEl.style.overflow = prevDocOverflow || '';
      body.style.overflow = prevBodyOverflow || '';
      docEl.style.height = prevDocHeight || '';
      body.style.height = prevBodyHeight || '';
      body.style.margin = prevBodyMargin || '';
      // remove injected style
      const el = document.head.querySelector('style[data-hide-scroll="gpt-lesson"]');
      if(el) el.remove();
  globalThis.removeEventListener('wheel', prevent, { passive: false });
  globalThis.removeEventListener('touchmove', prevent, { passive: false });
  globalThis.removeEventListener('keydown', preventKeys, { passive: false });
    };
  },[]);

  const next = ()=> setStep(s=>Math.min(total, s+1));
  const prev = ()=> setStep(s=>Math.max(1, s-1));

  const shellStyle = (() => {
    const minW = 360;
    if (deviceWidth) return { width: deviceWidth + 'px', minWidth: `${minW}px` };
    if (scale !== 1 && !deviceWidth) return { transform: `scale(${scale})`, transformOrigin: 'top center', minWidth: `${minW}px` };
    return { minWidth: `${minW}px` };
  })();

  return (
  <div className={frameStyles.framePage} style={{height: '100vh', overflow: 'hidden', padding: 0, boxSizing: 'border-box', display: 'flex', flexDirection: 'column'}}>
      <BackButton to="/gpt/learn" variant="fixed" />
      <header className={frameStyles.frameHeader} ref={headerRef}>
  <h1 className={frameStyles.frameTitle}>글로 질문하기</h1>
        <span className={frameStyles.inlineTagline}>궁금한 것을 글로 질문하기</span>
      </header>
  <div className={frameStyles.lessonRow} style={{flex: 1, overflow: 'hidden'}}>
        <div className={frameStyles.deviceCol} ref={shellAreaRef}>
          <div ref={shellRef} className={frameStyles.deviceShell} style={{...shellStyle, overflow: 'hidden'}}>
            {/* Use shared PhoneFrame so GPT screen matches other apps */}
            <PhoneFrame image={step === 2 ? gptAsk2 : (step === 3 ? gptAsk3 : gptAsk)} screenWidth={'278px'} aspect={'278 / 450'} scale={1}>
              {/* a small target marker positioned over the screenshot area we want to highlight
                  This marker lives inside the PhoneFrame.overlay so TapHint can query it by selector.
                  Adjust left/top/width/height as needed to fine-tune the highlighted area. */}
              {step === 1 && (
                <>
                  <div
                    aria-hidden
                    className="gpt-tap-target"
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '87%',
                      width: '95%',
                      height: '10%',
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* TapHint will position itself over the .gpt-tap-target element; clicking advances to step 2 */}
                  <TapHint selector={'.gpt-tap-target'} ariaLabel={'사진 탭힌트'} suppressInitial={true} onActivate={() => setStep(2)} />
                </>
              )}

              {step === 2 && (
                <>
                  {/* in-phone text display bar that shows typed characters */}
                  <div
                    aria-live="polite"
                    className="gpt-input-display"
                    style={{
                      position: 'absolute',
                      left: '40%',
                      bottom: '225px', /* place above keyboard */
                      transform: 'translateX(-50%)',
                      width: '70%', /* shorter so the photo icon on the right is visible */
                      minHeight: '38px',
                      background: '#1f2937', /* solid dark so underlying content is hidden */
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '999px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      zIndex: 120,
                      boxSizing: 'border-box',
                      pointerEvents: 'auto',
                      fontSize: 12,
                    }}
                  >
                    <span style={{opacity:0.85, fontSize:16, lineHeight:1}} aria-hidden>＋</span>
                    <span style={{flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{((inputText || '') + composePreview()) || '무엇이든 물어보세요'}</span>
                  </div>

                    {/* small marker positioned over the send/photo icon on the right so TapHint can target it */}
                    <div
                      aria-hidden
                      className="gpt-send-target"
                      style={{
                        position: 'absolute',
                        right: 14,
                        bottom: '225px',
                        width: 33,
                        height: 33,
                        borderRadius: 999,
                        transform: 'none',
                        pointerEvents: 'none',
                        zIndex: 125,
                      }}
                    />

                    {/* TapHint pointing to the send icon; tapping will flush composition and proceed (or show notice) */}
                    <TapHint selector={'.gpt-send-target'} ariaLabel={'보내기 탭힌트'} width={'44px'} height={'44px'} borderRadius={'999px'} onActivate={() => {
                      const visible = ((inputText || '') + composePreview()) || '무엇이든 물어보세요';
                      if((visible || '').trim() === '맛있는 음식을 추천해줘'){
                        flushComposition();
                        setStep(Math.min(3, total));
                      } else {
                        // make the notice persistent for elderly users (option B)
                        showNotice('정확히 "맛있는 음식을 추천해줘"를 입력한 뒤 눌러주세요', { autoHide: false });
                      }
                    }} />

                    {/* small temporary notice that appears when TapHint condition fails */}
                    {notice ? (
                      <div style={{position:'absolute', left:'50%', bottom: '270px', transform:'translateX(-50%)', background:'rgba(0,0,0,0.85)', color:'#fff', padding:'8px 12px', borderRadius:8, zIndex:130, fontSize:12, display:'flex', alignItems:'center', gap:8}} aria-live="polite">
                        <output style={{flex:1}}>{notice}</output>
                        {noticePersistent ? (
                          <button type="button" aria-label="닫기" onClick={()=>{ setNotice(''); setNoticePersistent(false); if(noticeTimerRef.current){ clearTimeout(noticeTimerRef.current); noticeTimerRef.current = null; } }} style={{background:'transparent', border:'none', color:'#fff', fontSize:14, cursor:'pointer'}}>✕</button>
                        ) : null}
                      </div>
                    ) : null}

                  <VirtualKeyboard
                    onKey={(ch)=>{ const now = Date.now(); if(lastKeyRef.current.ch === ch && (now - lastKeyRef.current.t) < 120) { return; } lastKeyRef.current = {ch, t: now}; if(ch === ' '){ flushComposition(); setInputText(t => (t || '') + ' '); } else if(ch === '\n'){ flushComposition(); setInputText(t => (t || '') + '\n'); } else { handleJamoInput(ch); } }}
                    onBackspace={()=>{ const ccur = compRef.current; if(ccur.tail){ updateCompFn(c=> ({...c, tail:''})); return; } if(ccur.vowel){ updateCompFn(c=> ({...c, vowel:''})); return; } if(ccur.lead){ updateCompFn(c=> ({...c, lead:''})); return; } setInputText(t => (t || '').slice(0, -1)); }}
                    onEnter={()=>{ flushComposition(); next(); }}
                  />
                </>
              )}
            </PhoneFrame>
          </div>
        </div>

        <div className={frameStyles.sidePanel}>
          <div className={frameStyles.captionBar} ref={captionRef} style={{alignItems:'flex-start'}}>
            <div className={frameStyles.progressHeader}>
              <div className={frameStyles.stepMeta}><span className={frameStyles.stepCount}>{step} / {total}</span><span className={frameStyles.stepTitle}>{current.title}</span></div>
            </div>
            <div className={frameStyles.captionDivider} />
            <button type="button" onClick={speakCurrent} className={frameStyles.listenBtn} aria-label="현재 단계 다시 듣기">🔊 {autoPlayed || speaking ? '다시 듣기' : '듣기'}</button>
            {/* static mock is shown in the phone; no upload UI needed */}
            <p className={frameStyles.lessonInstruction} style={{marginTop:12,whiteSpace:'pre-wrap'}}>{current.instruction}</p>
            <div className={frameStyles.actionRow} style={{marginTop:18}}>
              <button type="button" onClick={prev} disabled={step===1} className={frameStyles.ghostBtn}>이전</button>
              {step < total ? (
                <button type="button" onClick={next} className={frameStyles.primaryBtn}>다음</button>
              ) : (
                <button type="button" onClick={()=>navigate('/gpt/learn')} className={frameStyles.primaryBtn}>완료</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
