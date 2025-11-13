import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
import VirtualKeyboard from '../../components/VirtualKeyboard/VirtualKeyboard';
import frameStyles from '../Sms/SmsLessonFrame.module.css';
import lt from '../../styles/learnTitle.module.css';
import { buildCallLessonConfig, topicMeta } from './callDynamicSteps.js';
import { useScoringProgress } from '../../lib/useScoringProgress';
import { ChapterDomain, getChapterId } from '../../lib/chapters';

// 한글 조합 테이블 (CallSaveLesson과 동일)
const CHO = ['\u0000','ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNG = ['\u0000','ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONG = ['\u0000','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const VCOMB = { 'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ' };
const JCOMB = { 'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ' };

export default function CallSavePractice({ practiceTracker = null, finalizeAndSave = null }){
  const navigate = useNavigate();
  // Load lesson config for 'save'
  const { steps: rawSteps, screens } = useMemo(() => buildCallLessonConfig('save'), []);
  // Use only first 4 steps for practice (step 4 = 저장 버튼 탭 시 즉시 채점)
  const steps = useMemo(() => {
    const s1 = rawSteps.find(s => s.id === 1);
    const s2 = rawSteps.find(s => s.id === 2);
    const s3 = rawSteps.find(s => s.id === 3);
    const s4 = rawSteps.find(s => s.id === 4);
    return [
      s1 ? { ...s1, id: 1 } : { id: 1, title: '새 연락처 추가', instruction: '새 연락처 추가 버튼을 눌러보세요.' },
      s2 ? { ...s2, id: 2 } : { id: 2, title: '이름과 전화번호 입력', instruction: '입력 영역을 눌러 입력해 보세요.' },
      s3 ? { ...s3, id: 3 } : { id: 3, title: '이름 입력', instruction: '이름을 입력해 보세요.' },
      s4 ? { ...s4, id: 4 } : { id: 4, title: '전화번호 입력', instruction: '전화번호를 입력하고 저장을 눌러보세요.' },
    ];
  }, [rawSteps]);

  const total = steps.length || 4;
  const [step, setStep] = useState(1);
  const current = useMemo(() => steps.find(s => s.id === step) || steps[0] || {}, [steps, step]);

  // scoring & timer
  const chapterId = getChapterId(ChapterDomain.CALL, 1); // save assumed to be second CALL topic
  const scoringHook = useScoringProgress({ user: null, chapterId, expertTimeSec: 30, stepsRequired: total, shouldSave: () => true });
  const tracker = practiceTracker || scoringHook?.tracker;
  const finalizeSave = finalizeAndSave || scoringHook?.finalizeAndSave;

  const startedAtRef = useRef(null);
  const timerRef = useRef(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  useEffect(()=>{
    startedAtRef.current = Date.now();
    setElapsedSec(0);
    timerRef.current = setInterval(()=>{
      const start = startedAtRef.current || Date.now();
      setElapsedSec(Math.floor((Date.now() - start)/1000));
    }, 250);
    try { tracker?.start && tracker.start(); } catch { /* ignore */ }
    return ()=> { if(timerRef.current) clearInterval(timerRef.current); try { tracker?.end && tracker.end(); } catch { /* ignore */ } };
  }, [tracker]);

  function formatTime(sec){ const m=Math.floor(sec/60).toString().padStart(2,'0'); const s=Math.floor(sec%60).toString().padStart(2,'0'); return `${m}:${s}`; }
  function formatElapsedForResult(e){ if(e==null||Number.isNaN(Number(e))) return '-'; const n=Number(e); if(n>=60){ const mm=Math.floor(n/60).toString().padStart(2,'0'); const ss=Math.floor(n%60).toString().padStart(2,'0'); return `${mm}:${ss}`; } const s=Math.floor(n); const cs=Math.round((n-s)*100).toString().padStart(2,'0'); return `${s}초 ${cs}`; }

  // hint system
  const [showHint, setShowHint] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const hintKey = 'practiceHintCount:call:save';
  useEffect(()=>{ try { localStorage.setItem(hintKey,'0'); } catch { /* ignore */ } setHintCount(0); return ()=>{ try { localStorage.removeItem(hintKey); } catch { /* ignore */ } }; }, []);
  function useHint(){ try { const cur = Number(localStorage.getItem(hintKey)||'0')||0; const next = cur+1; localStorage.setItem(hintKey,String(next)); setHintCount(next); } catch { /* ignore */ } setShowHint(true); try { tracker?.markHint && tracker.markHint(); } catch { /* ignore */ } }
  useEffect(()=>{ setShowHint(false); }, [step]);

  // result & wrong-click popup
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showWrongPopup, setShowWrongPopup] = useState(false);

  async function finalizePractice(){
    try { tracker?.markCorrect && tracker.markCorrect(step); } catch { /* ignore */ }
    if(step < total){ for(let i=step+1;i<=total;i++){ try { tracker?.markCorrect && tracker.markCorrect(i); } catch { /* ignore */ } } }
    try { tracker?.end && tracker.end(); } catch { /* ignore */ }
    if(finalizeSave){
      try {
        const res = await finalizeSave();
        try { const ms = startedAtRef.current ? (Date.now()-startedAtRef.current) : 0; const sec = Math.round(ms/10)/100; if(res && res.score){ res.score.derived = { ...(res.score.derived||{}), elapsedSec: sec }; } } catch { /* ignore */ }
        setResult(res);
        try { localStorage.setItem('practiceScore:call:save', JSON.stringify(res?.score ?? null)); } catch { /* ignore */ }
        return;
      } catch { /* ignore */ }
    }
    try { const score = tracker?.scoreNow ? tracker.scoreNow() : null; setResult({ score }); try { localStorage.setItem('practiceScore:call:save', JSON.stringify(score ?? null)); } catch { /* ignore */ } } catch { setResult(null); }
  }

  function next(){ try { tracker?.markCorrect && tracker.markCorrect(step); } catch { /* ignore */ } setStep(s=> Math.min(total, s+1)); }

  // 입력 상태 (step3/4)
  const [answer, setAnswer] = useState('');
  const [comp, setComp] = useState({ lead:'', vowel:'', tail:'' });
  const compRef = useRef(comp);
  useEffect(()=>{ compRef.current = comp; }, [comp]);

  function combineVowel(a,b){ if(!a||!b) return null; return VCOMB[a+b]||null; }
  function combineJong(a,b){ if(!a||!b) return null; return JCOMB[a+b]||null; }
  function flushComposition(snapshot){ const snap = snapshot || compRef.current; const {lead,vowel,tail} = snap; setComp({lead:'', vowel:'', tail:''}); if(!lead && !vowel && !tail) return; if(!lead && vowel){ setAnswer(a=> a + vowel); return; } const L = CHO.indexOf(lead); const V = JUNG.indexOf(vowel); const T = JONG.indexOf(tail); if(L>0 && V>0){ const syll = String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T>=0?T:0)); setAnswer(a=> a + syll); } else { setAnswer(a=> a + (lead||'') + (vowel||'') + (tail||'')); } }
  function handleJamoInput(ch){ const prev = compRef.current; if(JUNG.includes(ch)){ if(prev.tail){ const isCompositeTail = Object.values(JCOMB).includes(prev.tail); if(isCompositeTail){ let left=null,right=null; for(const k in JCOMB){ if(JCOMB[k]===prev.tail){ left=k.charAt(0); right=k.charAt(1); break; } } if(left && right){ flushComposition({lead: prev.lead, vowel: prev.vowel, tail: left}); setComp({lead: right, vowel: ch, tail:''}); return; } flushComposition(prev); setComp({lead:'', vowel: ch, tail:''}); return; } const tailChar = prev.tail; flushComposition({lead: prev.lead, vowel: prev.vowel, tail:''}); setComp({lead: tailChar, vowel: ch, tail:''}); return; } if(prev.lead && prev.vowel){ const comb2 = combineVowel(prev.vowel, ch); if(comb2){ setComp({...prev, vowel: comb2}); return; } flushComposition(prev); setComp({lead:'', vowel: ch, tail:''}); return; } if(prev.lead && !prev.vowel){ setComp({...prev, vowel: ch}); return; } if(!prev.lead){ setAnswer(a=> a + ch); return; } flushComposition(prev); setAnswer(a=> a + ch); return; }
    if(CHO.includes(ch)){ if(!prev.lead){ setComp({...prev, lead: ch}); return; } if(prev.lead && !prev.vowel){ flushComposition(prev); setComp({lead: ch, vowel:'', tail:''}); return; } if(prev.lead && prev.vowel && !prev.tail){ if(JONG.includes(ch)){ setComp({...prev, tail: ch}); return; } flushComposition(prev); setComp({lead: ch, vowel:'', tail:''}); return; } if(prev.lead && prev.vowel && prev.tail){ const comb3 = combineJong(prev.tail, ch); if(comb3){ setComp({...prev, tail: comb3}); return; } flushComposition(prev); setComp({lead: ch, vowel:'', tail:''}); return; } }
    flushComposition(prev); setAnswer(a=> a + ch); }
  function composePreview(snapshot){ const src = snapshot || comp; const {lead,vowel,tail} = src; if(!lead && !vowel && !tail) return ''; if(!lead && vowel) return vowel; const L = CHO.indexOf(lead); const V = JUNG.indexOf(vowel); const T = JONG.indexOf(tail); if(L>0 && V>0){ return String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T>=0?T:0)); } return (lead||'') + (vowel||'') + (tail||''); }
  function handleVKKey(ch){ if(ch===' ') { flushComposition(); setAnswer(a=> a + ' '); return; } if(ch==='\n'){ flushComposition(); setAnswer(a=> a + '\n'); return; } handleJamoInput(ch); }
  function handleVKBackspace(){ const c = compRef.current; if(c.tail){ setComp({...c, tail:''}); return; } if(c.vowel){ setComp({...c, vowel:''}); return; } if(c.lead){ setComp({...c, lead:''}); return; } setAnswer(a=> a.slice(0,-1)); }
  function handleVKEnter(){ flushComposition(); setAnswer(a=> a + '\n'); }

  // step3/4 확정 텍스트 고정값 (learn과 동일 UI)
  const [savedStep3, setSavedStep3] = useState('');

  const nextWithSaves = ()=>{
    if(step === 3){ const final3 = answer + composePreview(compRef.current); setSavedStep3(final3); setAnswer(''); setComp({ lead:'', vowel:'', tail:'' }); }
    next();
  };

  // TapHint geometry copied from CallSaveLesson
  const tapHintConfig = {
    1: { selector: null, x:'50%', y:'50%', offsetX:118, offsetY:193, width:'20px', height:'20px', borderRadius:'20%', ariaLabel:'새 연락처 추가 힌트' },
    2: { selector: null, x:'50%', y:'42%', offsetX:0, offsetY:-100, width:'100%', height:'8%', borderRadius:'10px', ariaLabel:'입력 영역 힌트' },
    3: { selector: null, x:'8.25%', y:'44.25%', offsetX:0, offsetY:0, width:'20px', height:'20px', borderRadius:'50%', ariaLabel:'이름 입력 필드 힌트' },
    4: { selector: null, x:'91.5%', y:'9%', offsetX:0, offsetY:0, width:'29px', height:'20px', borderRadius:'20%', ariaLabel:'저장 버튼 힌트' }
  };

  function renderTapHint(){
    const cfg = tapHintConfig[step];
    if(!cfg) return null;
    const onActivate = step === 4 ? finalizePractice : nextWithSaves;
    return (
      <TapHint
        {...cfg}
        onActivate={onActivate}
        suppressInitial={false}
        invisible={!showHint}
      />
    );
  }

  function renderTextOverlayStep3(){
    if(step !== 3) return null;
    const value = answer + composePreview(comp);
    return (
      <div aria-hidden style={{position:'absolute', left:'5%', top:'21.5%', transform:'none', minWidth:'40px', maxWidth:'84%', whiteSpace:'nowrap', fontSize:'13px', fontWeight:300, color:'#111', textAlign:'left', overflow:'hidden'}}>
        <span>{value}</span>
        <span className="callCursor" aria-hidden="true"></span>
      </div>
    );
  }

  function renderTextOverlayStep4(){
    if(step !== 4) return null;
    const value = answer + composePreview(comp);
    return (
      <div aria-hidden style={{position:'absolute', left:'37%', top:'36%', transform:'none', minWidth:'40px', maxWidth:'84%', whiteSpace:'nowrap', fontSize:'13px', fontWeight:300, color:'#111', textAlign:'left', overflow:'hidden'}}>
        <span>{value}</span>
        <span className="callCursor" aria-hidden="true"></span>
      </div>
    );
  }

  function renderFixedStep3On4(){
    if(step !== 4 || !savedStep3) return null;
    return (
      <div aria-hidden style={{position:'absolute', left:'4%', top:'15%', transform:'none', minWidth:'40px', maxWidth:'84%', whiteSpace:'nowrap', fontSize:'13px', fontWeight:300, color:'#111', textAlign:'left', overflow:'hidden', opacity:0.95}}>
        {savedStep3}
      </div>
    );
  }

  // Allow only TapHint and VirtualKeyboard interactions inside device; others trigger wrong-click popup
  function handleDeviceClickCapture(e){
    try {
      const path = e.nativeEvent?.composedPath ? e.nativeEvent.composedPath() : [];
      if(path && path.length){
        for(const node of path){
          if(!node) continue;
          // allow TapHint
          if(node.getAttribute && (node.getAttribute('data-tap-hint') === '1' || (node.getAttribute('aria-label')||'').includes('힌트'))) return;
          // allow VirtualKeyboard
          if(node.getAttribute && node.getAttribute('data-virtual-keyboard') === '1') return;
        }
      } else {
        const tgt = e.target;
        if(tgt && tgt.closest){
          if(tgt.closest('[data-tap-hint="1"]') || tgt.closest('[aria-label*="힌트"]') || tgt.closest('[data-virtual-keyboard="1"]')) return;
        }
      }
    } catch { /* ignore */ }
    e.stopPropagation(); e.preventDefault();
    try { tracker?.markError && tracker.markError(step); } catch { /* ignore */ }
    setShowWrongPopup(true);
  }

  return (
    <div className={frameStyles.framePage}>
      <BackButton to="/call/practice" variant="fixed" />
      <header className={frameStyles.frameHeader}>
        <h1 className={`${frameStyles.frameTitle} ${lt.withAccent}`}>
          <span className="titleText">{topicMeta.save.title} 연습</span>
          <span className={frameStyles.inlineTagline}>{current.instruction || topicMeta.save.tagline}</span>
        </h1>
      </header>
      <div className={frameStyles.lessonRow}>
        <div className={frameStyles.deviceCol} onClickCapture={handleDeviceClickCapture}>
          <PhoneFrame image={screens[step] || screens[1]} screenWidth={'278px'} aspect={'278 / 450'} scale={1}>
            <style>{`
              @keyframes callCursorBlink { 0% { opacity:1; } 49.9% { opacity:1; } 50% { opacity:0; } 100% { opacity:0; } }
              .callCursor { display:inline-block; width:2px; margin-left:2px; height:1.05em; vertical-align:text-bottom; border-radius:1.5px; background:#2980ff; box-shadow:0 0 4px #5aa4ff,0 0 8px rgba(41,128,255,0.65); animation: callCursorBlink 0.9s steps(2, start) infinite; }
            `}</style>
            {renderTapHint()}
            {renderTextOverlayStep3()}
            {renderFixedStep3On4()}
            {renderTextOverlayStep4()}
            {(step === 3 || step === 4) && (
              <VirtualKeyboard allowEnglish={false} onKey={handleVKKey} onBackspace={handleVKBackspace} onEnter={handleVKEnter} />
            )}
          </PhoneFrame>
        </div>
        <div className={frameStyles.sidePanel}>
          <div className={frameStyles.captionBar}>
            <div className={frameStyles.progressHeader}>
              <div className={frameStyles.stepMeta}>
                <span className={frameStyles.stepCount}>{step} / {total}</span>
                <span className={frameStyles.stepTitle}>{current.title}</span>
              </div>
            </div>
            <div className={frameStyles.captionDivider} />
            <div style={{ marginTop:8, color:'#666' }}>시간: {formatTime(elapsedSec)}</div>
            <div style={{ marginTop:12, display:'flex', gap:10, alignItems:'center' }}>
              <button className={frameStyles.ghostBtn} onClick={useHint} aria-label="힌트 보기">힌트 보기</button>
              <div style={{ color:'#666' }}>힌트 사용: {hintCount}</div>
            </div>
            <div style={{ marginTop:18, display:'flex', gap:8 }}></div>
          </div>
        </div>
      </div>
      {showWrongPopup && (
        <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.35)', zIndex:160 }}>
          <div style={{ background:'#fff', padding:18, borderRadius:10, minWidth:240 }}>
            <div style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>틀렸습니다</div>
            <div style={{ marginBottom:14 }}>다시 시도해 보세요.</div>
            <div style={{ textAlign:'right' }}>
              <button className={frameStyles.primaryBtn} onClick={()=> setShowWrongPopup(false)}>확인</button>
            </div>
          </div>
        </div>
      )}
      {result && (
        <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.4)', zIndex:200 }}>
          <div style={{ background:'#fff', padding:22, borderRadius:12, minWidth:320, maxWidth:560 }}>
            <div style={{ display:'flex', alignItems:'center', gap:18 }}>
              <div style={{ flex:'0 0 120px', textAlign:'center' }}>
                <div style={{ fontSize:48, fontWeight:800, color:'#10B981' }}>{result?.score?.total ?? '-'}</div>
                <div style={{ fontSize:14, color:'#666' }}>/ 100</div>
              </div>
              <div style={{ flex:'1 1 auto' }}>
                <h3 style={{ margin:0 }}>연습 결과</h3>
                <div style={{ marginTop:8, display:'flex', gap:8, alignItems:'center' }}>
                  <button type="button" onClick={()=> setShowDetails(s=>!s)} className={frameStyles.ghostBtn} aria-expanded={showDetails} aria-controls="call-save-result-details" style={{ padding:'6px 10px', fontSize:13 }}>{showDetails ? '세부점수 숨기기' : '세부점수 보기'}</button>
                  <div style={{ color:'#666', fontSize:13 }}>시간: {formatElapsedForResult(result?.score?.derived?.elapsedSec)}</div>
                </div>
              </div>
            </div>
            {showDetails && (
              <div id="call-save-result-details" style={{ marginTop:14, padding:12, borderRadius:8, background:'#fafafa', border:'1px solid #eee' }}>
                <strong>세부 점수</strong>
                <div style={{ marginTop:8 }}>
                  <div>시간 점수: {result?.score?.breakdown?.timeScore ?? '-'} / 30</div>
                  <div>정확도 점수: {result?.score?.breakdown?.errorScore ?? '-'} / 20</div>
                  <div>성공 점수: {result?.score?.breakdown?.successScore ?? '-'} / 50</div>
                  <div>부분 진행 보너스: {result?.score?.breakdown?.progressBonus ?? '-'} / 10</div>
                  <div>힌트 패널티: {result?.score?.breakdown?.hintPenalty ?? '-'} (힌트당 -5, 최대 감점 -20)</div>
                </div>
              </div>
            )}
            <div style={{ marginTop:16, display:'flex', justifyContent:'flex-end' }}>
              <button className={frameStyles.primaryBtn} onClick={()=> { setResult(null); navigate('/call/practice'); }}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
