import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import frameStyles from '../Sms/SmsLessonFrame.module.css';
import lt from '../../styles/learnTitle.module.css';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
import VirtualKeyboard from '../../components/VirtualKeyboard/VirtualKeyboard';
import stepsBase from './GptApplyLessonSteps.js';
import gptAsk2 from '../../assets/gptAsk2.png';
import gptAsk3 from '../../assets/gptAsk3.png';
import GptApply1 from '../../assets/GptApply1.mp4';
import GptApply2 from '../../assets/GptApply2.mp4';
import { useScoringProgress } from '../../lib/useScoringProgress';
import { getChapterId, ChapterDomain } from '../../lib/chapters';
import api from '../../lib/api';

export default function GptApplyPractice(){
  const navigate = useNavigate();
  const steps = stepsBase;
  const total = steps.length; // 3
  const [step, setStep] = useState(1);
  const current = steps.find(s=>s.id===step) || steps[0];

  // screens: step1 image, step2 video1, step3 video2 (poster images reused)
  const imageForStep = useMemo(()=> s => { if(s===1) return gptAsk2; if(s===3) return gptAsk3; return gptAsk2; }, []);
  const videoSrc = useMemo(()=> s => { if(s===2) return GptApply1; if(s===3) return GptApply2; return undefined; }, []);

  // user (progress save)
  const [user, setUser] = useState(null);
  useEffect(()=>{ const token=localStorage.getItem('accessToken'); if(!token) return; let m=true; (async()=>{ try{ const {data}=await api.get('/users/me'); if(m) setUser(data);}catch{} })(); return()=>{m=false}; }, []);

  // 챕터 매핑: apply는 GPT 인덱스 3 (chapter 14)
  const chapterId = getChapterId(ChapterDomain.GPT, 3);
  const scoringHook = useScoringProgress({ user, chapterId, expertTimeSec: 35, stepsRequired: total, shouldSave: () => true });
  const tracker = scoringHook?.tracker;
  const finalizeSave = scoringHook?.finalizeAndSave;

  // timer & result
  const startedAtRef = useRef(null); const timerRef = useRef(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [result, setResult] = useState(null); const [showDetails, setShowDetails] = useState(false);
  useEffect(()=>{ startedAtRef.current=Date.now(); setElapsedSec(0); timerRef.current=setInterval(()=>{ const st=startedAtRef.current||Date.now(); setElapsedSec(Math.floor((Date.now()-st)/1000)); }, 250); try{ tracker?.start && tracker.start(); }catch{} return()=>{ if(timerRef.current) clearInterval(timerRef.current); try{ tracker?.end && tracker.end(); }catch{} }; }, [tracker]);
  function formatTime(sec){ const m=Math.floor(sec/60).toString().padStart(2,'0'); const s=Math.floor(sec%60).toString().padStart(2,'0'); return `${m}:${s}`; }
  function formatElapsedForResult(elapsed){ if(elapsed==null||Number.isNaN(Number(elapsed)))return '-'; const e=Number(elapsed); if(e<=0)return '0초 00'; if(e>=60){ const mm=Math.floor(e/60).toString().padStart(2,'0'); const ss=Math.floor(e%60).toString().padStart(2,'0'); return `${mm}:${ss}`;} const sec=Math.floor(e); const centis=Math.round((e-sec)*100); return `${sec}초 ${String(centis).padStart(2,'0')}`; }

  // keyboard & composition
  const [answer, setAnswer] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(()=>{ setKeyboardVisible(step===1 || step===2); }, [step]);
  const compRef = useRef({ lead:'', vowel:'', tail:'' });
  const [comp, setComp] = useState({ lead:'', vowel:'', tail:'' });
  function updateComp(n){ setComp(n); compRef.current=n; }
  function updateCompFn(fn){ setComp(p=>{ const n=fn(p); compRef.current=n; return n; }); }
  const CHO=['\u0000','ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const JUNG=['\u0000','ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
  const JONG=['\u0000','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const VCOMB={ 'ㅗㅏ':'ㅘ','ㅗㅐ':'ㅙ','ㅗㅣ':'ㅚ','ㅜㅓ':'ㅝ','ㅜㅔ':'ㅞ','ㅜㅣ':'ㅟ','ㅡㅣ':'ㅢ' };
  const JCOMB={ 'ㄱㅅ':'ㄳ','ㄴㅈ':'ㄵ','ㄴㅎ':'ㄶ','ㄹㄱ':'ㄺ','ㄹㅁ':'ㄻ','ㄹㅂ':'ㄼ','ㄹㅅ':'ㄽ','ㄹㅌ':'ㄾ','ㄹㅍ':'ㄿ','ㄹㅎ':'ㅀ','ㅂㅅ':'ㅄ' };
  function flushComposition(snapshot){ const {lead,vowel,tail}=snapshot||compRef.current; updateComp({lead:'',vowel:'',tail:''}); if(!lead&&!vowel&&!tail)return; if(!lead&&vowel){ setAnswer(a=>a+vowel); return;} const L=CHO.indexOf(lead)>=0?CHO.indexOf(lead):-1; const V=JUNG.indexOf(vowel)>=0?JUNG.indexOf(vowel):-1; const T=JONG.indexOf(tail)>=0?JONG.indexOf(tail):0; if(L>0&&V>0){ const syll=String.fromCharCode(0xAC00+(L-1)*21*28+(V-1)*28+T); setAnswer(a=>a+syll);} else { setAnswer(a=>a+(lead||'')+(vowel||'')+(tail||'')); } }
  function composePreview(){ const {lead,vowel,tail}=comp; if(!lead&&!vowel&&!tail)return ''; if(!lead&&vowel)return vowel; const L=CHO.indexOf(lead)>=0?CHO.indexOf(lead):-1; const V=JUNG.indexOf(vowel)>=0?JUNG.indexOf(vowel):-1; const T=JONG.indexOf(tail)>=0?JONG.indexOf(tail):0; if(L>0&&V>0){ return String.fromCharCode(0xAC00+(L-1)*21*28+(V-1)*28+T);} return (lead||'')+(vowel||'')+(tail||''); }
  function combineVowel(a,b){ if(!a||!b) return null; return VCOMB[`${a}${b}`]||null; }
  function combineJong(a,b){ if(!a||!b) return null; return JCOMB[`${a}${b}`]||null; }
  function handleJamoInput(ch){ const prev=compRef.current; if(JUNG.includes(ch)){ if(prev.tail){ const combTail=Object.values(JCOMB).includes(prev.tail); if(combTail){ let left=null,right=null; for(const k in JCOMB){ if(JCOMB[k]===prev.tail){ left=k[0]; right=k[1]; break; } } if(left&&right){ flushComposition({lead:prev.lead,vowel:prev.vowel,tail:left}); updateComp({lead:right,vowel:ch,tail:''}); return;} flushComposition(prev); updateComp({lead:'',vowel:ch,tail:''}); return;} const tailChar=prev.tail; flushComposition({lead:prev.lead,vowel:prev.vowel,tail:''}); updateComp({lead:tailChar,vowel:ch,tail:''}); return;} if(prev.lead&&prev.vowel){ const comb=combineVowel(prev.vowel,ch); if(comb){ updateComp({...prev,vowel:comb}); return;} flushComposition(prev); updateComp({lead:'',vowel:ch,tail:''}); return;} if(prev.lead&&!prev.vowel){ updateComp({...prev,vowel:ch}); return;} if(!prev.lead){ setAnswer(a=>a+ch); return;} flushComposition(prev); setAnswer(a=>a+ch); return;} if(CHO.includes(ch)){ if(!prev.lead){ updateComp({...prev,lead:ch}); return;} if(prev.lead&&!prev.vowel){ flushComposition(prev); updateComp({lead:ch,vowel:'',tail:''}); return;} if(prev.lead&&prev.vowel&&!prev.tail){ if(JONG.includes(ch)){ updateComp({...prev,tail:ch}); return;} flushComposition(prev); updateComp({lead:ch,vowel:'',tail:''}); return;} if(prev.lead&&prev.vowel&&prev.tail){ const combined=combineJong(prev.tail,ch); if(combined){ updateComp({...prev,tail:combined}); return;} flushComposition(prev); updateComp({lead:ch,vowel:'',tail:''}); return;} } flushComposition(prev); setAnswer(a=>a+ch); }

  // hints / wrong popup
  const [showHint, setShowHint] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const hintStorageKey='practiceHintCount:gpt:apply';
  const hintTimerRef = useRef(null);
  useEffect(()=>{ try{ localStorage.setItem(hintStorageKey,'0'); }catch{} setHintCount(0); return()=>{ if(hintTimerRef.current) clearTimeout(hintTimerRef.current); try{ localStorage.removeItem(hintStorageKey);}catch{} }; }, [hintStorageKey]);
  function useHint(){ try{ const cur=Number(localStorage.getItem(hintStorageKey)||'0')||0; const next=cur+1; localStorage.setItem(hintStorageKey,String(next)); setHintCount(next);}catch{} setShowHint(true); try{ tracker?.markHint && tracker.markHint(); }catch{} }
  const [showWrongPopup, setShowWrongPopup] = useState(false);

  const next=()=>{ try{ tracker?.markCorrect && tracker.markCorrect(step);}catch{} setShowHint(false); setStep(s=>Math.min(total,s+1)); };
  useEffect(()=>{ setShowHint(false); if(hintTimerRef.current){ clearTimeout(hintTimerRef.current); hintTimerRef.current=null; } }, [step]);

  const forceShowResult = useCallback(async (early=false)=>{
    try{ tracker?.markCorrect && tracker.markCorrect(step);}catch{}
    if(early && step<total){ for(let s=step+1; s<=total; s++){ try{ tracker?.markCorrect && tracker.markCorrect(s);}catch{} } }
    try{ tracker && tracker.end && tracker.end(); }catch{}
    flushComposition();
    if(finalizeSave){ try{ const res=await finalizeSave(); const finalMs=startedAtRef.current?(Date.now()-startedAtRef.current):0; const finalSec=Math.round((finalMs/10))/100; if(res&&res.score) res.score.derived={...(res.score.derived||{}), elapsedSec:finalSec}; setResult(res); try{ localStorage.setItem('practiceScore:gpt:apply', JSON.stringify(res?.score ?? null)); }catch{} return; }catch(e){ console.debug('[GptApplyPractice] finalizeSave failed', e); } }
    try{ const score=tracker?.scoreNow?tracker.scoreNow():null; const finalMs=startedAtRef.current?(Date.now()-startedAtRef.current):0; const finalSec=Math.round((finalMs/10))/100; if(score) score.derived={...(score.derived||{}), elapsedSec:finalSec}; setResult({ score }); try{ localStorage.setItem('practiceScore:gpt:apply', JSON.stringify(score ?? null)); }catch{} } catch { setResult({ score:{ total:0, breakdown:{}, derived:{ elapsedSec } } }); }
  }, [tracker, finalizeSave, step, total, elapsedSec]);
  async function submitPractice(early=false){ const wantsInput=(step===total)&&!early; flushComposition(); if(wantsInput && !((answer+composePreview()).trim().length>0)){ setResult({ error:'프롬프트를 입력 후 전송해주세요.' }); setTimeout(()=>setResult(null),1500); return; } await forceShowResult(early); }

  return (
    <div className={frameStyles.framePage}>
      <BackButton to="/gpt/practice" variant="fixed" />
      <header className={frameStyles.frameHeader}>
        <h1 className={`${frameStyles.frameTitle} ${lt.withAccent}`}>
          <span className="titleText">스타일 적용 연습</span>
          <span className={frameStyles.inlineTagline}>지브리 등 스타일 키워드 활용 프롬프트 작성</span>
        </h1>
      </header>
      <div className={frameStyles.lessonRow}>
        <div
          className={frameStyles.deviceCol}
          onClickCapture={(e)=>{
            // allow safe elements, otherwise mark error
            const allow=node=>{ if(!node) return false; try{ if(node.getAttribute && node.getAttribute('data-tap-hint')==='1') return true; if(node.getAttribute && node.getAttribute('data-virtual-keyboard')==='1') return true; const al=node.getAttribute && node.getAttribute('aria-label'); if(al==='가상 키보드'||al==='전송 버튼 힌트') return true; if(node.tagName==='BUTTON' && node.getAttribute('aria-label')==='메시지 보내기') return true; }catch{} return false; };
            try{ const path=e.nativeEvent?.composedPath?e.nativeEvent.composedPath():[]; if(Array.isArray(path)&&path.some(n=>allow(n))) return; if(allow(e.target)|| (e.target?.closest && (allow(e.target.closest('[data-tap-hint="1"]'))||allow(e.target.closest('[data-virtual-keyboard="1"]'))||allow(e.target.closest('button[aria-label="메시지 보내기"]'))))) return; }catch{}
            if(step===total && e.target?.closest && e.target.closest('button[aria-label="메시지 보내기"]')){ forceShowResult(); return; }
            e.stopPropagation(); e.preventDefault(); try{ tracker?.markError && tracker.markError(step);}catch{} setShowWrongPopup(true);
          }}
        >
          <PhoneFrame image={imageForStep(step)} videoSrc={videoSrc(step)} videoPoster={imageForStep(step)} screenWidth={'278px'} aspect={'278 / 450'} scale={1}>
            {/* Step1 hint */}
            {step===1 && (
              <TapHint selector={null} x={'89%'} y={'64%'} width={'30px'} height={'30px'} borderRadius={'999px'} offsetX={0} offsetY={80} onActivate={next} invisible={!showHint} ariaLabel={'스텝1 탭힌트'} />
            )}
            {/* Step2 hint (early finalize) */}
            {step===2 && (
              <TapHint selector={null} x={'83.25%'} y={'51.25%'} width={'40px'} height={'40px'} borderRadius={'999px'} onActivate={()=>submitPractice(true)} invisible={false} ariaLabel={'스텝2 탭힌트'} />
            )}
            {/* Step3 send button hint (always visible) */}
            {step===total && (
              <TapHint selector={'button[aria-label="메시지 보내기"]'} onActivate={submitPractice} invisible={false} ariaLabel={'전송 버튼 힌트'} />
            )}
            {/* Step1 floating bar */}
            {keyboardVisible && step===1 && (
              <div style={{ position:'absolute', left:'16%', top:'42%', width:'58%', fontSize:'13px', fontWeight:300, color:'#fff', background:'rgba(18,20,23,0.6)', padding:'10px 14px', borderRadius:'12px', boxShadow:'0 8px 20px rgba(0,0,0,0.45)', zIndex:30, display:'flex', alignItems:'center', gap:'8px', backdropFilter:'blur(4px)' }}>
                <span style={{ flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', opacity: (answer+composePreview()).length?1:.8 }}>{(answer+composePreview())||current?.inputPlaceholder||'무엇이든 물어보세요'}</span>
                <span style={{ width:'2px', height:'1.05em', background:'#2980ff', borderRadius:'1px', animation:'gptApplyCursorBlink .9s steps(2,start) infinite' }} />
                <style>{`@keyframes gptApplyCursorBlink{0%{opacity:1}49.9%{opacity:1}50%{opacity:0}100%{opacity:0}}`}</style>
              </div>
            )}
            {/* Step2 bottom bar */}
            {keyboardVisible && step===2 && (
              <div style={{ position:'absolute', left:'4%', right:'4%', bottom:'200px', height:'35px', display:'flex', alignItems:'center', padding:'10px 18px', borderRadius:'999px', background:'rgba(0,0,0,0.96)', color:'#fff', fontSize:'15px', zIndex:40, boxShadow:'0 14px 40px rgba(0,0,0,0.6)', pointerEvents:'none' }}>
                <span style={{ flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{(answer+composePreview())||current?.inputPlaceholder||'무엇이든 물어보세요'}</span>
                <span style={{ width:'2px', height:'1.05em', background:'#2980ff', borderRadius:'1px', marginLeft:'8px', animation:'gptApplyCursorBlink .9s steps(2,start) infinite' }} />
              </div>
            )}
            {/* keyboard */}
            {keyboardVisible && (
              <VirtualKeyboard
                onKey={(ch)=>{ if(ch===' '){ flushComposition(); setAnswer(a=>a+' ');} else if(ch==='\n'){ submitPractice(step!==total); } else if(CHO.includes(ch)||JUNG.includes(ch)){ handleJamoInput(ch); } else { flushComposition(); setAnswer(a=>a+ch); } }}
                onBackspace={()=>{ const c=compRef.current; if(c.tail){ updateCompFn(p=>({...p,tail:''})); return;} if(c.vowel){ updateCompFn(p=>({...p,vowel:''})); return;} if(c.lead){ updateCompFn(p=>({...p,lead:''})); return;} setAnswer(a=>a.slice(0,-1)); }}
                onEnter={()=>{ submitPractice(step!==total); }}
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
            {tracker && <div style={{ marginTop:8, color:'#666' }}>시간: {formatTime(elapsedSec)}</div>}
            <div style={{ marginTop:12, display:'flex', gap:10, alignItems:'center' }}>
              <button className={frameStyles.ghostBtn} onClick={useHint}>힌트 보기</button>
              <div style={{ color:'#666' }}>힌트 사용: {hintCount}</div>
            </div>
          </div>
        </div>
      </div>

      {showWrongPopup && (
        <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.35)', zIndex:120 }}>
          <div style={{ background:'#fff', padding:18, borderRadius:8, minWidth:220 }}>
            <div style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>틀렸습니다</div>
            <div style={{ marginBottom:12 }}>다시 시도해 보세요.</div>
            <div style={{ textAlign:'right' }}>
              <button className={frameStyles.primaryBtn} onClick={()=>setShowWrongPopup(false)}>확인</button>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.35)', zIndex:200 }}>
          <div style={{ background:'#fff', padding:22, borderRadius:12, minWidth:320, maxWidth:560, boxShadow:'0 8px 30px rgba(0,0,0,0.25)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:18 }}>
              <div style={{ flex:'0 0 120px', textAlign:'center' }}>
                <div style={{ fontSize:48, fontWeight:800, color:'#10B981' }}>{result?.score?.total ?? '-'}</div>
                <div style={{ fontSize:14, color:'#666' }}>/ 100</div>
              </div>
              <div style={{ flex:'1 1 auto' }}>
                <h3 style={{ margin:0 }}>연습 결과</h3>
                <div style={{ marginTop:8, display:'flex', gap:8, alignItems:'center' }}>
                  <button type="button" onClick={()=>setShowDetails(s=>!s)} className={frameStyles.ghostBtn} aria-expanded={showDetails} aria-controls="result-details" style={{ padding:'6px 10px', fontSize:13 }}>{showDetails ? '세부점수 숨기기' : '세부점수 보기'}</button>
                  <div style={{ color:'#666', fontSize:13 }}>시간: {formatElapsedForResult(result?.score?.derived?.elapsedSec)}</div>
                </div>
              </div>
            </div>
            {showDetails && (
              <div id="result-details" style={{ marginTop:14, padding:12, borderRadius:8, background:'#fafafa', border:'1px solid #eee' }}>
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
              <button className={frameStyles.primaryBtn} onClick={()=>{ setResult(null); navigate('/gpt/practice'); }}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}