import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import frameStyles from './SmsLessonFrame.module.css';
import lt from '../../styles/learnTitle.module.css';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
import { useScoringProgress } from '../../lib/useScoringProgress';
import { getChapterId, ChapterDomain } from '../../lib/chapters';
import api from '../../lib/api';
import stepsConfig from './SmsMdeleteLessonSteps.js';
import mdel1 from '../../assets/mdel1.png';
import mdel2 from '../../assets/mdel2.png';
import mdel3 from '../../assets/mdel3.png';
import mdel4 from '../../assets/mdel4.png';
import mdel5 from '../../assets/mdel5.png';
import mdel6 from '../../assets/mdel6.png';

export default function SmsMdeletePractice({ practiceTracker = null, finalizeAndSave = null }){
  const navigate = useNavigate();
  const steps = stepsConfig;
  const total = steps.length;
  const [step, setStep] = useState(1);
  const current = steps.find(s => s.id === step) || steps[0];

  // user fetch for scoring
  const [user, setUser] = useState(null);
  useEffect(() => {
    const raw = localStorage.getItem('accessToken');
    if (!raw) return;
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/users/me');
        if (mounted) setUser(data);
      } catch (e) { void e; }
    })();
    return () => { mounted = false; };
  }, []);

  // scoring tracker
  const chapterId = getChapterId(ChapterDomain.SMS, 2); // sms mdelete chapter index assumption
  const scoringHook = useScoringProgress({ user, chapterId, expertTimeSec: 20, stepsRequired: total, shouldSave: () => true });
  const localTracker = scoringHook?.tracker;
  const localFinalize = scoringHook?.finalizeAndSave;
  const tracker = practiceTracker || localTracker;
  const finalizeSave = finalizeAndSave || localFinalize;

  // timer
  const startedAtRef = useRef(null);
  const timerRef = useRef(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  useEffect(() => {
    startedAtRef.current = Date.now();
    setElapsedSec(0);
    timerRef.current = setInterval(() => {
      const start = startedAtRef.current || Date.now();
      setElapsedSec(Math.floor((Date.now() - start) / 1000));
    }, 250);
    try { tracker?.start && tracker.start(); } catch (e) { void e; }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      try { tracker?.end && tracker.end(); } catch (e) { void e; }
    };
  }, [tracker]);

  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
  function formatElapsedForResult(elapsed) {
    if (elapsed == null || Number.isNaN(Number(elapsed))) return '-';
    const e = Number(elapsed);
    if (e <= 0) return '0초 00';
    if (e >= 60) { const mm = Math.floor(e / 60).toString().padStart(2, '0'); const ss = Math.floor(e % 60).toString().padStart(2, '0'); return `${mm}:${ss}`; }
    const sec = Math.floor(e); const centis = Math.round((e - sec) * 100); const cs = String(centis).padStart(2, '0');
    return `${sec}초 ${cs}`;
  }

  // hint
  const [showHint, setShowHint] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const hintTimerRef = useRef(null);
  const hintStorageKey = 'practiceHintCount:sms:mdelete';
  useEffect(() => {
    try { localStorage.setItem(hintStorageKey, '0'); } catch (e) { void e; }
    setHintCount(0);
    return () => {
      try { localStorage.removeItem(hintStorageKey); } catch (e) { void e; }
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [hintStorageKey]);

  function useHint() {
    let next = null;
    try {
      const cur = Number(localStorage.getItem(hintStorageKey) || '0') || 0;
      if (step <= Math.min(3, total)) {
        next = cur + 1;
        localStorage.setItem(hintStorageKey, String(next));
        setHintCount(next);
      }
    } catch (e) { void e; }
    setShowHint(true);
    try { if (step <= Math.min(3, total)) tracker?.markHint && tracker.markHint(); } catch (e) { void e; }
  }

  function next() {
    try { tracker?.markCorrect && tracker.markCorrect(step); } catch (e) { void e; }
    setShowHint(false);
    setStep(s => Math.min(total, s + 1));
  }

  useEffect(() => {
    setShowHint(false);
    if (hintTimerRef.current) { clearTimeout(hintTimerRef.current); hintTimerRef.current = null; }
  }, [step]);

  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showWrongPopup, setShowWrongPopup] = useState(false);

  async function submitPractice() {
    // If we finalize early (e.g., step 5/6), mark remaining steps as correct so success scoring applies.
    try {
      tracker?.markCorrect && tracker.markCorrect(step);
      if (step < total) {
        for (let i = step + 1; i <= total; i++) {
          try { tracker?.markCorrect && tracker.markCorrect(i); } catch (e2) { void e2; }
        }
      }
    } catch (e) { void e; }
    try { tracker && typeof tracker.end === 'function' && tracker.end(); } catch (e) { void e; }

    if (finalizeSave) {
      try {
        const res = await finalizeSave();
        try {
          const finalMs = startedAtRef.current ? (Date.now() - startedAtRef.current) : (res?.score?.derived?.elapsedSec ? (res.score.derived.elapsedSec * 1000) : 0);
          const finalSec = Math.round((finalMs / 10)) / 100; if (res && res.score) res.score.derived = { ...(res.score.derived || {}), elapsedSec: finalSec };
        } catch (e) { void e; }
        setResult(res);
        try { localStorage.setItem('practiceScore:sms:mdelete', JSON.stringify(res?.score ?? null)); } catch (e) { void e; }
      } catch (e) {
        void e;
        try {
          const score = tracker?.scoreNow ? tracker.scoreNow() : null;
          try {
            const finalMs = startedAtRef.current ? (Date.now() - startedAtRef.current) : (score?.derived?.elapsedSec ? (score.derived.elapsedSec * 1000) : 0);
            const finalSec = Math.round((finalMs / 10)) / 100; if (score) score.derived = { ...(score.derived || {}), elapsedSec: finalSec };
          } catch (e2) { void e2; }
          setResult({ score });
          try { localStorage.setItem('practiceScore:sms:mdelete', JSON.stringify(score ?? null)); } catch (e2) { void e2; }
        } catch (e2) { void e2; setResult(null); }
      }
    } else {
      try {
        const score = tracker?.scoreNow ? tracker.scoreNow() : null;
        setResult({ score });
        try { localStorage.setItem('practiceScore:sms:mdelete', JSON.stringify(score ?? null)); } catch (e) { void e; }
      } catch (e) { void e; setResult(null); }
    }
  }

  const imageForStep = (s) => {
    // mirror learn mapping
    if (s === 1) return mdel1;
    if (s === 2) return mdel2;
    if (s === 4) return mdel4;
    if (s === 5) return mdel5;
    if (s === 6) return mdel6;
    return mdel3;
  };

  return (
    <div className={frameStyles.framePage}>
      <BackButton to="/sms/practice" variant="fixed" />
      <header className={frameStyles.frameHeader}>
        <h1 className={`${frameStyles.frameTitle} ${lt.withAccent}`}>
          <span className="titleText">문자 삭제하기</span>
          <span className={frameStyles.inlineTagline}>원하지 않는 문자를 삭제하는 과정을 연습합니다.</span>
        </h1>
      </header>

      <div className={frameStyles.lessonRow}>
        <div
          className={frameStyles.deviceCol}
          onClickCapture={(e) => {
            // Allow TapHint clicks (including step-specific labels like '삭제 버튼 힌트')
            try {
              const path = e.nativeEvent?.composedPath ? e.nativeEvent.composedPath() : (e.nativeEvent && e.nativeEvent.path) || [];
              if (path && path.length) {
                for (const node of path) {
                  if (!node || !node.getAttribute) continue;
                  const al = node.getAttribute('aria-label') || '';
                  // allow any element whose aria-label contains '힌트'
                  if (al.includes('힌트')) return;
                }
              } else {
                const tgt = e.target;
                if (tgt && tgt.closest && tgt.closest('[aria-label*="힌트"]')) return;
              }
            } catch { /* ignore */ }
            e.stopPropagation();
            e.preventDefault();
            try { tracker?.markError && tracker.markError(step); } catch { /* ignore */ }
            setShowWrongPopup(true);
          }}
        >
          <PhoneFrame image={imageForStep(step)} screenWidth={'278px'} aspect={'278 / 450'} scale={1}>
            {/* Use the same in-phone marker targets and TapHint sizes as Learn */}
            {step === 1 && (
              <>
                <div aria-hidden className="sms-del-target-1" style={{ position: 'absolute', left: '50%', top: '32%', width: '100%', height: '15%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
                <TapHint selector={'.sms-del-target-1'} width={'279px'} height={'59px'} borderRadius={'10px'} onActivate={next} suppressInitial={true} invisible={!showHint} ariaLabel={'탭 힌트'} />
              </>
            )}

            {step === 2 && (
              <>
                <div aria-hidden className="sms-del-target-2" style={{ position: 'absolute', left: '86%', top: '46.5%', width: 50, height: 27, transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
                <TapHint selector={'.sms-del-target-2'} width={'50px'} height={'25px'} borderRadius={'8px'} onActivate={next} suppressInitial={true} invisible={!showHint} ariaLabel={'탭 힌트'} />
              </>
            )}

            {step === 3 && (
              <>
                <div aria-hidden className="sms-del-target-delete" style={{ position: 'absolute', right: 9, top: '49.6%', width: 90, height: 27, borderRadius: 20, transform: 'none', pointerEvents: 'none' }} />
                <TapHint selector={'.sms-del-target-delete'} width={'90px'} height={'24px'} borderRadius={'12px'} onActivate={next} suppressInitial={true} invisible={!showHint} ariaLabel={'삭제 버튼 힌트'} />
              </>
            )}

            {step === 4 && (
              <>
                <div aria-hidden className="sms-del-target-2" style={{ position: 'absolute', left: '92%', top: '46.6%', width: 25, height: 25, transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
                <TapHint selector={'.sms-del-target-2'} width={'50px'} height={'25px'} borderRadius={'13px'} onActivate={next} suppressInitial={true} invisible={!showHint} ariaLabel={'탭 힌트'} />
              </>
            )}

            {step === 5 && (
              <>
                <div aria-hidden className="sms-del-target-2" style={{ position: 'absolute', left: '9%', top: '92.5%', width: 35, height: 35, transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
                {/* Step 5 TapHint finalizes immediately */}
                <TapHint selector={'.sms-del-target-2'} width={'50px'} height={'25px'} borderRadius={'13px'} onActivate={submitPractice} suppressInitial={true} invisible={!showHint} ariaLabel={'탭 힌트'} />
              </>
            )}

            {step === total && (
              <TapHint selector={null} width={'60%'} height={'12%'} onActivate={submitPractice} suppressInitial={true} invisible={!showHint} ariaLabel={'탭 힌트'} />
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
                  <button type="button" onClick={() => setShowDetails(s => !s)} className={frameStyles.ghostBtn} aria-expanded={showDetails} aria-controls="result-details" style={{ padding: '6px 10px', fontSize: 13 }}>{showDetails ? '세부점수 숨기기' : '세부점수 보기'}</button>
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
      {showWrongPopup && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)', zIndex: 160 }}>
          <div style={{ background: '#fff', padding: 18, borderRadius: 10, minWidth: 240 }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>틀렸습니다</div>
            <div style={{ marginBottom: 14 }}>탭힌트를 눌러 진행해 주세요.</div>
            <div style={{ textAlign: 'right' }}>
              <button className={frameStyles.primaryBtn} onClick={()=> setShowWrongPopup(false)}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
