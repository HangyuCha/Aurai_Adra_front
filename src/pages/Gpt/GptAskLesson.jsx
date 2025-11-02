import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import frameStyles from '../Sms/SmsLessonFrame.module.css';
import steps from './GptAskLessonSteps.js';
import gptMock from '../../assets/gpt-mock-2.svg';

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

  useEffect(()=>{
    if(!globalThis.speechSynthesis) return;
    function loadVoices(){ const list = globalThis.speechSynthesis.getVoices?.() || []; if(list.length) setVoices(list); }
    loadVoices();
    globalThis.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return ()=> globalThis.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
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
        <h1 className={frameStyles.frameTitle}>질문 잘 하기</h1>
        <span className={frameStyles.inlineTagline}>명확하고 구체적인 프롬프트 작성법</span>
      </header>
  <div className={frameStyles.lessonRow} style={{flex: 1, overflow: 'hidden'}}>
        <div className={frameStyles.deviceCol} ref={shellAreaRef}>
          <div ref={shellRef} className={frameStyles.deviceShell} style={{...shellStyle, overflow: 'hidden'}}>
            <div className={frameStyles.deviceInner}>
              <div className={frameStyles.statusStrip}><span className={frameStyles.statusTime}>9:41</span><div className={frameStyles.statusIcons}><span className={frameStyles.signal} /><span className={frameStyles.wifi} /><span className={frameStyles.battery} /></div></div>
              <div className={frameStyles.screenArea}>
                <div style={{position:'relative',width:'100%',height:'100%',padding:12,boxSizing:'border-box', overflow:'hidden'}}>
                  {/* show the provided GPT mock screenshot inside the phone without scroll */}
                  <img src={gptMock} alt="gpt mock" style={{display:'block',width:'100%',height:'100%',objectFit:'cover',borderRadius:10}} />
                </div>
              </div>
            </div>
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
