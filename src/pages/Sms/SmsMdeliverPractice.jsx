import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import frameStyles from './SmsLessonFrame.module.css';
import lt from '../../styles/learnTitle.module.css';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
import VirtualKeyboard from '../../components/VirtualKeyboard/VirtualKeyboard';
import { useScoringProgress } from '../../lib/useScoringProgress';
import { getChapterId, ChapterDomain } from '../../lib/chapters';
import api from '../../lib/api';
import stepsConfig from './SmsMdeliverLessonSteps.js';
import mdeliver1 from '../../assets/mdeliver1.png';
import mdeliver2 from '../../assets/mdeliver2.png';
import mdeliver3 from '../../assets/mdeliver3.png';
import mdeliver4 from '../../assets/mdeliver4.png';
import mdeliver5 from '../../assets/mdeliver5.png';
import mdel1 from '../../assets/mdel1.png';
import mdel2 from '../../assets/mdel2.png';
import mdel3 from '../../assets/mdel3.png';

// Practice page for 문자 전달하기 based on SmsMdeliverLesson, following the pattern of SmsMsendPractice.
export default function SmsMdeliverPractice({ practiceTracker = null, finalizeAndSave = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  const debugHints = qs.get('debugHints') === '1';

  const [step, setStep] = useState(1);
  const steps = stepsConfig;
  const total = steps.length; // 8 steps
  const current = steps.find(s => s.id === step) || steps[0];

  // user + scoring setup (save all attempts)
  const [user, setUser] = useState(null);
  useEffect(() => {
    const raw = localStorage.getItem('accessToken');
    if (!raw) return;
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/users/me');
        if (mounted) setUser(data);
      } catch { /* ignore */ }
    })();
    return () => { mounted = false; };
  }, []);

  const chapterId = getChapterId(ChapterDomain.SMS, 0);
  // 마지막 8단계는 완료 안내 화면이므로 성공 판정은 7단계까지 수행 시 부여
  const scoringHook = useScoringProgress({ user, chapterId, expertTimeSec: 40, stepsRequired: total - 1, shouldSave: () => true });
  const localTracker = scoringHook?.tracker;
  const localFinalize = scoringHook?.finalizeAndSave;
  const tracker = practiceTracker || localTracker;
  const finalizeSave = finalizeAndSave || localFinalize;

  // answer composition (recipient name etc. on step 5)
  const [answer, setAnswer] = useState('');
  const [comp, setComp] = useState({ lead: '', vowel: '', tail: '' });
  const compRef = useRef({ lead: '', vowel: '', tail: '' });
  function updateComp(next) { setComp(next); compRef.current = next; }
  function updateCompFn(fn) { setComp(prev => { const next = fn(prev); compRef.current = next; return next; }); }

  const CHO = ['\u0000','ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const JUNG = ['\u0000','ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
  const JONG = ['\u0000','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const VCOMB = { 'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ' };
  const JCOMB = { 'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ' };
  function combineVowel(a,b){ if(!a||!b) return null; return VCOMB[`${a}${b}`]||null; }
  function combineJong(a,b){ if(!a||!b) return null; return JCOMB[`${a}${b}`]||null; }

  function flushComposition(snapshot){ const {lead, vowel, tail} = snapshot || compRef.current; updateComp({lead:'', vowel:'', tail:''}); if(!lead && !vowel && !tail) return; if(!lead && vowel){ setAnswer(a=> a + vowel); return; } const L = CHO.indexOf(lead) >= 0 ? CHO.indexOf(lead) : -1; const V = JUNG.indexOf(vowel) >= 0 ? JUNG.indexOf(vowel) : -1; const T = JONG.indexOf(tail) >= 0 ? JONG.indexOf(tail) : 0; if(L>0 && V>0){ const syll = String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T)); setAnswer(a=> a + syll); } else { setAnswer(a=> a + (lead||'') + (vowel||'') + (tail||'')); } }
  function composePreview(){ const {lead, vowel, tail} = comp; if(!lead && !vowel && !tail) return ''; if(!lead && vowel) return vowel; const L = CHO.indexOf(lead) >= 0 ? CHO.indexOf(lead) : -1; const V = JUNG.indexOf(vowel) >= 0 ? JUNG.indexOf(vowel) : -1; const T = JONG.indexOf(tail) >= 0 ? JONG.indexOf(tail) : 0; if(L>0 && V>0){ return String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T)); } return (lead||'') + (vowel||'') + (tail||''); }
  function handleJamoInput(ch){ const prev = compRef.current; if(JUNG.includes(ch)){ if(prev.tail){ const isCompositeTail = Object.values(JCOMB).includes(prev.tail); if(isCompositeTail){ let left=null,right=null; for(const k in JCOMB){ if(JCOMB[k]===prev.tail){ left=k.charAt(0); right=k.charAt(1); break; } } if(left&&right){ const snapLeft={lead:prev.lead,vowel:prev.vowel,tail:left}; flushComposition(snapLeft); updateComp({lead:right,vowel:ch,tail:''}); return; } flushComposition(prev); updateComp({lead:'',vowel:ch,tail:''}); return; } const tailChar=prev.tail; const snap2={lead:prev.lead,vowel:prev.vowel,tail:''}; flushComposition(snap2); updateComp({lead:tailChar,vowel:ch,tail:''}); return; } if(prev.lead && prev.vowel){ const comb=combineVowel(prev.vowel,ch); if(comb){ updateComp({...prev,vowel:comb}); return; } flushComposition(prev); updateComp({lead:'',vowel:ch,tail:''}); return; } if(prev.lead && !prev.vowel){ updateComp({...prev,vowel:ch}); return; } if(!prev.lead){ setAnswer(a=> a + ch); return; } flushComposition(prev); setAnswer(a=> a + ch); return; }
    if(CHO.includes(ch)){
      if(!prev.lead){ updateComp({...prev,lead:ch}); return; }
      if(prev.lead && !prev.vowel){ flushComposition(prev); updateComp({lead:ch,vowel:'',tail:''}); return; }
      if(prev.lead && prev.vowel && !prev.tail){ if(JONG.includes(ch)){ updateComp({...prev,tail:ch}); return; } flushComposition(prev); updateComp({lead:ch,vowel:'',tail:''}); return; }
      if(prev.lead && prev.vowel && prev.tail){ const combined=combineJong(prev.tail,ch); if(combined){ updateComp({...prev,tail:combined}); return; } flushComposition(prev); updateComp({lead:ch,vowel:'',tail:''}); return; }
    }
    flushComposition(prev); setAnswer(a=> a + ch); return;
  }

  // keyboard only shown on step 5 (recipient entry stage)
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => { setKeyboardVisible(step === 5); }, [step]);

  // timer + scoring progression
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
    return ()=>{ if(timerRef.current) clearInterval(timerRef.current); try { tracker?.end && tracker.end(); } catch { /* ignore */ } };
  }, [tracker]);
  function formatTime(sec){ const m = Math.floor(sec/60).toString().padStart(2,'0'); const s = Math.floor(sec%60).toString().padStart(2,'0'); return `${m}:${s}`; }
  function formatElapsedForResult(elapsed){ if(elapsed==null||Number.isNaN(Number(elapsed))) return '-'; const e=Number(elapsed); if(e<=0) return '0초 00'; if(e>=60){ const mm=Math.floor(e/60).toString().padStart(2,'0'); const ss=Math.floor(e%60).toString().padStart(2,'0'); return `${mm}:${ss}`; } const sec=Math.floor(e); const centis=Math.round((e-sec)*100); return `${sec}초 ${String(centis).padStart(2,'0')}`; }

  // hint handling (limit counting to first 3 steps, similar to msend practice)
  const [showHint, setShowHint] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const hintStorageKey = 'practiceHintCount:sms:mdeliver';
  useEffect(()=>{ try { localStorage.setItem(hintStorageKey,'0'); } catch {} setHintCount(0); return ()=>{ try { localStorage.removeItem(hintStorageKey); } catch {}; }; }, [hintStorageKey]);
  function useHint(){ let next=null; try { const cur = Number(localStorage.getItem(hintStorageKey) || '0') || 0; if(step <= 3){ next = cur + 1; localStorage.setItem(hintStorageKey, String(next)); setHintCount(next); } } catch {} setShowHint(true); try { if(step <= 3) tracker?.markHint && tracker.markHint(); } catch {} }
  useEffect(()=>{ setShowHint(false); }, [step]);

  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Wrong popup when user taps outside target interactive areas on active steps
  const [showWrongPopup, setShowWrongPopup] = useState(false);

  function next(){ try { tracker?.markCorrect && tracker.markCorrect(step); } catch {} setShowHint(false); setStep(s => Math.min(total, s + 1)); }

  async function finalizePractice(){
    try { tracker?.markCorrect && tracker.markCorrect(step); } catch {}
    try { tracker && typeof tracker.end === 'function' && tracker.end(); } catch {}
    flushComposition();
    if(finalizeSave){
      try {
        const res = await finalizeSave();
        try {
          const finalMs = startedAtRef.current ? (Date.now() - startedAtRef.current) : (res?.score?.derived?.elapsedSec ? (res.score.derived.elapsedSec * 1000) : 0);
          const finalSec = Math.round((finalMs / 10)) / 100;
          if(res && res.score){ res.score.derived = { ...(res.score.derived || {}), elapsedSec: finalSec }; }
        } catch {}
        setResult(res);
        try { localStorage.setItem('practiceScore:sms:mdeliver', JSON.stringify(res?.score ?? null)); } catch {}
      } catch {
        try {
          const score = tracker?.scoreNow ? tracker.scoreNow() : null;
          try { const finalMs = startedAtRef.current ? (Date.now() - startedAtRef.current) : (score?.derived?.elapsedSec ? (score.derived.elapsedSec * 1000) : 0); const finalSec = Math.round((finalMs / 10)) / 100; if(score) score.derived = { ...(score.derived || {}), elapsedSec: finalSec }; } catch {}
          setResult({ score });
          try { localStorage.setItem('practiceScore:sms:mdeliver', JSON.stringify(score ?? null)); } catch {}
        } catch { setResult(null); }
      }
    } else {
      try { const score = tracker?.scoreNow ? tracker.scoreNow() : null; setResult({ score }); try { localStorage.setItem('practiceScore:sms:mdeliver', JSON.stringify(score ?? null)); } catch {} } catch { setResult(null); }
    }
  }

  // image mapping replicating lesson sequencing
  function imageForStep(s){
    if(s === 1) return mdel1;
    if(s === 2) return mdel2;
    if(s === 3) return mdel3;
    if(s === 4) return mdeliver1;
    if(s === 5) return mdeliver2;
    if(s === 6) return mdeliver3;
    if(s === 7) return mdeliver4;
    return mdeliver5; // step 8
  }

  return (
    <div className={frameStyles.framePage}>
      <BackButton to="/sms/practice" variant="fixed" />
      <header className={frameStyles.frameHeader}>
        <h1 className={`${frameStyles.frameTitle} ${lt.withAccent}`}>
          <span className="titleText">문자 전달하기</span>
          <span className={frameStyles.inlineTagline}>다른 사람에게 받은 문자를 전달하는 과정을 연습합니다.</span>
        </h1>
      </header>
      <div className={frameStyles.lessonRow}>
        <div
          className={frameStyles.deviceCol}
          onClickCapture={(e) => {
            // restrict wrong-click penalty to interactive steps (exclude 5 when typing and final submission step 8)
            if([5, total].includes(step)) return;
            try {
              const path = e.nativeEvent?.composedPath ? e.nativeEvent.composedPath() : [];
              if(path && path.length){
                for(const node of path){
                  if(!node || !node.getAttribute) continue;
                  const al = node.getAttribute('aria-label');
                  if(al === '가상 키보드' || al === '전송 버튼 힌트') return;
                  if(node.tagName === 'BUTTON' && node.getAttribute('aria-label') === '메시지 보내기') return;
                }
              }
            } catch {}
            e.stopPropagation(); e.preventDefault();
            try { tracker?.markError && tracker.markError(step); } catch {}
            setShowWrongPopup(true);
          }}
        >
          <PhoneFrame image={imageForStep(step)} screenWidth={'278px'} aspect={'278 / 450'} scale={1}>
            {/* Markers for precise TapHint positioning (mirror learn page) */}
            {step === 4 && (
              <div
                aria-hidden
                className="sms-deliver-send-target"
                style={{
                  position: 'absolute',
                  right: -55,
                  bottom: 425,
                  width: 270,
                  height: 28,
                  borderRadius: 999,
                  transform: 'none',
                  pointerEvents: 'none',
                  zIndex: 125
                }}
              />
            )}
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
                  zIndex: 125
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
              onActivate={() => {
                if (step === 7) { // show scoring modal one step early
                  finalizePractice();
                  return;
                }
                if (step === total) {
                  finalizePractice();
                  return;
                }
                next();
              }}
              suppressInitial={step === total}
              invisible={!debugHints && !showHint}
              ariaLabel={'전송 버튼 힌트'}
            />
            {/* Simple live preview (recipient entry) */}
            {step === 5 && (
              <div
                aria-hidden
                style={{
                  position: 'absolute', left: 68, top: 23, maxWidth: '65%', color: '#111', fontSize: '13px', fontWeight: 400,
                  lineHeight: '1.2', fontFamily: '"Noto Sans KR", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  whiteSpace: 'pre-wrap', pointerEvents: 'none', zIndex: 180, display: 'inline-flex', alignItems: 'center', gap: 6
                }}
              >
                <div>{(answer || '') + composePreview()}</div>
                <div style={{ width: 2, height: 20, background: '#111', borderRadius: 1, animation: 'smsCaretBlink 1s steps(1) infinite' }} />
              </div>
            )}
            {keyboardVisible && step === 5 && (
              <VirtualKeyboard
                onKey={(ch)=>{
                  if(ch === ' ') { flushComposition(); setAnswer(a=> a + ' '); }
                  else if(ch === '\n') { /* ignore enter */ }
                  else if(CHO.includes(ch) || JUNG.includes(ch)) { handleJamoInput(ch); }
                  else { flushComposition(); setAnswer(a=> a + ch); }
                }}
                onBackspace={()=>{
                  const ccur = compRef.current;
                  if(ccur.tail){ updateCompFn(c=> ({...c, tail:''})); return; }
                  if(ccur.vowel){ updateCompFn(c=> ({...c, vowel:''})); return; }
                  if(ccur.lead){ updateCompFn(c=> ({...c, lead:''})); return; }
                  setAnswer(a => a.slice(0,-1));
                }}
                onEnter={()=>{/* no direct submit at step 5 */}}
              />
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
            {tracker && <div style={{ marginTop: 8, color: '#666' }}>시간: {formatTime(elapsedSec)}</div>}
            <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
              <button className={frameStyles.ghostBtn} onClick={useHint} aria-label="힌트 보기">힌트 보기</button>
              <div style={{ color: '#666' }}>힌트 사용: {hintCount}</div>
            </div>
          </div>
        </div>
      </div>
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
              <button className={frameStyles.primaryBtn} onClick={() => { setResult(null); navigate('/sms/practice'); }}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
