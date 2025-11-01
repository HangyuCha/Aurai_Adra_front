import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import frameStyles from './SmsLessonFrame.module.css';
import lt from '../../styles/learnTitle.module.css';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
import ChatInputBar from '../../components/ChatInputBar/ChatInputBar';
import VirtualKeyboard from '../../components/VirtualKeyboard/VirtualKeyboard';
import { useScoringProgress } from '../../lib/useScoringProgress';
import { getChapterId, ChapterDomain } from '../../lib/chapters';
import api from '../../lib/api';
import stepsConfig from './SmsMsendLessonSteps.js';
import msend1 from '../../assets/msend1.png';
import msend2 from '../../assets/msend2.png';
import msend3 from '../../assets/msend3.png';
import msend4 from '../../assets/msend4.png';

export default function SmsMsendPractice({ practiceTracker = null, finalizeAndSave = null }){
  const navigate = useNavigate();
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  const debugHints = qs.get('debugHints') === '1';

  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const steps = stepsConfig;
  const total = steps.length;
  const current = steps.find(s => s.id === step) || steps[0];

  // scoring: fetch current user (if any) and pass user into the scoring hook so finalizeAndSave
  // can persist per-user progress to the server. We choose to save all attempts (shouldSave => true)
  // to ensure "시행여부와 점수" are recorded for every practice submission.
  useEffect(() => {
    // if there's no token, skip fetching user
    const raw = localStorage.getItem('accessToken');
    if (!raw) return;
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/users/me');
        if (mounted) setUser(data);
      } catch {
        // ignore: user will remain null and scoring will fallback to local storage only
      }
    })();
    return () => { mounted = false; };
  }, []);

  // scoring: get the chapter id for this topic and create the scoring hook.
  const chapterId = getChapterId(ChapterDomain.SMS, 0);
  // prefer saving every attempt so the server records 시행여부 and 점수 for this user
  const scoringHook = useScoringProgress({ user, chapterId, expertTimeSec: 20, stepsRequired: total, shouldSave: () => true });
  const localTracker = scoringHook?.tracker;
  const localFinalize = scoringHook?.finalizeAndSave;
  const tracker = practiceTracker || localTracker;
  const finalizeSave = finalizeAndSave || localFinalize;

  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const lastKeyRef = useRef({ ch: null, t: 0 });
  const [showWrongPopup, setShowWrongPopup] = useState(false);
  // composition state for Korean jamo input (match Learn behavior)
  const [comp, setComp] = useState({lead:'', vowel:'', tail:''});
  const compRef = useRef({lead:'', vowel:'', tail:''});

  function updateComp(next){ setComp(next); compRef.current = next; }
  function updateCompFn(fn){ setComp(prev=>{ const next = fn(prev); compRef.current = next; return next; }); }

  const CHO = ['\u0000','ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const JUNG = ['\u0000','ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
  const JONG = ['\u0000','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const VCOMB = { 'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ' };
  const JCOMB = { 'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ' };

  function combineVowel(a,b){ if(!a||!b) return null; const key = `${a}${b}`; return VCOMB[key]||null; }
  function combineJong(a,b){ if(!a||!b) return null; const key = `${a}${b}`; return JCOMB[key]||null; }

  function flushComposition(snapshot){ const {lead, vowel, tail} = snapshot || compRef.current; updateComp({lead:'', vowel:'', tail:''}); if(!lead && !vowel && !tail) return; if(!lead && vowel){ setAnswer(a=> a + vowel); return; } const L = CHO.indexOf(lead) >= 0 ? CHO.indexOf(lead) : -1; const V = JUNG.indexOf(vowel) >= 0 ? JUNG.indexOf(vowel) : -1; const T = JONG.indexOf(tail) >= 0 ? JONG.indexOf(tail) : 0; if(L>0 && V>0){ const syll = String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T)); setAnswer(a=> a + syll); } else { const raw = (lead||'') + (vowel||'') + (tail||''); setAnswer(a=> a + raw); } }

  

  function composePreview(){ const {lead, vowel, tail} = comp; if(!lead && !vowel && !tail) return ''; if(!lead && vowel) return vowel; const L = CHO.indexOf(lead) >= 0 ? CHO.indexOf(lead) : -1; const V = JUNG.indexOf(vowel) >= 0 ? JUNG.indexOf(vowel) : -1; const T = JONG.indexOf(tail) >= 0 ? JONG.indexOf(tail) : 0; if(L>0 && V>0){ return String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T)); } return (lead||'') + (vowel||'') + (tail||''); }

  function handleJamoInput(ch){ const prev = compRef.current; if(JUNG.includes(ch)){ if(prev.tail){ const isCompositeTail = Object.values(JCOMB).includes(prev.tail); if(isCompositeTail){ let left=null,right=null; for(const k in JCOMB){ if(JCOMB[k]===prev.tail){ left=k.charAt(0); right=k.charAt(1); break; } } if(left && right){ const snapLeft = {lead: prev.lead, vowel: prev.vowel, tail: left}; flushComposition(snapLeft); updateComp({lead: right, vowel: ch, tail: ''}); return; } flushComposition(prev); updateComp({lead:'', vowel: ch, tail: ''}); return; } const tailChar = prev.tail; const snap2 = {lead: prev.lead, vowel: prev.vowel, tail: ''}; flushComposition(snap2); updateComp({lead: tailChar, vowel: ch, tail: ''}); return; } if(prev.lead && prev.vowel){ const comb = combineVowel(prev.vowel, ch); if(comb){ updateComp({...prev, vowel: comb}); return; } flushComposition(prev); updateComp({lead:'', vowel: ch, tail:''}); return; } if(prev.lead && !prev.vowel){ updateComp({...prev, vowel: ch}); return; } if(!prev.lead){ setAnswer(a=> a + ch); return; } flushComposition(prev); setAnswer(a=> a + ch); return; } if(CHO.includes(ch)){ if(!prev.lead){ updateComp({...prev, lead: ch}); return; } if(prev.lead && !prev.vowel){ flushComposition(prev); updateComp({lead: ch, vowel:'', tail:''}); return; } if(prev.lead && prev.vowel && !prev.tail){ if(JONG.includes(ch)){ updateComp({...prev, tail: ch}); return; } flushComposition(prev); updateComp({lead: ch, vowel:'', tail:''}); return; } if(prev.lead && prev.vowel && prev.tail){ const combined = combineJong(prev.tail, ch); if(combined){ updateComp({...prev, tail: combined}); return; } flushComposition(prev); updateComp({lead: ch, vowel:'', tail:''}); return; } } flushComposition(prev); setAnswer(a=> a + ch); return; }

  // mirror learn behavior: show virtual keyboard automatically when on final step
  useEffect(()=>{ if(step === total) setKeyboardVisible(true); }, [step, total]);

  // elapsed timer visible only in practice mode
  const startedAtRef = useRef(null);
  const timerRef = useRef(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  useEffect(()=>{
    // start timer/tracker if available
    startedAtRef.current = Date.now();
    setElapsedSec(0);
    timerRef.current = setInterval(()=>{
      const start = startedAtRef.current || Date.now();
      setElapsedSec(Math.floor((Date.now() - start)/1000));
    }, 250);
    try { tracker?.start && tracker.start(); } catch { /* ignore */ }
    return ()=>{
      if(timerRef.current) clearInterval(timerRef.current);
      try { tracker?.end && tracker.end(); } catch { /* ignore */ }
    };
  }, [tracker]);

  function formatTime(sec){ const m = Math.floor(sec/60).toString().padStart(2,'0'); const s = Math.floor(sec%60).toString().padStart(2,'0'); return `${m}:${s}`; }

  // 결과 모달에서 보여줄 시간 포맷: 초와 센트초(소수 둘째자리)를 가독성 있게 표시
  function formatElapsedForResult(elapsed){
    if (elapsed == null || Number.isNaN(Number(elapsed))) return '-';
    const e = Number(elapsed);
    if (e <= 0) return '0초 00';
    // 분 단위로 길면 MM:SS
    if (e >= 60) {
      const mm = Math.floor(e/60).toString().padStart(2,'0');
      const ss = Math.floor(e%60).toString().padStart(2,'0');
      return `${mm}:${ss}`;
    }
    const sec = Math.floor(e);
    const centis = Math.round((e - sec) * 100);
    const cs = String(centis).padStart(2,'0');
    return `${sec}초 ${cs}`;
  }

  const [showHint, setShowHint] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const hintTimerRef = useRef(null);
  const hintStorageKey = `practiceHintCount:sms:msend`;
  // initialize hint counter when entering this practice: start from 0
  useEffect(() => {
    try {
      localStorage.setItem(hintStorageKey, '0');
    } catch {
      // ignore storage errors
    }
    setHintCount(0);
    return () => {
      // cleanup: remove the per-practice hint counter when leaving this practice
      try { localStorage.removeItem(hintStorageKey); } catch {
        /* ignore */
      }
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [hintStorageKey]);

  function useHint() {
    // Only count hint usage while within steps 1..3 (inclusive).
    // We still show the visual hint regardless of counting rules.
    let next = null;
    try {
      const cur = Number(localStorage.getItem(hintStorageKey) || '0') || 0;
      if (step <= 3) {
        next = cur + 1;
        localStorage.setItem(hintStorageKey, String(next));
        setHintCount(next);
      }
    } catch {
      // ignore storage errors
    }
    // keep the visual hint visible until the user advances to the next step
    setShowHint(true);
    // record hint event in tracker if available (and only count while within step 1..3 stored above)
    try { if (step <= 3) tracker?.markHint && tracker.markHint(); } catch { /* ignore */ }
  }

  

  function next(){
    // record completion for this step
  try { tracker?.markCorrect && tracker.markCorrect(step); } catch { /* ignore */ }
    // hide any visible hint as we move to the next step
    setShowHint(false);
    setStep(s => Math.min(total, s+1));
  }

  // hide hint automatically when the step changes (covers programmatic step changes too)
  useEffect(() => {
    // when step changes, ensure hint is hidden
    setShowHint(false);
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
  }, [step]);

  // unified submit used by send button, virtual keyboard Enter, and TapHint
  async function submitPractice(){
    // mark final step as correct then end tracker/timer
    try { tracker?.markCorrect && tracker.markCorrect(step); } catch { /* ignore */ }
    try { tracker && typeof tracker.end === 'function' && tracker.end(); } catch { /* ignore */ }

  // flush any composing jamo into answer first
  flushComposition();
  // optional: basic validation — require some text
  // (if you want empty submissions to be allowed, remove this check)
  if(!((answer + composePreview()).trim().length > 0)){
      // show a small feedback instead of silently ignoring
      // reuse result area by showing a brief message
      setResult({ error: '메시지를 입력한 후 전송해주세요.' });
      setTimeout(()=> setResult(null), 1500);
      return;
    }

    // finalize and compute score: prefer external finalizeAndSave prop else use local finalize from hook
    if (finalizeSave) {
      try {
        const res = await finalizeSave();
        // Ensure the displayed elapsedSec reflects the local timer (more reliable in UI)
        try {
          const finalMs = startedAtRef.current ? (Date.now() - startedAtRef.current) : (res?.score?.derived?.elapsedSec ? (res.score.derived.elapsedSec * 1000) : 0);
          const finalSec = Math.round((finalMs / 10)) / 100; // two decimal places
          if (res && res.score) {
            res.score.derived = { ...(res.score.derived || {}), elapsedSec: finalSec };
          }
        } catch {
          // ignore formatting errors
        }
        setResult(res);
        try {
          // persist score locally so practice listing can show it
          const key = 'practiceScore:sms:msend';
          localStorage.setItem(key, JSON.stringify(res?.score ?? null));
        } catch { /* ignore */ }
      } catch {
        // fallback to scoring directly
        try {
          const score = tracker?.scoreNow ? tracker.scoreNow() : null;
          // override elapsed with local timer
          try {
            const finalMs = startedAtRef.current ? (Date.now() - startedAtRef.current) : (score?.derived?.elapsedSec ? (score.derived.elapsedSec * 1000) : 0);
            const finalSec = Math.round((finalMs / 10)) / 100;
            if (score) score.derived = { ...(score.derived || {}), elapsedSec: finalSec };
          } catch { /* ignore */ }
          setResult({ score });
          try { localStorage.setItem('practiceScore:sms:msend', JSON.stringify(score ?? null)); } catch { /* ignore */ }
        } catch {
          setResult(null);
        }
      }
    } else {
      try {
        const score = tracker?.scoreNow ? tracker.scoreNow() : null;
        setResult({ score });
        try { localStorage.setItem('practiceScore:sms:msend', JSON.stringify(score ?? null)); } catch { /* ignore */ }
      } catch {
        setResult(null);
      }
    }
  }

  const imageForStep = (s) => {
    if (s === 1) return msend1;
    if (s === 2) return msend2;
    if (s === 3) return msend3;
    return msend4;
  };

  return (
    <div className={frameStyles.framePage}>
      <BackButton to="/sms/practice" variant="fixed" />
      <header className={frameStyles.frameHeader}>
        <h1 className={`${frameStyles.frameTitle} ${lt.withAccent}`}>
          <span className="titleText">문자 보내기</span>
          <span className={frameStyles.inlineTagline}>문자가 왔을 때 확인하고 직접 답장 입력까지 연습합니다.</span>
        </h1>
      </header>

      <div className={frameStyles.lessonRow}>
        <div
          className={frameStyles.deviceCol}
          onClickCapture={(e) => {
            // Active on steps 1, 2 and the final step
            if (![1, 2, total].includes(step)) return;
            // If any element in the event path is the keyboard, the send button, or the hint, allow it
            try {
              const path = e.nativeEvent?.composedPath ? e.nativeEvent.composedPath() : (e.nativeEvent && e.nativeEvent.path) || [];
              // if composedPath is not available, fall back to walking up from target
              if (path && path.length) {
                for (const node of path) {
                  if (!node || !node.getAttribute) continue;
                  const al = node.getAttribute('aria-label');
                  if (al === '가상 키보드' || al === '전송 버튼 힌트') return;
                  if (node.tagName === 'BUTTON' && node.getAttribute('aria-label') === '메시지 보내기') return;
                }
              } else {
                const tgt = e.target;
                if (tgt && tgt.closest && (tgt.closest('button[aria-label="메시지 보내기"]') || tgt.closest('[aria-label="가상 키보드"]') || tgt.closest('[aria-label="전송 버튼 힌트"]'))) {
                  return;
                }
              }
            } catch {
              // defensive: fall back to simple target check
              const tgt = e.target;
              if (tgt && tgt.closest && (tgt.closest('button[aria-label="메시지 보내기"]') || tgt.closest('[aria-label="가상 키보드"]') || tgt.closest('[aria-label="전송 버튼 힌트"]'))) {
                return;
              }
            }
            // otherwise show wrong popup
            e.stopPropagation();
            e.preventDefault();
            try { tracker?.markError && tracker.markError(step); } catch { /* ignore */ }
            setShowWrongPopup(true);
          }}
        >
          <PhoneFrame image={imageForStep(step)} screenWidth={'278px'} aspect={'278 / 450'} scale={1}>
            <TapHint
              selector={'button[aria-label="메시지 보내기"]'}
              width={step === 1 ? '279px' : step === 2 ? '180px' : step === 3 ? '60px' : '18%'}
              height={step === 1 ? '59px' : step === 2 ? '25px' : step === 3 ? '30px' : '8%'}
              offsetX={step === 1 ? 0 : step === 2 ? 38 : step === 3 ? 0 : 0}
              offsetY={step === 1 ? 212 : step === 2 ? -67.5 : step === 3 ? 0 : 0}
              borderRadius={'10px'}
              onActivate={step === total ? submitPractice : next}
              suppressInitial={step === total}
              invisible={!debugHints && !showHint}
              ariaLabel={'전송 버튼 힌트'}
            />

            {/* Input bar placed inside phone (matches learn) */}
            {step === total && (
              <ChatInputBar value={answer + composePreview()} onChange={(v)=>setAnswer(v)} onSubmit={()=>submitPractice()} placeholder={'메시지를 입력하세요'} onFocus={()=>{ setKeyboardVisible(true); }} onBlur={()=>{/* keep keyboard until explicit action */}} readOnly={keyboardVisible} offsetBottom={50} offsetX={0} className={frameStyles.inputRightCenter} />
            )}

            {/* VirtualKeyboard inside PhoneFrame overlay so it appears within the device area */}
            {keyboardVisible && step === total && (
              <VirtualKeyboard
                onKey={(ch)=>{
                  const now = Date.now();
                  if(lastKeyRef.current.ch === ch && (now - lastKeyRef.current.t) < 120) return;
                  lastKeyRef.current = { ch, t: now };
                  if(ch === ' ') { flushComposition(); setAnswer(a=> a + ' '); }
                  else if(ch === '\n') { /* handled by onEnter */ }
                  else if(CHO.includes(ch) || JUNG.includes(ch)) {
                    // handle jamo composition
                    handleJamoInput(ch);
                  } else {
                    flushComposition(); setAnswer(a=> a + ch);
                  }
                }}
                onBackspace={()=>{
                  const ccur = compRef.current;
                  if(ccur.tail){ updateCompFn(c=> ({...c, tail:''})); return; }
                  if(ccur.vowel){ updateCompFn(c=> ({...c, vowel:''})); return; }
                  if(ccur.lead){ updateCompFn(c=> ({...c, lead:''})); return; }
                  setAnswer(a => a.slice(0,-1));
                }}
                onEnter={()=>{ submitPractice(); }}
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
            {/* detailed instruction intentionally hidden in practice mode */}
            {tracker && <div style={{ marginTop: 8, color: '#666' }}>시간: {formatTime(elapsedSec)}</div>}

            <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
              <button className={frameStyles.ghostBtn} onClick={useHint} aria-label="힌트 보기">힌트 보기</button>
              <div style={{ color: '#666' }}>힌트 사용: {hintCount}</div>
            </div>

            {/* ChatInputBar moved into phone overlay to match learn layout (input + keyboard inside device). */}
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

      {/* floating fixed keyboard removed — virtual keyboard is rendered inside PhoneFrame to match learn layout */}

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
