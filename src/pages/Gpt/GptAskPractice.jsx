import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import frameStyles from '../Sms/SmsLessonFrame.module.css';
import lt from '../../styles/learnTitle.module.css';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
// ChatInputBar 제거: 기기 이미지 하단 바 위에 텍스트만 오버레이
import VirtualKeyboard from '../../components/VirtualKeyboard/VirtualKeyboard';
import stepsBase from './GptAskLessonSteps.js';
import gask1 from '../../assets/gask1.png';
import gask2 from '../../assets/gask2.png';
import gptAsk3 from '../../assets/gptAsk3.png';
import gptAsk3mp4 from '../../assets/gptAsk3.mp4';
import { useScoringProgress } from '../../lib/useScoringProgress';
import { getChapterId, ChapterDomain } from '../../lib/chapters';
import api from '../../lib/api';

export default function GptAskPractice(){
  const navigate = useNavigate();

  const steps = stepsBase;
  const total = steps.length;
  const [step, setStep] = useState(1);
  const current = steps.find(s => s.id === step) || steps[0];

  // user fetch (optional) for server-side attempt saving
  const [user, setUser] = useState(null);
  useEffect(() => {
    const raw = localStorage.getItem('accessToken');
    if (!raw) return;
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/users/me');
        if (mounted) setUser(data);
      } catch {/* ignore */}
    })();
    return () => { mounted = false; };
  }, []);

  // scoring / tracking
  // GPT 챕터 매핑: what(0), ask(1), photo(2), apply(3)
  // DB에 아직 첫 GPT 챕터(11번)만 설정되어 있다면 저장 실패 방지를 위해 0번 인덱스(11)로 매핑
  // 필요 시 서버에서 12번 챕터 생성 후 1로 바꿀 수 있음
  const chapterId = getChapterId(ChapterDomain.GPT, 0);
  const scoringHook = useScoringProgress({ user, chapterId, expertTimeSec: 20, stepsRequired: total, shouldSave: () => true });
  const tracker = scoringHook?.tracker;
  const finalizeSave = scoringHook?.finalizeAndSave;

  // practice timer/result
  const startedAtRef = useRef(null);
  const timerRef = useRef(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  useEffect(() => {
    startedAtRef.current = Date.now();
    setElapsedSec(0);
    timerRef.current = setInterval(() => {
      const start = startedAtRef.current || Date.now();
      setElapsedSec(Math.floor((Date.now() - start) / 1000));
    }, 250);
    try { tracker?.start && tracker.start(); } catch { /* ignore */ }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      try { tracker?.end && tracker.end(); } catch { /* ignore */ }
    };
  }, [tracker]);

  function formatTime(sec){
    const m = Math.floor(sec/60).toString().padStart(2,'0');
    const s = Math.floor(sec%60).toString().padStart(2,'0');
    return `${m}:${s}`;
  }
  function formatElapsedForResult(elapsed){
    if (elapsed == null || Number.isNaN(Number(elapsed))) return '-';
    const e = Number(elapsed);
    if (e <= 0) return '0초 00';
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

  // input + composition (Korean virtual keyboard compatible)
  const [answer, setAnswer] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const lastKeyRef = useRef({ ch: null, t: 0 });
  const [showWrongPopup, setShowWrongPopup] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const hintStorageKey = 'practiceHintCount:gpt:ask';
  const hintTimerRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(hintStorageKey, '0'); } catch { /* ignore */ }
    setHintCount(0);
    return () => {
      try { localStorage.removeItem(hintStorageKey); } catch { /* ignore */ }
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [hintStorageKey]);

  function useHint(){
    try {
      const cur = Number(localStorage.getItem(hintStorageKey) || '0') || 0;
      const next = cur + 1;
      localStorage.setItem(hintStorageKey, String(next));
      setHintCount(next);
    } catch { /* ignore */ }
    setShowHint(true);
    try { tracker?.markHint && tracker.markHint(); } catch { /* ignore */ }
  }

  // Hangul composition helpers
  const CHO = ['\u0000','ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const JUNG = ['\u0000','ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
  const JONG = ['\u0000','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const VCOMB = { 'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ' };
  const JCOMB = { 'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ' };
  const [comp, setComp] = useState({ lead: '', vowel: '', tail: '' });
  const compRef = useRef({ lead: '', vowel: '', tail: '' });
  function updateComp(next){ setComp(next); compRef.current = next; }
  function updateCompFn(fn){ setComp(prev => { const next = fn(prev); compRef.current = next; return next; }); }
  function combineVowel(a,b){ if(!a||!b) return null; const k=`${a}${b}`; return VCOMB[k]||null; }
  function combineJong(a,b){ if(!a||!b) return null; const k=`${a}${b}`; return JCOMB[k]||null; }
  function flushComposition(snapshot){ const {lead, vowel, tail} = snapshot || compRef.current; updateComp({lead:'', vowel:'', tail:''}); if(!lead && !vowel && !tail) return; if(!lead && vowel){ setAnswer(a=> a + vowel); return; } const L = CHO.indexOf(lead) >= 0 ? CHO.indexOf(lead) : -1; const V = JUNG.indexOf(vowel) >= 0 ? JUNG.indexOf(vowel) : -1; const T = JONG.indexOf(tail) >= 0 ? JONG.indexOf(tail) : 0; if(L>0 && V>0){ const syll = String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T)); setAnswer(a=> a + syll); } else { const raw = (lead||'') + (vowel||'') + (tail||''); setAnswer(a=> a + raw); } }
  function composePreview(){ const {lead, vowel, tail} = comp; if(!lead && !vowel && !tail) return ''; if(!lead && vowel) return vowel; const L = CHO.indexOf(lead) >= 0 ? CHO.indexOf(lead) : -1; const V = JUNG.indexOf(vowel) >= 0 ? JUNG.indexOf(vowel) : -1; const T = JONG.indexOf(tail) >= 0 ? JONG.indexOf(tail) : 0; if(L>0 && V>0){ return String.fromCharCode(0xAC00 + (L-1)*21*28 + (V-1)*28 + (T)); } return (lead||'') + (vowel||'') + (tail||''); }

  // Practice: 입력바는 숨기지만 키패드는 단계 2와 최종 단계에서 표시.
  useEffect(()=>{ setKeyboardVisible(step === 2 || step === total); }, [step, total]);

  // 더 이상 Step2 오버레이(미리 입력된 텍스트) 사용하지 않음

  // jamo input handler (same logic as other practices)
  function handleJamoInput(ch){
    const prev = compRef.current;
    if (JUNG.includes(ch)) {
      if (prev.tail) {
        const isCompositeTail = Object.values(JCOMB).includes(prev.tail);
        if (isCompositeTail) {
          let left=null,right=null;
          for (const k in JCOMB) { if (JCOMB[k]===prev.tail) { left=k.charAt(0); right=k.charAt(1); break; } }
          if (left && right) {
            const snapLeft = {lead: prev.lead, vowel: prev.vowel, tail: left};
            flushComposition(snapLeft);
            updateComp({lead: right, vowel: ch, tail: ''});
            return;
          }
          flushComposition(prev);
          updateComp({lead:'', vowel: ch, tail: ''});
          return;
        }
        const tailChar = prev.tail;
        const snap2 = {lead: prev.lead, vowel: prev.vowel, tail: ''};
        flushComposition(snap2);
        updateComp({lead: tailChar, vowel: ch, tail: ''});
        return;
      }
      if (prev.lead && prev.vowel) {
        const comb = combineVowel(prev.vowel, ch);
        if (comb) { updateComp({...prev, vowel: comb}); return; }
        flushComposition(prev);
        updateComp({lead:'', vowel: ch, tail:''});
        return;
      }
      if (prev.lead && !prev.vowel) { updateComp({...prev, vowel: ch}); return; }
      if (!prev.lead) { setAnswer(a=> a + ch); return; }
      flushComposition(prev);
      setAnswer(a=> a + ch);
      return;
    }
    if (CHO.includes(ch)) {
      if (!prev.lead) { updateComp({...prev, lead: ch}); return; }
      if (prev.lead && !prev.vowel) { flushComposition(prev); updateComp({lead: ch, vowel:'', tail:''}); return; }
      if (prev.lead && prev.vowel && !prev.tail) {
        if (JONG.includes(ch)) { updateComp({...prev, tail: ch}); return; }
        flushComposition(prev); updateComp({lead: ch, vowel:'', tail:''}); return;
      }
      if (prev.lead && prev.vowel && prev.tail) {
        const combined = combineJong(prev.tail, ch);
        if (combined) { updateComp({...prev, tail: combined}); return; }
        flushComposition(prev); updateComp({lead: ch, vowel:'', tail:''}); return;
      }
    }
    flushComposition(prev);
    setAnswer(a=> a + ch);
  }

  const imageForStep = useMemo(() => (s) => {
    if (s === 1) return gask1;
    if (s === 2) return gask2;
    return gptAsk3;
  }, []);

  const next = () => {
    try { tracker?.markCorrect && tracker.markCorrect(step); } catch { /* ignore */ }
    setShowHint(false);
    setStep(s => Math.min(total, s + 1));
  };

  useEffect(() => {
    setShowHint(false);
    if (hintTimerRef.current) { clearTimeout(hintTimerRef.current); hintTimerRef.current = null; }
  }, [step]);

  const forceShowResult = useCallback(async (earlyFinalize=false) => {
    try { tracker?.markCorrect && tracker.markCorrect(step); } catch { /* ignore */ }
    // If early finalization (step 2), mark remaining steps as correct for full success score
    if (earlyFinalize && step < total) {
      for (let s = step + 1; s <= total; s++) {
        try { tracker?.markCorrect && tracker.markCorrect(s); } catch { /* ignore */ }
      }
    }
    try { tracker && typeof tracker.end === 'function' && tracker.end(); } catch { /* ignore */ }
    try { flushComposition(); } catch { /* ignore */ }

    if (finalizeSave) {
      try {
        const res = await finalizeSave();
        try {
          const finalMs = startedAtRef.current ? (Date.now() - startedAtRef.current) : (res?.score?.derived?.elapsedSec ? (res.score.derived.elapsedSec * 1000) : 0);
          const finalSec = Math.round((finalMs / 10)) / 100;
          if (res && res.score) res.score.derived = { ...(res.score.derived || {}), elapsedSec: finalSec };
        } catch { /* ignore */ }
        setResult(res);
        try { localStorage.setItem('practiceScore:gpt:ask', JSON.stringify(res?.score ?? null)); } catch { /* ignore */ }
        return;
      } catch (err) {
        console.debug('[GptAskPractice] finalizeSave failed', err);
      }
    }

    try {
      const score = tracker?.scoreNow ? tracker.scoreNow() : null;
      try {
        const finalMs = startedAtRef.current ? (Date.now() - startedAtRef.current) : (score?.derived?.elapsedSec ? (score.derived.elapsedSec * 1000) : 0);
        const finalSec = Math.round((finalMs / 10)) / 100;
        if (score) score.derived = { ...(score.derived || {}), elapsedSec: finalSec };
      } catch { /* ignore */ }
      setResult({ score });
      try { localStorage.setItem('practiceScore:gpt:ask', JSON.stringify(score ?? null)); } catch { /* ignore */ }
    } catch {
      setResult({ score: { total: 0, breakdown: {}, derived: { elapsedSec } } });
    }
  }, [tracker, finalizeSave, step, elapsedSec]);

  async function submitPractice(early=false){
    // validation: require non-empty when input is expected
    const wantsInput = (step === total) && !early; // skip validation on early finalize (step 2)
    if (wantsInput) {
      flushComposition();
      if (!((answer + composePreview()).trim().length > 0)) {
        setResult({ error: '질문을 입력한 후 전송해주세요.' });
        setTimeout(()=> setResult(null), 1500);
        return;
      }
    }
    await forceShowResult(early);
  }

  return (
    <div className={frameStyles.framePage}>
      <BackButton to="/gpt/practice" variant="fixed" />
      <header className={frameStyles.frameHeader}>
        <h1 className={`${frameStyles.frameTitle} ${lt.withAccent}`}>
          <span className="titleText">글로 질문하기</span>
          <span className={frameStyles.inlineTagline}>궁금한 것을 글로 질문하고 전송까지 연습합니다.</span>
        </h1>
      </header>

      <div className={frameStyles.lessonRow}>
        <div
          className={frameStyles.deviceCol}
          onClickCapture={(e) => {
            // 제한된 단계에서만 오답 처리 (1단계, 마지막 단계)
            if (![1, total].includes(step)) return;
            const allow = (node) => {
              if (!node) return false;
              try {
                if (node.getAttribute && node.getAttribute('data-tap-hint') === '1') return true; // TapHint 자체
                if (node.getAttribute && node.getAttribute('data-virtual-keyboard') === '1') return true; // 키보드 루트
                const al = node.getAttribute && node.getAttribute('aria-label');
                if (al === '가상 키보드' || al === '전송 버튼 힌트') return true;
                if (node.tagName === 'BUTTON' && node.getAttribute('aria-label') === '메시지 보내기') return true;
              } catch { /* ignore */ }
              return false;
            };
            try {
              const path = e.nativeEvent?.composedPath ? e.nativeEvent.composedPath() : [];
              if (Array.isArray(path) && path.some(n => allow(n))) {
                // 허용된 요소 클릭: 오류 팝업 표시하지 않음
                return;
              }
              // Fallback: target 기준 조상 탐색
              if (allow(e.target) || (e.target?.closest && (allow(e.target.closest('[data-tap-hint="1"]')) || allow(e.target.closest('[data-virtual-keyboard="1"]')) || allow(e.target.closest('button[aria-label="메시지 보내기"]'))))) {
                return;
              }
            } catch { /* ignore */ }
            // 마지막 단계에서 전송 버튼 자체 클릭은 forceShowResult 처리
            if (step === total && e.target?.closest && e.target.closest('button[aria-label="메시지 보내기"]')) {
              try { forceShowResult(); } catch { /* ignore */ }
              return;
            }
            // 허용되지 않은 영역 클릭: 오답 처리
            e.stopPropagation();
            e.preventDefault();
            try { tracker?.markError && tracker.markError(step); } catch { /* ignore */ }
            setShowWrongPopup(true);
          }}
        >
          <PhoneFrame image={imageForStep(step)} videoSrc={step === 3 ? gptAsk3mp4 : undefined} videoPoster={imageForStep(step)} screenWidth={'278px'} aspect={'278 / 450'} scale={1}>
            {/* 단계별 TapHint 위치 (learn/ask 기준) */}
            {step === 1 && (
              <TapHint
                x={'42%'} y={'92%'} width={'149px'} height={'36px'}
                borderRadius={'0%'}
                onActivate={next}
                invisible={!showHint}
                ariaLabel={'대화창 진입 힌트'}
              />
            )}
            {step === 2 && (
              <TapHint
                x={'89.25%'} y={'51.25%'} width={'34px'} height={'34px'}
                borderRadius={'999px'}
                onActivate={() => { submitPractice(true); }}
                invisible={!showHint}
                ariaLabel={'질문 전송 힌트'}
              />
            )}
            {step === total && (
              <TapHint
                selector={'button[aria-label="메시지 보내기"]'}
                suppressInitial={true}
                onActivate={submitPractice}
                invisible={!showHint && step !== total}
                ariaLabel={'전송 버튼 힌트'}
              />
            )}

            {/* 하단 텍스트 오버레이 (실제 입력 바 대신) */}
            {/* learn/ask 스타일 텍스트 오버레이 (Step2에서 입력 내용 표시) */}
            {keyboardVisible && step === 2 && (
              <div
                style={{
                  position:'absolute',
                  left:'18%',
                  top:'49.5%',
                  width:'88%',
                  transform:'none',
                  fontSize:'13px',
                  fontWeight:300,
                  textAlign:'left',
                  color:'#fff',
                  whiteSpace:'nowrap',
                  zIndex:223,
                  pointerEvents:'none'
                }}
              >
                <span style={{opacity:(answer+composePreview()).length?1:0.6}}>{(answer + composePreview()) || '무엇이든 물어보세요'}</span>
                <span style={{
                  display:'inline-block',
                  width:'2px',
                  height:'1.05em',
                  marginLeft:'2px',
                  verticalAlign:'text-bottom',
                  background:'#2980ff',
                  borderRadius:'1.5px',
                  animation:'gptAskCursorBlink .9s steps(2,start) infinite'
                }}/>
                <style>{`@keyframes gptAskCursorBlink{0%{opacity:1}49.9%{opacity:1}50%{opacity:0}100%{opacity:0}}`}</style>
              </div>
            )}

            {keyboardVisible && (
              <VirtualKeyboard
                onKey={(ch)=>{
                  const now = Date.now();
                  if(lastKeyRef.current.ch === ch && (now - lastKeyRef.current.t) < 120) return;
                  lastKeyRef.current = { ch, t: now };
                  if(ch === ' ') { flushComposition(); setAnswer(a=> a + ' '); }
                  else if(ch === '\n') { /* Enter: 조기 또는 최종 완료 */ submitPractice(step !== total); }
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
                onEnter={()=>{ submitPractice(step !== total); }}
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
              <button className={frameStyles.primaryBtn} onClick={() => { setResult(null); navigate('/gpt/practice'); }}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
