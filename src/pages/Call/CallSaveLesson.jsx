import React, { useMemo, useState, useEffect, useRef } from 'react';
import { buildCallLessonConfig, topicMeta } from './callDynamicSteps.js';
import BackButton from '../../components/BackButton/BackButton';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
import VirtualKeyboard from '../../components/VirtualKeyboard/VirtualKeyboard';
import frameStyles from '../Sms/SmsLessonFrame.module.css';
import lt from '../../styles/learnTitle.module.css';

// 한글 조합 테이블 (GenericLesson에서 가져온 것)
const CHO = ['\u0000','ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNG = ['\u0000','ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONG = ['\u0000','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const VCOMB = { 'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ' };
const JCOMB = { 'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ' };

export default function CallSaveLesson(){
  const { steps, screens } = useMemo(() => buildCallLessonConfig('save'), []);
  const meta = topicMeta.save;
  const [step, setStep] = useState(1);
  const total = steps.length || 1;
  const current = useMemo(() => steps.find(s => s.id === step) || steps[0] || {}, [steps, step]);
  const [answer, setAnswer] = useState(''); // 현재 단계 입력 버퍼 (step3/step4에서 재사용)
  const [savedStep3, setSavedStep3] = useState(''); // step3에서 확정된 문자열을 step4에 고정 표기
  const [savedStep4, setSavedStep4] = useState(''); // step4에서 확정된 문자열을 step5에 고정 표기
  const [comp, setComp] = useState({ lead: '', vowel: '', tail: '' });
  const compRef = useRef(comp);
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(()=>{ compRef.current = comp; }, [comp]);

  function combineVowel(a,b){ if(!a||!b) return null; return VCOMB[a+b]||null; }
  function combineJong(a,b){ if(!a||!b) return null; return JCOMB[a+b]||null; }

  function flushComposition(snapshot){ const snap = snapshot || compRef.current; const {lead,vowel,tail} = snap; setComp({lead:'', vowel:'', tail:''}); if(!lead && !vowel && !tail) return; if(!lead && vowel){ setAnswer(a=> a + vowel); return; } const L = CHO.indexOf(lead); const V = JUNG.indexOf(vowel); const T = JONG.indexOf(tail); if(L>0 && V>0){ const syll = String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T>=0?T:0)); setAnswer(a=> a + syll); } else { setAnswer(a=> a + (lead||'') + (vowel||'') + (tail||'')); } }
  function handleJamoInput(ch){ const prev = compRef.current; if(JUNG.includes(ch)){ if(prev.tail){ const isCompositeTail = Object.values(JCOMB).includes(prev.tail); if(isCompositeTail){ let left=null,right=null; for(const k in JCOMB){ if(JCOMB[k]===prev.tail){ left=k.charAt(0); right=k.charAt(1); break; } } if(left && right){ flushComposition({lead: prev.lead, vowel: prev.vowel, tail: left}); setComp({lead: right, vowel: ch, tail:''}); return; } flushComposition(prev); setComp({lead:'', vowel: ch, tail:''}); return; } const tailChar = prev.tail; flushComposition({lead: prev.lead, vowel: prev.vowel, tail:''}); setComp({lead: tailChar, vowel: ch, tail:''}); return; } if(prev.lead && prev.vowel){ const comb2 = combineVowel(prev.vowel, ch); if(comb2){ setComp({...prev, vowel: comb2}); return; } flushComposition(prev); setComp({lead:'', vowel: ch, tail:''}); return; } if(prev.lead && !prev.vowel){ setComp({...prev, vowel: ch}); return; } if(!prev.lead){ setAnswer(a=> a + ch); return; } flushComposition(prev); setAnswer(a=> a + ch); return; }
    if(CHO.includes(ch)){ if(!prev.lead){ setComp({...prev, lead: ch}); return; } if(prev.lead && !prev.vowel){ flushComposition(prev); setComp({lead: ch, vowel:'', tail:''}); return; } if(prev.lead && prev.vowel && !prev.tail){ if(JONG.includes(ch)){ setComp({...prev, tail: ch}); return; } flushComposition(prev); setComp({lead: ch, vowel:'', tail:''}); return; } if(prev.lead && prev.vowel && prev.tail){ const comb3 = combineJong(prev.tail, ch); if(comb3){ setComp({...prev, tail: comb3}); return; } flushComposition(prev); setComp({lead: ch, vowel:'', tail:''}); return; } }
    flushComposition(prev); setAnswer(a=> a + ch); }
  function composePreview(snapshot){ const src = snapshot || comp; const {lead,vowel,tail} = src; if(!lead && !vowel && !tail) return ''; if(!lead && vowel) return vowel; const L = CHO.indexOf(lead); const V = JUNG.indexOf(vowel); const T = JONG.indexOf(tail); if(L>0 && V>0){ return String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T>=0?T:0)); } return (lead||'') + (vowel||'') + (tail||''); }

  // 자동 음성 (speak 우선)
  useEffect(()=>{ const base = current.speak || current.instruction; if(!base || !('speechSynthesis' in window)) return; window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(base); u.lang='ko-KR'; u.rate=1; try{ const pref=(localStorage.getItem('voice')||'female'); const vs=voices.filter(v=> (v.lang||'').toLowerCase().startsWith('ko')); const pick = vs.find(v=> (v.name||'').toLowerCase().includes(pref)) || vs[0]; if(pick) u.voice = pick; } catch(e) { void e; } u.onend=()=>setSpeaking(false); u.onerror=()=>setSpeaking(false); setSpeaking(true); window.speechSynthesis.speak(u); }, [step, current, voices]);
  useEffect(()=>{ if(!('speechSynthesis' in window)) return; function load(){ const list = window.speechSynthesis.getVoices(); if(list && list.length) setVoices(list); } load(); window.speechSynthesis.addEventListener('voiceschanged', load); return ()=> window.speechSynthesis.removeEventListener('voiceschanged', load); }, []);

  const next = ()=> {
    if(step === 3){
      // 3 -> 4 이동: 현재까지의 입력(미완성 조합 포함)을 step3 고정값으로 저장하고,
      // step4 입력을 위해 버퍼 초기화
      const final3 = answer + composePreview(compRef.current);
      setSavedStep3(final3);
      setAnswer('');
      setComp({ lead:'', vowel:'', tail:'' });
    } else if (step === 4) {
      // 4 -> 5 이동: 현재까지의 입력(미완성 조합 포함)을 step4 고정값으로 저장
      const final4 = answer + composePreview(compRef.current);
      setSavedStep4(final4);
      // step5에서는 입력을 받지 않으므로 버퍼 초기화
      setAnswer('');
      setComp({ lead:'', vowel:'', tail:'' });
    }
    setStep(s => Math.min(total, s+1));
  };
  const prev = ()=> setStep(s => Math.max(1, s-1));

  // TapHint 구성 (1,2 표시, 3: 1과 동일한 크기, 가운데-왼쪽)
  const tapHintConfig = {
    1: { selector: null, x:'50%', y:'50%', offsetX:118, offsetY:193, width:'20px', height:'20px', borderRadius:'20%' },
    2: { selector: null, x:'50%', y:'42%', offsetX:0, offsetY:-100, width:'100%', height:'8%', borderRadius:'10px' },
    3: { selector: null, x:'8.25%', y:'44.25%', offsetX:0, offsetY:0, width:'20px', height:'20px', borderRadius:'50%' },
    // 4단계 TapHint: 기본은 가운데 오른쪽 근처. 필요 시 x/y/offset/size 조정
    4: { selector: null, x:'91.5%', y:'9%', offsetX:0, offsetY:0, width:'29px', height:'20px', borderRadius:'20%' }
  };

  function renderTapHint(){
    const cfg = tapHintConfig[step];
    if(!cfg || cfg.hidden) return null;
    const props = { ...cfg, onActivate:()=>{ if(step < total) next(); } };
    return <TapHint {...props} />;
  }

  // step3 텍스트: 좌측 상단 (8%,10%) 에서 오른쪽으로 확장
  function renderTextOverlay(){
    if(step !== 3) return null;
  const value = answer + composePreview(comp);
    return (
      <div aria-hidden style={{position:'absolute', left:'5%', top:'21.5%', transform:'none', minWidth:'40px', maxWidth:'84%', whiteSpace:'nowrap', fontSize:'13px', fontWeight:300, color:'#111', textAlign:'left', overflow:'hidden'}}>
  <span>{value}</span>
  <span className="callCursor" aria-hidden="true"></span>
      </div>
    );
  }

  // step4: 최종 입력값을 다른 위치에 표시 (좌표/크기 별도 조정 가능)
  function renderTextOverlayStep4(){
    if(step !== 4) return null;
    const value = answer + composePreview(comp); // 4단계에서도 실시간 조합 미리보기 포함
    return (
      <div aria-hidden style={{position:'absolute', left:'37%', top:'36%', transform:'none', minWidth:'40px', maxWidth:'84%', whiteSpace:'nowrap', fontSize:'13px', fontWeight:300, color:'#111', textAlign:'left', overflow:'hidden'}}>
  <span>{value}</span>
  <span className="callCursor" aria-hidden="true"></span>
      </div>
    );
  }

  // step4: step3에서 입력한 확정값을 이전 위치에 그대로 고정 표시
  function renderStep3FixedOnStep4(){
    if(step !== 4) return null;
    if(!savedStep3) return null;
    return (
      <div aria-hidden style={{position:'absolute', left:'4%', top:'15%', transform:'none', minWidth:'40px', maxWidth:'84%', whiteSpace:'nowrap', fontSize:'13px', fontWeight:300, color:'#111', textAlign:'left', overflow:'hidden', opacity:0.95}}>
        {savedStep3}
      </div>
    );
  }

  // step5: step3에서 입력한 확정값을 3단계 위치에 고정 표시
  function renderStep3FixedOnStep5(){
    if(step !== 5) return null;
    if(!savedStep3) return null;
    return (
      <div aria-hidden style={{position:'absolute', left:'50%', top:'24%', transform:'translateX(-50%)', width:'84%', whiteSpace:'normal', fontSize:'30px', fontWeight:300, color:'#ffffffff', textAlign:'center', overflow:'hidden', opacity:0.95}}>
        {savedStep3}
      </div>
    );
  }

  // step5: step4에서 입력한 확정값을 4단계 위치에 고정 표시
  function renderStep4FixedOnStep5(){
    if(step !== 5) return null;
    if(!savedStep4) return null;
    return (
      <div aria-hidden style={{position:'absolute', left:'7%', top:'65%', transform:'none', minWidth:'40px', maxWidth:'84%', whiteSpace:'nowrap', fontSize:'13px', fontWeight:300, color:'#0073ffff', textAlign:'left', overflow:'hidden', opacity:0.95}}>
        {savedStep4}
      </div>
    );
  }

  function handleVKKey(ch){ if(ch===' ') { flushComposition(); setAnswer(a=> a + ' '); return; } if(ch==='\n'){ flushComposition(); setAnswer(a=> a + '\n'); return; } handleJamoInput(ch); }
  function handleVKBackspace(){ const c = compRef.current; if(c.tail){ setComp({...c, tail:''}); return; } if(c.vowel){ setComp({...c, vowel:''}); return; } if(c.lead){ setComp({...c, lead:''}); return; } setAnswer(a=> a.slice(0,-1)); }
  function handleVKEnter(){ flushComposition(); setAnswer(a=> a + '\n'); }

  return (
    <div className={frameStyles.framePage}>
      <BackButton to={'/call/learn'} variant="fixed" />
      <header className={frameStyles.frameHeader}>
        <h1 className={`${frameStyles.frameTitle} ${lt.withAccent}`}>
          <span className="titleText">{meta.title}</span>
          <span className={frameStyles.inlineTagline}>{current.instruction || ''}</span>
        </h1>
      </header>
      <div className={frameStyles.lessonRow}>
        <div className={frameStyles.deviceCol}>
          <PhoneFrame image={screens[step] || screens[1]} screenWidth={'278px'} aspect={'278 / 450'} scale={1}>
            {/* 커서 애니메이션 (TapHint 스타일과 유사한 부드러운 페이드 + 은은한 글로우) */}
            <style>{`
              /* ON/OFF 대비 강화: ON 때 더 밝고 글로우, OFF 완전 투명 */
              @keyframes callCursorBlink {
                0% { opacity:1; }
                49.9% { opacity:1; }
                50% { opacity:0; }
                100% { opacity:0; }
              }
              .callCursor {
                display:inline-block;
                width:2px; /* 살짝 더 얇게 */
                margin-left:2px;
                height:1.05em;
                vertical-align:text-bottom;
                border-radius:1.5px;
                background:#2980ff;
                box-shadow:0 0 4px #5aa4ff,0 0 8px rgba(41,128,255,0.65);
                /* steps(2) 로 0~49.9% (ON), 50~100% (OFF) 두 구간 딱딱 전환 */
                animation: callCursorBlink 0.9s steps(2, start) infinite;
              }
              /* OFF 구간에서는 opacity=0 때문에 그림자도 사라지도록 transition 미사용 (즉각 전환) */
            `}</style>
            {renderTapHint()}
            {renderTextOverlay()}
            {renderStep3FixedOnStep4()}
            {renderTextOverlayStep4()}
            {renderStep3FixedOnStep5()}
            {renderStep4FixedOnStep5()}
            {(step === 3 || step === 4) && (
              <VirtualKeyboard allowEnglish={false} onKey={handleVKKey} onBackspace={handleVKBackspace} onEnter={handleVKEnter} />
            )}
          </PhoneFrame>
        </div>
        <div className={frameStyles.sidePanel}>
          <div className={frameStyles.captionBar} style={{width:'auto', maxWidth:420}}>
            <div className={frameStyles.progressHeader}>
              <div className={frameStyles.stepMeta}>
                <span className={frameStyles.stepCount}>{step} / {total}</span>
                <span className={frameStyles.stepTitle}>{current.title}</span>
              </div>
            </div>
            <div className={frameStyles.captionDivider} />
            <button type="button" onClick={()=>{ const base = current.speak || current.instruction; if(!base || !('speechSynthesis' in window)) return; window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(base); u.lang='ko-KR'; u.rate=1; try{ const pref=(localStorage.getItem('voice')||'female'); const vs=voices.filter(v=> (v.lang||'').toLowerCase().startsWith('ko')); const pick = vs.find(v=> (v.name||'').toLowerCase().includes(pref)) || vs[0]; if(pick) u.voice=pick; } catch(e) { void e; } u.onend=()=>setSpeaking(false); u.onerror=()=>setSpeaking(false); setSpeaking(true); window.speechSynthesis.speak(u); }} className={frameStyles.listenBtn} aria-label="현재 단계 설명 다시 듣기">🔊 {speaking ? '재생 중' : '듣기'}</button>
            <p className={frameStyles.lessonInstruction}>{current.instruction}</p>
            <div className={frameStyles.actionRow}>
              <button type="button" onClick={prev} disabled={step===1} className={frameStyles.ghostBtn}>이전</button>
              {step < total ? (
                <button type="button" onClick={next} className={frameStyles.primaryBtn}>다음</button>
              ) : (
                <button type="button" onClick={()=>window.history.back()} className={frameStyles.primaryBtn}>완료</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
