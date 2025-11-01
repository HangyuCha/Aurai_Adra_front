import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import frameStyles from '../Sms/SmsLessonFrame.module.css';
import steps from './GptWhatLessonSteps.js';

export default function GptWhatLesson(){
  const navigate = useNavigate();
  const [step,setStep] = useState(1);
  const total = steps.length;
  const shellRef = useRef(null);
  const shellAreaRef = useRef(null);
  const captionRef = useRef(null);
  const headerRef = useRef(null);
  const [scale,setScale] = useState(1);
  const [deviceWidth,setDeviceWidth] = useState(null);
  const [speaking,setSpeaking] = useState(false);
  const [autoPlayed,setAutoPlayed] = useState(false);
  const [voices,setVoices] = useState([]);

  const current = steps.find(s=>s.id===step) || steps[0];

  const speakCurrent = () => {
    if(!globalThis.speechSynthesis) return;
    globalThis.speechSynthesis.cancel();
    const text = current.instruction;
    if(!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang='ko-KR'; u.rate=0.88; u.pitch=1;
    const pref = (localStorage.getItem('gpt_voice_name')||'');
    const v = (voices.find(vc=>vc.name===pref) || voices.find(vc=> (vc.lang||'').toLowerCase().startsWith('ko')) );
    if(v) u.voice = v;
    u.onstart = ()=> setSpeaking(true);
    u.onend = ()=> { setSpeaking(false); setAutoPlayed(true); };
    u.onerror = ()=> setSpeaking(false);
    globalThis.speechSynthesis.speak(u);
  };

  useEffect(()=>{
    // auto play when step changes
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

  // simple responsive sizing similar to SmsGreetingLesson
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

  const next = ()=> setStep(s=>Math.min(total, s+1));
  const prev = ()=> setStep(s=>Math.max(1, s-1));
  const [copied, setCopied] = useState(false);
  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(()=>setCopied(false), 1800);
    } catch (e) {
      console.error('copy failed', e);
      // eslint-disable-next-line no-alert
      alert('링크를 복사할 수 없습니다. 주소를 길게 눌러 복사하세요: ' + url);
    }
  };

  const shellStyle = (() => {
    const minW = 360; // make the phone wider so content doesn't need to scroll on most screens
    if (deviceWidth) return { width: deviceWidth + 'px', minWidth: `${minW}px` };
    if (scale !== 1 && !deviceWidth) return { transform: `scale(${scale})`, transformOrigin: 'top center', minWidth: `${minW}px` };
    return { minWidth: `${minW}px` };
  })();

  return (
    <div className={frameStyles.framePage}>
      <BackButton to="/gpt/learn" variant="fixed" />
      <header className={frameStyles.frameHeader} ref={headerRef}>
        <h1 className={frameStyles.frameTitle}>GPT 배우기</h1>
        <span className={frameStyles.inlineTagline}>문자 메시지 모형으로 3단계로 살펴봅니다.</span>
      </header>
      <div className={frameStyles.lessonRow}>
        <div className={frameStyles.deviceCol} ref={shellAreaRef}>
          <div ref={shellRef} className={frameStyles.deviceShell} style={shellStyle}>
            <div className={frameStyles.deviceInner}>
              <div className={frameStyles.statusStrip}><span className={frameStyles.statusTime}>9:41</span><div className={frameStyles.statusIcons}><span className={frameStyles.signal} /><span className={frameStyles.wifi} /><span className={frameStyles.battery} /></div></div>
              <div className={frameStyles.screenArea}>
                <div style={{position:'relative',width:'100%',padding:18,boxSizing:'border-box'}}>
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    {/* render the instruction as message-like bubbles */}
                    <div style={{maxWidth:'78%',background:'#f1f3f5',padding:12,borderRadius:12,color:'#111',fontSize:16,lineHeight:1.6}}>{current.instruction.split('\n\n')[0]}</div>
                    <div style={{alignSelf:'flex-end',maxWidth:'78%',background:'linear-gradient(135deg,#59A3FF,#2d65c4)',color:'#fff',padding:12,borderRadius:12,fontSize:16,lineHeight:1.6}}>{current.instruction.split('\n\n')[1] || ''}</div>
                    {current.url && (
                      <div style={{marginTop:8,display:'flex',gap:8,alignItems:'center'}}>
                        <a href={current.url} target="_blank" rel="noopener noreferrer" style={{color:'#0b63d6',textDecoration:'underline',fontWeight:600}}>바로 열기</a>
                        <button type="button" onClick={()=>copyUrl(current.url)} className={frameStyles.ghostBtn} style={{padding:'8px 12px'}}>복사</button>
                        {copied && <span style={{color:'#1d8c3f',fontWeight:600}}>복사됨</span>}
                      </div>
                    )}
                  </div>
                  {/* 입력 바는 노인 사용자에게 혼란을 줄 수 있어 제거함 (요청에 따라) */}
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
