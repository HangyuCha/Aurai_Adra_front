// ===== Learn version copied for practice (component renamed) =====
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// chatInputStyles import removed (no direct class reference)
import ChatInputBar from '../../components/ChatInputBar/ChatInputBar.jsx';
import { buildCallLessonConfig, topicMeta } from './callDynamicSteps.js';
import BackButton from '../../components/BackButton/BackButton';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TapHint from '../../components/TapHint/TapHint';
import VirtualKeyboard from '../../components/VirtualKeyboard/VirtualKeyboard';
import frameStyles from '../Sms/SmsLessonFrame.module.css';
import lt from '../../styles/learnTitle.module.css';
import { useScoringProgress } from '../../lib/useScoringProgress';
import { ChapterDomain, getChapterId } from '../../lib/chapters';

export default function CallFixPractice(){
  const navigate = useNavigate();
  const { steps: rawSteps, screens: rawScreens } = useMemo(() => buildCallLessonConfig('fix'), []);
  const meta = topicMeta.fix;
  const removedStepId = 3;
  const altImageForStep2 = rawScreens[3];
  const removedStepId2 = 5;
  const steps = useMemo(() => {
    const once = rawSteps.filter(s => s.id !== removedStepId).map(s => ({ ...s, id: s.id > removedStepId ? s.id - 1 : s.id }));
    const twice = once.filter(s => s.id !== removedStepId2).map(s => ({ ...s, id: s.id > removedStepId2 ? s.id - 1 : s.id }));
    return twice.map(s => (s.id === 2 || s.id === 4) ? { ...s, inputPlaceholder: '수정할 내용을 입력하세요' } : s);
  }, [rawSteps]);
  const [typedInStep2, setTypedInStep2] = useState(false);
  // step2BottomText removed; gating now uses step2KeyPressCount directly
  const [step2KeyPressCount, setStep2KeyPressCount] = useState(0);
  const [step2TypedValue, setStep2TypedValue] = useState('');
  // currentStep must be defined before any memo/useHint referencing it
  const [currentStep, setCurrentStep] = useState(1);
  // new: directly track textarea value for step2 search
  const step2Active = useMemo(()=> currentStep===2, [currentStep]);
  const [isStep3Active, setIsStep3Active] = useState(false);
  const [isStep4Active, setIsStep4Active] = useState(false);
  const [randName, setRandName] = useState('');
  const [randPhone, setRandPhone] = useState('');
  const [isStep5Active, setIsStep5Active] = useState(false);
  const [finalizedName, setFinalizedName] = useState('');
  const [finalizedPhone, setFinalizedPhone] = useState('');
  const [lockedFinals, setLockedFinals] = useState(false);
  const [editTarget, setEditTarget] = useState('name');
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [hasEditedStep4, setHasEditedStep4] = useState(false);
  // Practice uses controlled input + composition; skip DOM polling used in learn
  const USE_COMPOSED_INPUT = true;
  const H_BASE = 0xAC00, H_END = 0xD7A3, V = 21, T = 28;
  const CHO_HEAD = useMemo(() => ['\u0000','ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'], []);
  const stripJong = (ch) => { if(!ch || ch.length !== 1) return ch; const code = ch.charCodeAt(0); if(code < H_BASE || code > H_END) return ch; const idx = code - H_BASE; const l = Math.floor(idx / (V*T)); const v = Math.floor((idx % (V*T)) / T); const t = idx % T; if(t===0) return ch; const newCode = H_BASE + (l*V + v)*T; return String.fromCharCode(newCode); };
  const dedupeTail = useCallback((current, base) => { const c=(current??'').toString(); const b=(base??'').toString(); if(!c||!b) return c; const last=b.slice(-1); const lastNoJong=stripJong(last); if(c===b+last) return b; if(c===b+lastNoJong){ const code=last.charCodeAt(0); const idx=code - H_BASE; const L=Math.floor(idx/(V*T))+1; const lead=CHO_HEAD[L]||lastNoJong; return b.slice(0,-1)+lead; } return c; }, [CHO_HEAD]);
  const sanitizePhone = (val) => { if(!val) return val; return val.replace(/[\u3131-\u318E\uAC00-\uD7A3]+$/g,''); };
  function setTextareaValueSafely(ta,value){ if(!ta) return; try{ const desc=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value'); if(desc&&typeof desc.set==='function') desc.set.call(ta,value); else ta.value=value; ta.dispatchEvent(new Event('input',{bubbles:true})); } catch { try{ ta.value=value; ta.dispatchEvent(new Event('input',{bubbles:true})); } catch {/* ignore */} } }
  const captureFinals = useCallback(() => { try{ const base=(randName||step2TypedValue||''); const currentName=(editedName||randName||''); const nameShown=dedupeTail(currentName, base); const currentPhone=(editedPhone||randPhone||''); const phoneShown=sanitizePhone(currentPhone); setFinalizedName(nameShown); setFinalizedPhone(phoneShown); setLockedFinals(true); } catch {/* ignore */} }, [randName, step2TypedValue, editedName, editedPhone, randPhone, dedupeTail]);
  useEffect(()=>{ function handlePointer(e){ const overlayEl=document.querySelector('div[style*="z-index: 123"]'); if(!overlayEl) return; const kbRoot=e.target.closest('[data-virtual-keyboard="1"]'); if(!kbRoot) return; const btn=e.target.closest('button'); if(!btn) return; const label=(btn.getAttribute('aria-label')||btn.textContent||'').trim(); if(['123','ABC','#+=','한','⇧'].includes(label)) return; setStep2KeyPressCount(c=>c+1);} window.addEventListener('pointerdown',handlePointer,true); return ()=> window.removeEventListener('pointerdown',handlePointer,true);}, []);
  // Step2 input status: drive from controlled state rather than DOM; TapHint shows only after a few key presses
  useEffect(()=>{
    let timer;
    function poll(){
      if(!step2Active){ timer = window.setTimeout(poll, 160); return; }
      const txt = (step2TypedValue || '').trim();
      if(!typedInStep2 && txt.length > 0){ setTypedInStep2(true); }
      // gating handled by step2KeyPressCount (no separate bottom text state)
      timer = window.setTimeout(poll, 140);
    }
    poll();
    return ()=>{ if(timer) window.clearTimeout(timer); };
  }, [typedInStep2, step2KeyPressCount, step2Active, step2TypedValue]);
  useEffect(()=>{ let timer; const total=steps.length||5; function poll(){ const spans=Array.from(document.querySelectorAll('span')); const match3=spans.find(sp=> (sp.textContent||'').trim()===`3 / ${total}`); const match4=spans.find(sp=> (sp.textContent||'').trim()===`4 / ${total}`); const match5=spans.find(sp=> (sp.textContent||'').trim()===`5 / ${total}`); const active3=Boolean(match3); const active4=Boolean(match4); const active5=Boolean(match5); setIsStep3Active(active3); setIsStep4Active(active4); setIsStep5Active(active5); if(active3 && !randName){ const fallback=['김서연','이도윤','박지후','최하윤','정우진','한서준','홍길동','서지후','유하준','노아']; const picked=(step2TypedValue||'').trim(); setRandName(picked.length?picked:fallback[Math.floor(Math.random()*fallback.length)]);} if(active3 && !randPhone){ const n4=()=> String(Math.floor(1000+Math.random()*9000)); setRandPhone(`010-${n4()}-${n4()}`);} if(active4){ setEditedName(prev=> prev||randName||''); setEditedPhone(prev=> prev||randPhone||''); } timer=window.setTimeout(poll,180);} poll(); return ()=>{ if(timer) window.clearTimeout(timer);} }, [steps, randName, randPhone, step2TypedValue]);
  useEffect(()=>{ if(!isStep5Active || lockedFinals) return; try{ const base=(randName||step2TypedValue||''); const current=(editedName||randName||''); const deduped=dedupeTail(current, base); if(finalizedName!==deduped){ setFinalizedName(deduped);} } catch {/* ignore */} try{ const currentPhone=(editedPhone||randPhone||''); const cleaned=sanitizePhone(currentPhone); if(finalizedPhone!==cleaned){ setFinalizedPhone(cleaned);} } catch {/* ignore */} }, [isStep5Active, lockedFinals, editedName, editedPhone, randName, randPhone, step2TypedValue, dedupeTail, finalizedName, finalizedPhone]);
  // Listener previously removed when navigation buttons were hidden. We now restore explicit next button logic via goNext().
  useEffect(()=>{
    if(!isStep4Active || hasEditedStep4) return;
    const fullName=(randName||step2TypedValue||editedName||'');
    const fullPhone=(randPhone||editedPhone||'');
    if(fullName && editedName!==fullName){ setEditedName(fullName); }
    if(fullPhone && editedPhone!==fullPhone){ setEditedPhone(fullPhone); }
    // Do not push into textarea directly when using composed input
  }, [isStep4Active, hasEditedStep4, editTarget, randName, randPhone, step2TypedValue, editedName, editedPhone]);
  useEffect(()=>{
    if(USE_COMPOSED_INPUT) return; // skip DOM polling in practice
    let timer; function poll(){ if(!isStep4Active){ timer=window.setTimeout(poll,180); return; }
      try{ const ta=document.querySelector('textarea[class*="chatInputField"]'); const val=(ta && typeof ta.value==='string')? ta.value : '';
        if(editTarget==='name'){
          const normalized=dedupeTail(val, randName||step2TypedValue||'');
          if(editedName!==normalized){ setEditedName(normalized); }
          if(!hasEditedStep4 && val !== (randName||'')){ setHasEditedStep4(true); }
        } else {
          const cleaned=sanitizePhone(val);
          if(editedPhone!==cleaned){ setEditedPhone(cleaned); }
          if(!hasEditedStep4 && val !== (randPhone||'')){ setHasEditedStep4(true); }
        }
      } catch {/* ignore */}
      timer=window.setTimeout(poll,160);
    }
    poll();
    return ()=>{ if(timer) window.clearTimeout(timer); };
  }, [USE_COMPOSED_INPUT, isStep4Active, editTarget, editedName, editedPhone, randName, randPhone, hasEditedStep4, step2TypedValue, dedupeTail]);
  useEffect(()=>{ if(USE_COMPOSED_INPUT) return; if(!isStep4Active) return; try{ const ta=document.querySelector('textarea[class*="chatInputField"]'); if(!ta) return; const want= editTarget==='name' ? (editedName||randName||'') : (editedPhone||randPhone||''); if((ta.value||'')===''){ setTextareaValueSafely(ta, want);} } catch {/* ignore */} }, [USE_COMPOSED_INPUT, isStep4Active, editTarget, editedName, editedPhone, randName, randPhone]);
  const newScreens = useMemo(()=>{ const result={}; const totalOriginal=Object.keys(rawScreens).length; for(let i=1;i<=totalOriginal;i++){ if(i===removedStepId) continue; let targetId = i>removedStepId ? i-1 : i; if(targetId===removedStepId2) continue; if(targetId>removedStepId2) targetId -= 1; if(targetId===2){ result[targetId] = typedInStep2 && altImageForStep2 ? altImageForStep2 : rawScreens[2]; } else if(targetId===4){ result[targetId] = hasEditedStep4 && rawScreens[6] ? rawScreens[6] : rawScreens[5]; } else if(targetId===5){ result[targetId] = rawScreens[7] || rawScreens[i]; } else { result[targetId] = rawScreens[i]; } } return result; }, [rawScreens, typedInStep2, altImageForStep2, hasEditedStep4]);
  // (Copied logic) text overlay config retained for potential debugging; not used directly after refactor.
  // const step2HelperOverlayPos = { x:'6%', y:'15%', transform:'none', width:'88%', textAlign:'left' }; // no longer used (we overlay inside search bar)
  // TapHint configuration (kept for click logic) but always invisible for user.
  const tapHintConfig = {
    1:{ selector:null, x:'50%', y:'16.5%', width:'250px', height:'30px', borderRadius:'0%', offsetX:0, offsetY:0 },
    // Step2: show TapHint only after user actually types a few keys
  2: (typedInStep2 && step2KeyPressCount > 2) ? { selector:null, x:'50%', y:'16.5%', width:'250px', height:'30px', borderRadius:'0%', offsetX:0, offsetY:0, onActivate:()=>{ try{ flushStep2(); } catch { /* ignore */ } advanceStep(); } } : { hidden:true },
    3:{ selector:null, x:'90%', y:'5.5%', width:'40px', height:'24px', borderRadius:'25%', offsetX:0, offsetY:0 },
  4:{ selector:null, x:'91.5%', y:'9.25%', width:'38px', height:'24px', borderRadius:'25%', offsetX:0, offsetY:0, onActivate:()=>{ try{ captureFinals(); } catch {/* ignore */} finalizePractice(); }},
    // Step5: final TapHint triggers result modal
    5:{ selector:null, x:'50%', y:'92%', width:'38px', height:'24px', borderRadius:'25%', offsetX:0, offsetY:0, onActivate:()=>{ finalizePractice(); } }
  };

  // Scoring & timer (practice style)
  const totalSteps = steps.length || 5;
  const chapterId = getChapterId(ChapterDomain.CALL, 2); // fix topic id
  const scoringHook = useScoringProgress({ user:null, chapterId, expertTimeSec:40, stepsRequired: totalSteps, shouldSave:()=> true });
  const tracker = scoringHook?.tracker;
  const finalizeAndSave = scoringHook?.finalizeAndSave;
  const startedAtRef = useRef(null);
  const timerRef = useRef(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [frozenElapsedSec, setFrozenElapsedSec] = useState(null);
  useEffect(()=>{
    startedAtRef.current = Date.now();
    setElapsedSec(0);
    timerRef.current = setInterval(()=>{
      const start = startedAtRef.current || Date.now();
      setElapsedSec(Math.floor((Date.now()-start)/1000));
    },250);
    try{ tracker?.start && tracker.start(); } catch {/* ignore */}
    return ()=>{ if(timerRef.current) clearInterval(timerRef.current); try{ tracker?.end && tracker.end(); } catch {/* ignore */} };
  }, [tracker]);
  function formatTime(sec){ const m=Math.floor(sec/60).toString().padStart(2,'0'); const s=Math.floor(sec%60).toString().padStart(2,'0'); return `${m}:${s}`; }

  // Practice hint system (TapHint revealed only after hint pressed for that step)
  const [hintCount, setHintCount] = useState(0);
  const [showHintForStep, setShowHintForStep] = useState(null);
  const hintKey='practiceHintCount:call:fix';
  function useHint(){
    try{ const cur=Number(localStorage.getItem(hintKey)||'0')||0; const next=cur+1; localStorage.setItem(hintKey,String(next)); setHintCount(next);} catch {/* ignore */}
    setShowHintForStep(currentStep);
    try{ tracker?.markHint && tracker.markHint(); } catch {/* ignore */}
  }
  useEffect(()=>{ try{ localStorage.setItem(hintKey,'0'); } catch {/* ignore */} return ()=>{ try{ localStorage.removeItem(hintKey); } catch {/* ignore */} }; }, []);

  // Step progression
  // Clear any previously revealed TapHint when step advances
  useEffect(()=>{ setShowHintForStep(null); }, [currentStep]);
  function advanceStep(){
    try{ tracker?.markCorrect && tracker.markCorrect(currentStep); } catch {/* ignore */}
    setCurrentStep(s=> Math.min(totalSteps, s+1));
  }
  // Navigation removed in UI; keep advanceStep for TapHint progression only

  // Finalize for practice
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showWrongPopup, setShowWrongPopup] = useState(false);
  async function finalizePractice(){
    // stop timer and freeze elapsed time
    try{ if(timerRef.current){ clearInterval(timerRef.current); } } catch{/* ignore */}
    const finishedElapsed = startedAtRef.current ? Math.floor((Date.now() - startedAtRef.current)/1000) : elapsedSec;
    setFrozenElapsedSec(finishedElapsed);
    try{ tracker?.markCorrect && tracker.markCorrect(currentStep); } catch {/* ignore */}
    // mark remaining correct
    if(currentStep < totalSteps){ for(let i=currentStep+1;i<=totalSteps;i++){ try{ tracker?.markCorrect && tracker.markCorrect(i); } catch {/* ignore */} } }
    try{ tracker?.end && tracker.end(); } catch {/* ignore */}
    let res=null;
    try{ res = await finalizeAndSave(); } catch {/* ignore */}
    if(!res){ try{ res={ score: tracker?.scoreNow ? tracker.scoreNow(): null}; } catch {/* ignore */} }
    // inject frozen elapsed into derived for consistent display
    try{ if(res){ const sec = finishedElapsed; res.score = res.score||{}; res.score.derived = { ...(res.score.derived||{}), elapsedSec: sec }; } } catch{/* ignore */}
    try{ localStorage.setItem('practiceScore:call:fix', JSON.stringify(res?.score ?? null)); } catch {/* ignore */}
    setResult(res);
  }

  // Wrong-click handling: allow only TapHint, VirtualKeyboard, and explicit interactive overlays
  function handleDeviceClickCapture(e){
    if(result) return; // score modal shown; overlay blocks
    try {
      const path = e.nativeEvent?.composedPath ? e.nativeEvent.composedPath() : [];
      const allowByNode = (node)=>{
        try{
          if(!node) return false;
          if(node.getAttribute){
            const tk = node.getAttribute('data-tap-hint');
            if(tk === '1') return true;
            const vk = node.getAttribute('data-virtual-keyboard');
            if(vk === '1') return true;
            const al = (node.getAttribute('aria-label')||'');
            // Allow TapHint by aria, and step4 edit overlays
            if(al.includes('힌트')) return true;
            if(al === '이름 편집' || al === '번호 편집') return true;
            const role = (node.getAttribute('role')||'');
            if(role === 'button' && (al === '이름 편집' || al === '번호 편집')) return true;
            const cls = (node.getAttribute('class')||'');
            if(cls.includes('chatInputField')) return true; // text input field inside device
          }
          // If element is within TapHint or VK containers
          if(node.closest){
            if(node.closest('[data-tap-hint="1"]')) return true;
            if(node.closest('[data-virtual-keyboard="1"]')) return true;
            if(node.closest('[aria-label="이름 편집"]')) return true;
            if(node.closest('[aria-label="번호 편집"]')) return true;
            if(node.closest('textarea[class*="chatInputField"]')) return true;
          }
        } catch { /* ignore */ }
        return false;
      };
      if(path && path.length){
        for(const node of path){ if(allowByNode(node)) return; }
      } else {
        const tgt = e.target;
        if(allowByNode(tgt)) return;
      }
    } catch { /* ignore */ }
    e.stopPropagation(); e.preventDefault();
    try { tracker?.markError && tracker.markError(currentStep); } catch { /* ignore */ }
    setShowWrongPopup(true);
  }
  
  // ---- Hangul composition for VirtualKeyboard input (step2 search, step4 name) ----
  const CHO = ['\u0000','ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const JUNG = ['\u0000','ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
  const JONG = ['\u0000','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const VCOMB = { 'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ' };
  const JCOMB = { 'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ' };

  // Step2 composition state
  const [step2Comp, setStep2Comp] = useState({ lead:'', vowel:'', tail:'' });
  const step2CompRef = useRef(step2Comp);
  useEffect(()=>{ step2CompRef.current = step2Comp; }, [step2Comp]);
  const combineVowel = (a,b)=> (a && b ? (VCOMB[a+b]||null) : null);
  const combineJong = (a,b)=> (a && b ? (JCOMB[a+b]||null) : null);
  function composeStep2Preview(snap){ const src = snap || step2Comp; const {lead,vowel,tail} = src; if(!lead && !vowel && !tail) return ''; if(!lead && vowel) return vowel; const L = CHO.indexOf(lead); const Vv = JUNG.indexOf(vowel); const Tt = JONG.indexOf(tail); if(L>0 && Vv>0){ return String.fromCharCode(0xAC00 + (L-1)*21*28 + (Vv-1)*28 + (Tt>=0?Tt:0)); } return (lead||'') + (vowel||'') + (tail||''); }
  function flushStep2(snapshot){ const snap = snapshot || step2CompRef.current; const {lead,vowel,tail} = snap; setStep2Comp({lead:'', vowel:'', tail:''}); if(!lead && !vowel && !tail) return; if(!lead && vowel){ setStep2TypedValue(a=> (a||'') + vowel); return; } const L = CHO.indexOf(lead); const Vv = JUNG.indexOf(vowel); const Tt = JONG.indexOf(tail); if(L>0 && Vv>0){ const syll = String.fromCharCode(0xAC00 + (L-1)*21*28 + (Vv-1)*28 + (Tt>=0?Tt:0)); setStep2TypedValue(a=> (a||'') + syll); } else { setStep2TypedValue(a=> (a||'') + (lead||'') + (vowel||'') + (tail||'')); } }
  function handleStep2JamoInput(ch){ const prev = step2CompRef.current; if(JUNG.includes(ch)){ if(prev.tail){ const isCompositeTail = Object.values(JCOMB).includes(prev.tail); if(isCompositeTail){ let left=null,right=null; for(const k in JCOMB){ if(JCOMB[k]===prev.tail){ left=k.charAt(0); right=k.charAt(1); break; } } if(left && right){ flushStep2({lead: prev.lead, vowel: prev.vowel, tail: left}); setStep2Comp({lead: right, vowel: ch, tail:''}); return; } flushStep2(prev); setStep2Comp({lead:'', vowel: ch, tail:''}); return; } const tailChar = prev.tail; flushStep2({lead: prev.lead, vowel: prev.vowel, tail:''}); setStep2Comp({lead: tailChar, vowel: ch, tail:''}); return; } if(prev.lead && prev.vowel){ const comb2 = combineVowel(prev.vowel, ch); if(comb2){ setStep2Comp({...prev, vowel: comb2}); return; } flushStep2(prev); setStep2Comp({lead:'', vowel: ch, tail:''}); return; } if(prev.lead && !prev.vowel){ setStep2Comp({...prev, vowel: ch}); return; } if(!prev.lead){ setStep2TypedValue(a=> (a||'') + ch); return; } flushStep2(prev); setStep2TypedValue(a=> (a||'') + ch); return; }
    if(CHO.includes(ch)){ if(!prev.lead){ setStep2Comp({...prev, lead: ch}); return; } if(prev.lead && !prev.vowel){ flushStep2(prev); setStep2Comp({lead: ch, vowel:'', tail:''}); return; } if(prev.lead && prev.vowel && !prev.tail){ if(JONG.includes(ch)){ setStep2Comp({...prev, tail: ch}); return; } flushStep2(prev); setStep2Comp({lead: ch, vowel:'', tail:''}); return; } if(prev.lead && prev.vowel && prev.tail){ const comb3 = combineJong(prev.tail, ch); if(comb3){ setStep2Comp({...prev, tail: comb3}); return; } flushStep2(prev); setStep2Comp({lead: ch, vowel:'', tail:''}); return; } }
    flushStep2(prev); setStep2TypedValue(a=> (a||'') + ch); }
  function backspaceStep2(){ const c = step2CompRef.current; if(c.tail){ setStep2Comp({...c, tail:''}); return; } if(c.vowel){ setStep2Comp({...c, vowel:''}); return; } if(c.lead){ setStep2Comp({...c, lead:''}); return; } setStep2TypedValue(v=> (v||'').slice(0,-1)); }

  // Step4 name composition (only when editing name)
  const [step4Comp, setStep4Comp] = useState({ lead:'', vowel:'', tail:'' });
  const step4CompRef = useRef(step4Comp);
  useEffect(()=>{ step4CompRef.current = step4Comp; }, [step4Comp]);
  function composeStep4Preview(snap){ const src = snap || step4Comp; const {lead,vowel,tail} = src; if(!lead && !vowel && !tail) return ''; if(!lead && vowel) return vowel; const L = CHO.indexOf(lead); const Vv = JUNG.indexOf(vowel); const Tt = JONG.indexOf(tail); if(L>0 && Vv>0){ return String.fromCharCode(0xAC00 + (L-1)*21*28 + (Vv-1)*28 + (Tt>=0?Tt:0)); } return (lead||'') + (vowel||'') + (tail||''); }
  function flushStep4(snapshot){ const snap = snapshot || step4CompRef.current; const {lead,vowel,tail} = snap; setStep4Comp({lead:'', vowel:'', tail:''}); if(!lead && !vowel && !tail) return; if(!lead && vowel){ setEditedName(a=> (a||'') + vowel); return; } const L = CHO.indexOf(lead); const Vv = JUNG.indexOf(vowel); const Tt = JONG.indexOf(tail); if(L>0 && Vv>0){ const syll = String.fromCharCode(0xAC00 + (L-1)*21*28 + (Vv-1)*28 + (Tt>=0?Tt:0)); setEditedName(a=> (a||'') + syll); } else { setEditedName(a=> (a||'') + (lead||'') + (vowel||'') + (tail||'')); } }
  function handleStep4JamoInput(ch){ const prev = step4CompRef.current; if(JUNG.includes(ch)){ if(prev.tail){ const isCompositeTail = Object.values(JCOMB).includes(prev.tail); if(isCompositeTail){ let left=null,right=null; for(const k in JCOMB){ if(JCOMB[k]===prev.tail){ left=k.charAt(0); right=k.charAt(1); break; } } if(left && right){ flushStep4({lead: prev.lead, vowel: prev.vowel, tail: left}); setStep4Comp({lead: right, vowel: ch, tail:''}); return; } flushStep4(prev); setStep4Comp({lead:'', vowel: ch, tail:''}); return; } const tailChar = prev.tail; flushStep4({lead: prev.lead, vowel: prev.vowel, tail:''}); setStep4Comp({lead: tailChar, vowel: ch, tail:''}); return; } if(prev.lead && prev.vowel){ const comb2 = combineVowel(prev.vowel, ch); if(comb2){ setStep4Comp({...prev, vowel: comb2}); return; } flushStep4(prev); setStep4Comp({lead:'', vowel: ch, tail:''}); return; } if(prev.lead && !prev.vowel){ setStep4Comp({...prev, vowel: ch}); return; } if(!prev.lead){ setEditedName(a=> (a||'') + ch); return; } flushStep4(prev); setEditedName(a=> (a||'') + ch); return; }
  if(CHO.includes(ch)){ if(!prev.lead){ setStep4Comp({...prev, lead: ch}); return; } if(prev.lead && !prev.vowel){ flushStep4(prev); setStep4Comp({lead: ch, vowel:'', tail:''}); return; } if(prev.lead && prev.vowel && !prev.tail){ if(JONG.includes(ch)){ setStep4Comp({...prev, tail: ch}); return; } flushStep4(prev); setStep4Comp({lead: ch, vowel:'', tail:''}); return; } if(prev.lead && prev.vowel && prev.tail){ const comb3 = combineJong(prev.tail, ch); if(comb3){ setStep4Comp({...prev, tail: comb3}); return; } flushStep4(prev); setStep4Comp({lead: ch, vowel:'', tail:''}); return; } }
  flushStep4(prev); setEditedName(a=> (a||'') + ch); }
  function backspaceStep4(){ const c = step4CompRef.current; if(c.tail){ setStep4Comp({...c, tail:''}); return; } if(c.vowel){ setStep4Comp({...c, vowel:''}); return; } if(c.lead){ setStep4Comp({...c, lead:''}); return; } if(editTarget==='name'){ setEditedName(v=> (v||'').slice(0,-1)); } else { setEditedPhone(v=> (v||'').slice(0,-1)); } }

  const extraOverlay = (<>
    <style>{`
      @keyframes callFixCursorBlink { 0%{opacity:1;}49.9%{opacity:1;}50%{opacity:0;}100%{opacity:0;} }
      div[style*="z-index: 123"]::after, div[data-blink-caret="1"]::after { content:''; display:inline-block; width:2px; height:1.05em; margin-left:2px; vertical-align:text-bottom; background:#2980ff; border-radius:1.5px; animation:callFixCursorBlink .9s steps(2,start) infinite; }
    `}</style>
    {isStep3Active && (<style>{`[data-virtual-keyboard="1"] { display:none !important; }`}</style>)}
    {currentStep===2 && (
      <div aria-hidden style={{position:'absolute', left:'13%', top:'4%', transform:'none', width:'88%', color:'#111', fontSize:'13px', fontWeight:300, textAlign:'left', whiteSpace:'nowrap', zIndex:123}}>
        {step2TypedValue}{composeStep2Preview()}
      </div>
    )}
    {(currentStep===2 && step2KeyPressCount>2 && (step2TypedValue || composeStep2Preview())) && (
      <div aria-hidden style={{position:'absolute', left:'6%', top:'15%', transform:'none', width:'88%', maxWidth:'88%', color:'#111', fontSize:'14px', fontWeight:400, textAlign:'left', whiteSpace:'nowrap', zIndex:124, pointerEvents:'none'}}>
        {(step2TypedValue || '') + composeStep2Preview()}
      </div>
    )}
    {isStep3Active && randName && (
      <div aria-hidden style={{position:'absolute', left:'50%', top:'24%', transform:'translateX(-50%)', width:'84%', whiteSpace:'normal', fontSize:'30px', fontWeight:300, color:'#ffffffff', textAlign:'center', overflow:'hidden', zIndex:125}}>{randName}</div>
    )}
    {isStep3Active && randPhone && (
      <div aria-hidden style={{position:'absolute', left:'7%', top:'65%', transform:'none', minWidth:'40px', maxWidth:'84%', whiteSpace:'nowrap', fontSize:'13px', fontWeight:300, color:'#0073ffff', textAlign:'left', overflow:'hidden', zIndex:125}}>{randPhone}</div>
    )}
    {isStep4Active && (<>
      {(()=>{ const base=randName||''; const current=editedName||randName||''; const deduped=dedupeTail(current, base); const displayName = editTarget==='name' ? ((editedName||'') + composeStep4Preview()) : deduped; return (
        <div role="button" aria-label="이름 편집" onClick={(e)=>{ e.stopPropagation(); setEditTarget('name'); const wantRaw=(editedName||randName||''); const want=dedupeTail(wantRaw, base); setEditedName(want); if(!USE_COMPOSED_INPUT){ try{ const ta=document.querySelector('textarea[class*="chatInputField"]'); if(ta){ setTextareaValueSafely(ta, want); } } catch {/* ignore */} } }} data-blink-caret={editTarget==='name' ? '1' : undefined} style={{position:'absolute', left:'4%', top:'15%', transform:'none', width:'92%', maxWidth:'92%', whiteSpace:'nowrap', lineHeight:'1.15', fontSize:'13px', fontWeight:300, color: editTarget==='name' ? '#0a58ff' : '#111', textAlign:'left', overflow:'visible', opacity:0.98, zIndex:126, pointerEvents:'auto', cursor:'text', textDecoration: editTarget==='name' ? 'underline' : 'none', display:'block'}}>{displayName}</div>
      ); })()}
  <div role="button" aria-label="번호 편집" onClick={(e)=>{ e.stopPropagation(); setEditedName(prev=> dedupeTail(prev, randName||step2TypedValue||'')); setEditTarget('phone'); const wantRaw=(editedPhone||randPhone||''); const want=sanitizePhone(wantRaw); setEditedPhone(want); if(!USE_COMPOSED_INPUT){ try{ const ta=document.querySelector('textarea[class*="chatInputField"]'); if(ta){ setTextareaValueSafely(ta, want); setTimeout(()=>{ try{ if(ta.value !== sanitizePhone(ta.value)){ setTextareaValueSafely(ta, sanitizePhone(ta.value)); } } catch {/* ignore */} },40); } } catch {/* ignore */} } }} data-blink-caret={editTarget==='phone' ? '1' : undefined} style={{position:'absolute', left:'37%', top:'36%', transform:'none', width:'60%', maxWidth:'60%', whiteSpace:'nowrap', fontSize:'13px', fontWeight:300, color: editTarget==='phone' ? '#0a58ff' : '#111', textAlign:'left', overflow:'visible', zIndex:126, pointerEvents:'auto', cursor:'text', textDecoration: editTarget==='phone' ? 'underline' : 'none', display:'inline-block'}}>{(editedPhone||randPhone||'')}</div>
    </>)}
    {isStep5Active && (<>
      {finalizedName && (<div aria-hidden style={{position:'absolute', left:'50%', top:'24%', transform:'translateX(-50%)', width:'84%', whiteSpace:'normal', fontSize:'30px', fontWeight:300, color:'#ffffffff', textAlign:'center', overflow:'hidden', zIndex:125}}>{finalizedName}</div>)}
      {finalizedPhone && (<div aria-hidden style={{position:'absolute', left:'7%', top:'65%', transform:'none', minWidth:'40px', maxWidth:'84%', whiteSpace:'nowrap', fontSize:'13px', fontWeight:300, color:'#0073ffff', textAlign:'left', overflow:'hidden', zIndex:125}}>{finalizedPhone}</div>)}
    </>)}
  </>);
  // Render TapHint manually (visible only after hint press for current step)
  function renderTapHint(){
    const cfg = tapHintConfig[currentStep];
    if(!cfg || cfg.hidden) return null;
    return (
      <TapHint
        {...cfg}
        onActivate={()=>{
          if(cfg.onActivate){ cfg.onActivate(); return; }
          if(currentStep === 4){ captureFinals(); advanceStep(); }
          else advanceStep();
        }}
        suppressInitial={false}
        invisible={showHintForStep !== currentStep}
      />
    );
  }

  return (
    <div className={frameStyles.framePage}>
      <BackButton to="/call/practice" variant="fixed" />
      <header className={frameStyles.frameHeader}>
        <h1 className={`${frameStyles.frameTitle} ${lt.withAccent}`}>
          <span className="titleText">{meta.title} 연습</span>
          <span className={frameStyles.inlineTagline}>{meta.tagline}</span>
        </h1>
      </header>
      <div className={frameStyles.lessonRow}>
  <div className={frameStyles.deviceCol} onClickCapture={handleDeviceClickCapture}>
          <PhoneFrame image={newScreens[currentStep] || newScreens[1]} screenWidth={'278px'} aspect={'278 / 450'} scale={1}>
            {renderTapHint()}
            {extraOverlay}
            {(currentStep === 2 || currentStep === 4) && (
              <VirtualKeyboard
                allowEnglish={false}
                onKey={(ch)=>{
                  if(currentStep === 2){
                    handleStep2JamoInput(ch);
                    setStep2KeyPressCount(c => c + 1);
                    if(ch && String(ch).trim().length>0) setTypedInStep2(true);
                  } else if(currentStep === 4){
                    if(editTarget === 'name'){
                      handleStep4JamoInput(ch);
                      if(!hasEditedStep4) setHasEditedStep4(true);
                    } else {
                      setEditedPhone(v => sanitizePhone((v||'') + ch));
                      if(!hasEditedStep4) setHasEditedStep4(true);
                    }
                  }
                }}
                onBackspace={()=>{
                  if(currentStep === 2){
                    backspaceStep2();
                    setStep2KeyPressCount(c => c + 1);
                  } else if(currentStep === 4){
                    backspaceStep4();
                    if(!hasEditedStep4) setHasEditedStep4(true);
                  }
                }}
                onEnter={()=>{
                  if(currentStep === 2){ flushStep2(); }
                  if(currentStep === 4 && editTarget === 'name'){ flushStep4(); }
                }}
              />
            )}
            {currentStep === 2 && (
              <ChatInputBar
                value={step2TypedValue + composeStep2Preview()}
                placeholder="검색어를 입력하세요"
                onChange={v=>{ setStep2TypedValue(v || ''); setStep2Comp({lead:'', vowel:'', tail:''}); setStep2KeyPressCount(c=> c+1); if(v && v.length>0) setTypedInStep2(true); }}
                onSubmit={()=>{/* ignore submit in practice */}}
                offsetBottom={14}
                maxRows={1}
                sendLabel=""
              />
            )}
            {currentStep === 4 && (
              <ChatInputBar
                value={editTarget==='name' ? (editedName + composeStep4Preview()) : editedPhone}
                placeholder={editTarget==='name' ? '이름 수정' : '번호 수정'}
                onChange={v=>{ if(editTarget==='name'){ setEditedName(v || ''); setStep4Comp({lead:'', vowel:'', tail:''}); } else { setEditedPhone(sanitizePhone(v || '')); } }}
                onSubmit={()=>{/* ignore */}}
                offsetBottom={14}
                maxRows={1}
                sendLabel=""
              />
            )}
          </PhoneFrame>
        </div>
        <div className={frameStyles.sidePanel}>
          <div className={frameStyles.captionBar} style={{ width:'auto', maxWidth:420, marginTop:0 }}>
            <div className={frameStyles.progressHeader}>
              <div className={frameStyles.stepMeta}>
                <span className={frameStyles.stepCount}>{currentStep} / {totalSteps}</span>
                <span className={frameStyles.stepTitle}>{steps.find(s=> s.id===currentStep)?.title}</span>
              </div>
            </div>
            <div className={frameStyles.captionDivider} />
            <div style={{ marginTop:8, color:'#666' }}>시간: {formatTime(frozenElapsedSec ?? elapsedSec)}</div>
            <div style={{ marginTop:12, display:'flex', gap:10, alignItems:'center' }}>
              <button className={frameStyles.ghostBtn} aria-label="힌트 보기" onClick={useHint}>힌트 보기</button>
              <div style={{ color:'#666' }}>힌트 사용: {hintCount}</div>
            </div>
            {/* Navigation buttons removed by request; progress via TapHint only */}
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
        <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.45)', zIndex:300 }}>
          <div style={{ background:'#fff', padding:22, borderRadius:12, minWidth:320, maxWidth:560 }}>
            <div style={{ display:'flex', alignItems:'center', gap:18 }}>
              <div style={{ flex:'0 0 120px', textAlign:'center' }}>
                <div style={{ fontSize:48, fontWeight:800, color:'#10B981' }}>{result?.score?.total ?? '-'}</div>
                <div style={{ fontSize:14, color:'#666' }}>/ 100</div>
              </div>
              <div style={{ flex:'1 1 auto' }}>
                <h3 style={{ margin:0 }}>연습 결과</h3>
                <div style={{ marginTop:8, display:'flex', gap:8, alignItems:'center' }}>
                  <button type="button" onClick={()=> setShowDetails(s=>!s)} className={frameStyles.ghostBtn} aria-expanded={showDetails} aria-controls="call-fix-result-details" style={{ padding:'6px 10px', fontSize:13 }}>{showDetails ? '세부점수 숨기기' : '세부점수 보기'}</button>
                  <div style={{ color:'#666', fontSize:13 }}>시간: {formatTime(result?.score?.derived?.elapsedSec || elapsedSec)}</div>
                </div>
              </div>
            </div>
            {showDetails && (
              <div id="call-fix-result-details" style={{ marginTop:14, padding:12, borderRadius:8, background:'#fafafa', border:'1px solid #eee' }}>
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
              <button className={frameStyles.primaryBtn} onClick={()=> navigate('/call/practice')}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
