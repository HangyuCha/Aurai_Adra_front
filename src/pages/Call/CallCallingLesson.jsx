import React, { useState, useRef, useLayoutEffect, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import frameStyles from '../Sms/SmsLessonFrame.module.css';
import lt from '../../styles/learnTitle.module.css';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
// ChatInputBar와 VirtualKeyboard는 본 레슨 최종 단계에서 사용하지 않으므로 불러오지 않습니다.
import { buildCallLessonConfig, topicMeta } from './callDynamicSteps.js';

export default function CallCallingLesson(){
  const navigate = useNavigate();
  // 원본 동적 구성 (이미지 1~4 존재 가정). 우리는 실제 학습 단계를 3단계로 축소하고
  // step 2 TapHint 클릭 시 1초 동안 이전(구) 3단계 이미지를 잠깐 보여준 뒤 최종(구 4단계) 화면으로 이동한다.
  const { steps: rawSteps, screens: rawScreens } = useMemo(() => buildCallLessonConfig('calling'), []);
  // 화면 인덱스 매핑을 유연하게 계산: 최종 이미지는 4가 있으면 4, 없으면 최대 인덱스
  const screenMap = useMemo(() => {
    const keys = Object.keys(rawScreens||{}).map(n=>parseInt(n,10)).filter(Number.isFinite);
    const maxIdx = keys.length ? Math.max(...keys) : 1;
    const finalIdx = rawScreens[4] ? 4 : maxIdx;
    const interIdx = rawScreens[3] ? 3 : Math.max(1, finalIdx - 1);
    return { real: {1:1, 2:2, 3:finalIdx}, intermediate: interIdx };
  }, [rawScreens]);
  // 학습 단계 배열을 3개로 재구성 (기존 1,2 유지 / 3은 기존 rawSteps( id 3 ) 그대로 사용해 텍스트 유지)
  const steps = useMemo(() => {
    const s1 = rawSteps.find(s=>s.id===1);
    const s2 = rawSteps.find(s=>s.id===2);
    // 기존 3단계 객체(통화 종료) 그대로 사용: 제목/문구 유지, 단 이미지는 나중에 매핑으로 이미지4 사용
    const s3 = rawSteps.find(s=>s.id===3) || { id:3, title:'통화 종료', instruction:'통화를 종료하세요.', speak:'통화를 종료하세요.' };
    // id 재보장
    return [
      s1 ? {...s1, id:1} : {id:1,title:'단계 1',instruction:'전화번호를 입력하세요.', speak:'전화번호를 입력하세요.'},
      s2 ? {...s2, id:2} : {id:2,title:'단계 2',instruction:'발신 후 연결을 확인하세요.', speak:'발신 후 연결을 확인하세요.'},
      {...s3, id:3}
    ];
  }, [rawSteps]);
  const screens = rawScreens; // 원본 스크린 테이블 유지 (이미지 인덱스 접근용)
  const [step,setStep] = useState(1);
  const [showIntermediate,setShowIntermediate] = useState(false); // 1초 동안 중간 이미지 표시 여부
  const interTimerRef = useRef(null);
  const total = steps.length || 1;
  const shellRef = useRef(null);
  const shellAreaRef = useRef(null);
  const [isSide,setIsSide] = useState(false);
  const captionRef = useRef(null);
  const headerRef = useRef(null);
  const [_scale,setScale] = useState(1);
  const [_deviceWidth,setDeviceWidth] = useState(null);
  // 텍스트 입력을 사용하지 않으므로 updateCompFn은 제거했습니다.
  const [feedback, setFeedback] = useState('');
  const [speaking,setSpeaking] = useState(false);
  const [autoPlayed,setAutoPlayed] = useState(false);
  const [voices,setVoices] = useState([]);
  const current = useMemo(() => (steps.find(st => st.id === step) || steps[0] || {}), [steps, step]);
  // 가상 키보드/채팅바 미사용
  const [dialed, setDialed] = useState('');

  // 텍스트 입력 관련 로직 제거 (가상 키보드/채팅바 미사용)

  // 텍스트 입력을 사용하지 않으므로 handleJamoInput은 제거했습니다.

  // composePreview 제거 (채팅 입력 미사용)

  // canSubmit 제거 (채팅 입력 미사용)

  const speakCurrent = () => {
    if(!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const base = (Array.isArray(current.speak) ? current.speak.join(' ') : current.speak);
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

  // onSubmitAnswer 제거 (채팅 입력 미사용)

  // 텍스트 제출 로직 제거

  useEffect(()=>{ setFeedback(''); if('speechSynthesis' in window){ window.speechSynthesis.cancel(); setSpeaking(false);} setAutoPlayed(false); const timer = setTimeout(()=>{ if('speechSynthesis' in window){ const base = (Array.isArray(current.speak) ? current.speak.join(' ') : current.speak); if(base){ window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(base); u.lang='ko-KR'; u.rate=1; try { const pref = (localStorage.getItem('voice') || 'female'); const v = pickPreferredVoice(pref, voices); if(v) u.voice = v; } catch { /* ignore */ } u.onend=()=>{ setSpeaking(false); setAutoPlayed(true); }; u.onerror=()=>{ setSpeaking(false); setAutoPlayed(true); }; setSpeaking(true); window.speechSynthesis.speak(u); } } }, 250); return ()=> clearTimeout(timer); }, [step, current, voices]);

  useEffect(()=>()=>{ if('speechSynthesis' in window) window.speechSynthesis.cancel(); }, []);
  // 호출 레슨에서는 최종 단계에서 가상 키보드/채팅바를 표시하지 않으므로 자동 표시를 하지 않습니다.
  // useEffect(()=>{ if(step === total){ setKeyboardVisible(true); } }, [step, total]);
  useEffect(()=>{ if(!('speechSynthesis' in window)) return; function loadVoices(){ const list = window.speechSynthesis.getVoices(); if(list && list.length){ setVoices(list); } } loadVoices(); window.speechSynthesis.addEventListener('voiceschanged', loadVoices); return ()=> window.removeEventListener('voiceschanged', loadVoices); },[]);

  function pickPreferredVoice(pref, all){ if(!all || !all.length) return null; const ko = all.filter(v=> (v.lang||'').toLowerCase().startsWith('ko')); if(!ko.length) return null; const maleKeys = ['male','남','man','boy','seong','min']; const femaleKeys = ['female','여','woman','girl','yuna','ara']; const wantMale = pref === 'male'; const keys = wantMale ? maleKeys : femaleKeys; const primary = ko.find(v=> keys.some(k=> (v.name||'').toLowerCase().includes(k)) ); if(primary) return primary; return ko[ wantMale ? (ko.length>1 ? 1 : 0) : 0 ]; }

  const [showDev,setShowDev] = useState(false);
  const [devPos,setDevPos] = useState({x:0,y:0});
  useEffect(()=>{ function key(e){ if(e.key==='d'){ setShowDev(s=>!s); } } window.addEventListener('keydown', key); return ()=> window.removeEventListener('keydown', key); },[]);

  useLayoutEffect(()=>{ function recalc(){ const vw = window.innerWidth; const vh = window.innerHeight; const headerH = headerRef.current?.offsetHeight || 0; const captionH = captionRef.current?.offsetHeight || 0; const side = window.innerWidth >= 1100; setIsSide(side); const verticalPadding = 84; const horizontalPadding = 40; const availH = Math.max(160, vh - headerH - (side ? 0 : captionH) - verticalPadding); if(shellAreaRef.current){ shellAreaRef.current.style.minHeight = `${availH}px`; } const availW = Math.max(200, vw - horizontalPadding); if(!shellRef.current) return; const el = shellRef.current; const prevTransform = el.style.transform; el.style.transform = 'none'; const rect = el.getBoundingClientRect(); const baseW = rect.width || 1; const baseH = rect.height || 1; const ratioH = availH / baseH; const ratioW = availW / baseW; let next = Math.min(1, ratioH, ratioW); if(side && captionRef.current){ const captionW = captionRef.current.getBoundingClientRect().width; const gap = 32; const required = baseW + gap + captionW; const available = vw - horizontalPadding; if(required > available){ const shrink = available / required; next = Math.min(next, shrink); } } if(!isFinite(next) || next <= 0) next = 1; if(next < 0.5) next = 0.5; const finalScale = Math.abs(next - 1) < 0.002 ? 1 : next; setScale(finalScale); if(side && finalScale < 1){ setDeviceWidth(Math.round(baseW * finalScale)); el.style.transform = 'none'; } else { setDeviceWidth(null); el.style.transform = prevTransform; } if(side && finalScale === 1){ const rect2 = el.getBoundingClientRect(); if(rect2.height > availH){ const fullscreenLike = (window.innerHeight >= 820); const targetRatio = availH / rect2.height; let shrink = targetRatio; if(fullscreenLike){ shrink -= 0.035; } if(shrink < 0.99){ shrink = Math.max(0.55, shrink); setDeviceWidth(Math.round(baseW * shrink)); } } } } recalc(); window.addEventListener('resize', recalc); return ()=> window.removeEventListener('resize', recalc); },[]);

  const next = () => setStep(s => Math.min(total, s+1));
  const prev = () => setStep(s => Math.max(1, s-1));

  // TapHint 클릭 시 커스텀 진행 (step 2에서만 중간 프리뷰)
  const handleHintActivate = () => {
    if(showIntermediate) return; // 중간 표시 중에는 무시
    if(step === 2){
      // 1초간 중간 프리뷰 이미지3 표시
      setShowIntermediate(true);
      if(interTimerRef.current) clearTimeout(interTimerRef.current);
      interTimerRef.current = setTimeout(()=>{
        setShowIntermediate(false);
        setStep(3); // 최종 단계로 이동 (이미지4 매핑)
        interTimerRef.current = null;
      }, 1000);
      return;
    }
    if(step === total){
      // 최종 단계에서 추가 입력/제출 로직 없음
    } else {
      next();
    }
  };

  useEffect(()=>()=>{ if(interTimerRef.current){ clearTimeout(interTimerRef.current); interTimerRef.current = null; } },[]);

  return (
    <div className={frameStyles.framePage}>
      <BackButton to="/call/learn" variant="fixed" />
      <header className={frameStyles.frameHeader} ref={headerRef}>
        <h1 className={`${frameStyles.frameTitle} ${lt.withAccent}`}>
          <span className="titleText">{topicMeta.calling.title}</span>
          <span className={frameStyles.inlineTagline}>{topicMeta.calling.tagline || current.instruction || '전화를 걸고 통화하는 기본 흐름을 연습해 보세요.'}</span>
        </h1>
      </header>
      <div className={frameStyles.lessonRow}>
        <div className={frameStyles.deviceCol} ref={shellAreaRef}>
          <div ref={shellRef} onMouseMove={(e)=>{ if(!showDev || !shellRef.current) return; const r = shellRef.current.getBoundingClientRect(); const px = ((e.clientX - r.left)/r.width)*100; const py = ((e.clientY - r.top)/r.height)*100; setDevPos({x: Number.isFinite(px)? px.toFixed(2):0, y: Number.isFinite(py)? py.toFixed(2):0}); }}>
            {/* 활성 이미지 선택: 중간 프리뷰 중이면 이미지3, 아니면 매핑된 실제 이미지 */}
            <PhoneFrame image={screens[ showIntermediate ? screenMap.intermediate : (screenMap.real[step] || step) ]} screenWidth={'278px'} aspect={'278 / 450'} scale={1}>
              {showDev && <div className={frameStyles.devCoord}>{devPos.x}% , {devPos.y}% (d toggle)</div>}
              {/* Step 1, 2: Dialed number & status overlays (최종 3단계는 원본 이미지만) */}
              {(step === 1 || step === 2) && (
                <>
                  {/* Step 2: Status text above the phone number */}
                  {(step === 2) && (
                    <div aria-hidden="true" style={{
                      position:'absolute', left:'50%', top:'3.5%', transform:'translateX(-50%)',
                      width:'84%', minHeight:'22px', textAlign:'center',
                      fontSize:'13px', fontWeight:400, color:'#333',
                      letterSpacing:'1px', zIndex:3, pointerEvents:'none',
                      textShadow:'0 1px 2px rgba(255,255,255,0.6)'
                    }}>
                      휴대전화 연결 중...
                    </div>
                  )}
                  {/* Dialed number display (top of keypad) */}
                  <div aria-live="polite" style={{
                    position:'absolute', left:'50%', top:'8%', transform:'translateX(-50%)',
                    width:'80%', minHeight:'24px', textAlign:'center',
                      fontSize: step === 1 ? '22px' : '20px', fontWeight:400, color:'#111',
                    letterSpacing:'2px', zIndex:3, pointerEvents:'none',
                    textShadow:'0 1px 2px rgba(255,255,255,0.6)'
                  }}>
                    {dialed}
                  </div>
                </>
              )}

              {/* Step 1: Dialpad interactive overlay */}
              {step === 1 && (
                <>
                  {/* (dialed number already rendered above) */}

                  {/* Helper to render circular hit areas for digits */}
                  {[
                    // 간격 재조정: 각 행 간격을 13%로 (이전 9%보다 넓게, 원래 17%의 절반 증가)
                    // 선택된 Y: 30, 43, 56, 69 (첫 행 유지, 이후 +13%)
                    // 요청: 숫자 버튼들을 위로 6px 이동
                    {ch:'1', x:'25%', y:'calc(30% - 6px)'}, {ch:'2', x:'50%', y:'calc(30% - 6px)'}, {ch:'3', x:'75%', y:'calc(30% - 6px)'},
                    {ch:'4', x:'25%', y:'calc(43% - 6px)'}, {ch:'5', x:'50%', y:'calc(43% - 6px)'}, {ch:'6', x:'75%', y:'calc(43% - 6px)'},
                    {ch:'7', x:'25%', y:'calc(56% - 6px)'}, {ch:'8', x:'50%', y:'calc(56% - 6px)'}, {ch:'9', x:'75%', y:'calc(56% - 6px)'},
                    {ch:'*', x:'25%', y:'calc(69% - 6px)'}, {ch:'0', x:'50%', y:'calc(69% - 6px)'}, {ch:'#', x:'75%', y:'calc(69% - 6px)'}
                  ].map((b, idx) => (
                    <button
                      key={idx}
                      type="button"
                      aria-label={`키패드 ${b.ch}`}
                      onClick={()=> setDialed(d => (d + b.ch))}
                      style={{
                        position:'absolute', left:b.x, top:b.y, transform:'translate(-50%, -50%)',
                        width:'55px', height:'55px', borderRadius:'50%',
                        background:'transparent', backdropFilter:'none',
                        border:'none', cursor:'pointer',
                        boxShadow:'none',
                        transition:'background .12s, transform .15s',
                        zIndex:3
                      }}
                      onMouseDown={e=>{ e.currentTarget.style.background='rgba(0,0,0,0.10)'; e.currentTarget.style.transform='translate(-50%, -50%) scale(0.95)'; }}
                      onMouseUp={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                      onTouchStart={e=>{ e.currentTarget.style.background='rgba(0,0,0,0.12)'; e.currentTarget.style.transform='translate(-50%, -50%) scale(0.95)'; }}
                      onTouchEnd={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                      onTouchCancel={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                    />
                  ))}

                  {/* Call button (green) */}
                  <button
                    type="button"
                    aria-label="발신"
                    disabled={!dialed.length}
                    onClick={()=> { if(dialed.length) next(); }}
                    style={{
                      position:'absolute', left:'50%', top:'calc(84% - 10px)', transform:'translate(-50%, -50%)',
                      width:'55px', height:'55px', borderRadius:'50%',
                      background:'transparent',
                      border:'none', cursor: dialed.length ? 'pointer' : 'default',
                      boxShadow:'none', color:'transparent', fontSize:'0', zIndex:3
                    }}
                    onMouseDown={e=>{ if(!dialed.length) return; e.currentTarget.style.background='rgba(40,190,60,0.25)'; e.currentTarget.style.transform='translate(-50%, -50%) scale(0.95)'; }}
                    onMouseUp={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                    onTouchStart={e=>{ if(!dialed.length) return; e.currentTarget.style.background='rgba(40,190,60,0.25)'; e.currentTarget.style.transform='translate(-50%, -50%) scale(0.95)'; }}
                    onTouchEnd={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                    onTouchCancel={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                  />

                  {/* TapHint aligned to call button (step 1 only) */}
                  <TapHint
                    selector={'button[aria-label="발신"]'}
                    width={'55px'}
                    height={'55px'}
                    offsetX={0}
                    offsetY={0}
                    borderRadius={'50%'}
                    onActivate={()=>{ if(dialed.length) next(); }}
                    ariaLabel={'발신 버튼 힌트'}
                  />

                  {/* Backspace (bottom-right small) */}
                  <button
                    type="button"
                    aria-label="지우기"
                    disabled={!dialed.length}
                    onClick={()=> setDialed(d => d.slice(0, -1))}
                    style={{
                      position:'absolute', left:'calc(82% - 20px)', top:'calc(84% - 10px)', transform:'translate(-50%, -50%)',
                      width:'5.5%', height:'4%', borderRadius:'8px',
                      background:'transparent',
                      border:'none', cursor: dialed.length ? 'pointer' : 'default', zIndex:3
                    }}
                    onMouseDown={e=>{ if(!dialed.length) return; e.currentTarget.style.background='rgba(0,0,0,0.10)'; e.currentTarget.style.transform='translate(-50%, -50%) scale(0.95)'; }}
                    onMouseUp={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                    onTouchStart={e=>{ if(!dialed.length) return; e.currentTarget.style.background='rgba(0,0,0,0.12)'; e.currentTarget.style.transform='translate(-50%, -50%) scale(0.95)'; }}
                    onTouchEnd={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                    onTouchCancel={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translate(-50%, -50%) scale(1)'; }}
                  />
                </>
              )}
              {step === 2 && !showIntermediate && (
                <TapHint
                  selector={'button[aria-label="메시지 보내기"]'}
                  width={'65px'}
                  height={'65px'}
                  offsetX={(38 - 37)}
                  offsetY={(-67.5 + 50)}
                  borderRadius={'50%'}
                  fixedSize={true}
                  onActivate={handleHintActivate}
                  suppressInitial={step === total}
                  ariaLabel={'전송 버튼 힌트'}
                />
              )}
              {/* 호출 레슨의 최종 단계(3/3)에서는 채팅바를 표시하지 않습니다. */}
              {/* 제출된 텍스트 버블은 호출 레슨에서 사용하지 않습니다. */}
              {/* 호출 레슨의 최종 단계(3/3)에서는 가상 키보드를 표시하지 않습니다. */}
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
                <button type="button" onClick={()=>navigate('/call/learn')} className={frameStyles.primaryBtn}>완료</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
