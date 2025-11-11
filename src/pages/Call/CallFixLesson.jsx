import React, { useMemo, useState, useEffect, useCallback } from 'react';
import GenericLesson from '../common/GenericLesson';
import { buildCallLessonConfig, topicMeta } from './callDynamicSteps.js';
import chatInputStyles from '../../components/ChatInputBar/ChatInputBar.module.css';

export default function CallFixLesson(){
  const { steps: rawSteps, screens: rawScreens } = useMemo(() => buildCallLessonConfig('fix'), []);
  const meta = topicMeta.fix;
  // 원래 7단계 중 3단계를 제거하고 이후를 앞으로 당김
  const removedStepId = 3;
  const altImageForStep2 = rawScreens[3]; // 삭제된 3단계 이미지: step2에서 첫 입력 발생 후 교체용
  // 추가 조정: 현재 5/6 단계를 제거하여 총 5단계로 축소 (기존 6/6 -> 5/5)
  const removedStepId2 = 5; // 1차 압축 후의 5단계(원본 6단계)

  // 단계 재구성:
  // 1) id===3 제거 후 뒤 번호 앞으로 당김
  // 2) 그 결과에서 id===5(현재 5/6) 를 제거 후 뒤 번호 앞으로 당김 → 총 5단계 구성
  // 3) step2, step4에 inputPlaceholder 부여하여 가상키보드 표시(입력바는 CSS로 숨김)
  const steps = useMemo(() => {
    // 1차 제거/압축 (원본 3 제거)
    const once = rawSteps.filter(s => s.id !== removedStepId).map(s => ({ ...s, id: s.id > removedStepId ? s.id - 1 : s.id }));
    // 2차 제거/압축 (현재 5 제거)
    const twice = once.filter(s => s.id !== removedStepId2).map(s => ({ ...s, id: s.id > removedStepId2 ? s.id - 1 : s.id }));
    // 입력 단계 지정: 2단계, 4단계 모두 키보드 보이도록 플레이스홀더 부여
    return twice.map(s => (s.id === 2 || s.id === 4) ? { ...s, inputPlaceholder: '수정할 내용을 입력하세요' } : s);
  }, [rawSteps]);

  // 입력 감지 상태: step2에서 가상키보드로 한 글자라도 입력되면 true
  const [typedInStep2, setTypedInStep2] = useState(false);
  // step2 하단 표시용 텍스트 (키 입력 3회 이상, 즉 두 번 초과일 때 노출)
  const [step2BottomText, setStep2BottomText] = useState('');
  // step2 키 입력 횟수 (모드 전환/Shift 제외)
  const [step2KeyPressCount, setStep2KeyPressCount] = useState(0);
  // 2/6에서 실시간으로 입력되는 문자열(미리보기 포함) 캡처
  const [step2TypedValue, setStep2TypedValue] = useState('');
  // 3/6 표시용 랜덤 이름/전화번호 및 활성 여부
  const [isStep3Active, setIsStep3Active] = useState(false);
  const [isStep4Active, setIsStep4Active] = useState(false);
  const [randName, setRandName] = useState('');
  const [randPhone, setRandPhone] = useState('');
  const [isStep5Active, setIsStep5Active] = useState(false); // 최종 단계 활성 여부
  // 5/5로 넘길 최종 표시 문자열(4/5에서 보이는 그대로 고정)
  const [finalizedName, setFinalizedName] = useState('');
  const [finalizedPhone, setFinalizedPhone] = useState('');
  const [lockedFinals, setLockedFinals] = useState(false);
  // 4단계 편집 상태: 어떤 텍스트를 편집할지(이름/번호), 편집된 값, 편집 시작 감지(이미지 교체 트리거)
  const [editTarget, setEditTarget] = useState('name'); // 'name' | 'phone'
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [hasEditedStep4, setHasEditedStep4] = useState(false);
  // 보조 유틸: 한글 마지막 글자(음절) 중 받침만 제거된 변형(예: '늘' -> '느') 또는
  // 마지막 음절 자체가 한 번 더 붙는 변형(예: base + lastSyllable)이 생기면 base로 정규화
  const H_BASE = 0xAC00, H_END = 0xD7A3, V = 21, T = 28;
  const CHO_HEAD = useMemo(() => ['\u0000','ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'], []);
  const stripJong = (ch) => {
    if(!ch || ch.length !== 1) return ch;
    const code = ch.charCodeAt(0);
    if(code < H_BASE || code > H_END) return ch;
    const idx = code - H_BASE;
    const l = Math.floor(idx / (V * T));
    const v = Math.floor((idx % (V * T)) / T);
    const t = idx % T;
    if(t === 0) return ch; // 받침 없음
    const newCode = H_BASE + (l * V + v) * T; // 받침 0으로
    return String.fromCharCode(newCode);
  };
  const dedupeTail = useCallback((current, base) => {
    const c = (current ?? '').toString();
    const b = (base ?? '').toString();
    if(!c || !b) return c;
    const last = b.slice(-1);
    const lastNoJong = stripJong(last);
    // 케이스1: base + 마지막 음절 그대로가 붙은 경우 → base로 복원
    if(c === b + last) return b;
    // 케이스2: base + (마지막 음절의 받침 제거 버전)이 붙은 경우 →
    // 기대값은 '마지막 음절을 분해하여 초성만 남긴 형태': baseWithoutLast + 초성
    if(c === b + lastNoJong){
      const code = last.charCodeAt(0);
      const idx = code - H_BASE;
      const L = Math.floor(idx / (V * T)) + 1; // CHO index는 1부터
      const lead = CHO_HEAD[L] || lastNoJong; // 안전 장치
      return b.slice(0, -1) + lead;
    }
    return c;
  }, [CHO_HEAD]);
  // 전화번호 편집 시 이전 한글 조합 잔여(예: 이름 마지막 음절)가 붙는 경우 제거
  const sanitizePhone = (val) => {
    if(!val) return val;
    // 허용 패턴: 숫자, '-', 공백. 끝에 붙은 한글 음절들 제거
    return val.replace(/[\u3131-\u318E\uAC00-\uD7A3]+$/g,'');
  };
  // React 제어 textarea의 value를 안전하게 갱신(React onChange 트리거)하는 유틸
  function setTextareaValueSafely(ta, value){
    if(!ta) return;
    try{
      const desc = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
      if(desc && typeof desc.set === 'function'){
        desc.set.call(ta, value);
      } else {
        ta.value = value;
      }
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    } catch {
      try { ta.value = value; ta.dispatchEvent(new Event('input', { bubbles: true })); } catch { /* ignore */ }
    }
  }
  // 4/5에서 5/5로 넘어가기 직전, 화면에 보이는 문자열 그대로를 고정 캡처
  const captureFinals = useCallback(() => {
    try{
      const base = (randName || step2TypedValue || '');
      const currentName = (editedName || randName || '');
      const nameShown = dedupeTail(currentName, base);
      const currentPhone = (editedPhone || randPhone || '');
      const phoneShown = sanitizePhone(currentPhone);
      setFinalizedName(nameShown);
      setFinalizedPhone(phoneShown);
      setLockedFinals(true);
    } catch { /* ignore */ }
  }, [randName, step2TypedValue, editedName, editedPhone, randPhone, dedupeTail]);
  // step2 텍스트 오버레이(zIndex:123) 내용 변화를 폴링으로 감지 (GenericLesson 내부 상태 접근 불가하므로 DOM 방식 사용)
  // step2 키 입력 감지: VirtualKeyboard 내부 버튼 pointerdown 이벤트로 횟수 증가
  useEffect(() => {
    function handlePointer(e){
      const overlayEl = document.querySelector('div[style*="z-index: 123"]');
      if(!overlayEl) return; // step2 아닐 때 무시
      const kbRoot = e.target.closest('[data-virtual-keyboard="1"]');
      if(!kbRoot) return;
      const btn = e.target.closest('button');
      if(!btn) return;
      const label = (btn.getAttribute('aria-label') || btn.textContent || '').trim();
      // 모드 전환/shift 키 제외
      if(['123','ABC','#+=','한','⇧'].includes(label)) return;
      setStep2KeyPressCount(c => c + 1);
    }
    window.addEventListener('pointerdown', handlePointer, true);
    return () => window.removeEventListener('pointerdown', handlePointer, true);
  }, []);

  // step2 overlay 텍스트 폴링 및 표시 조건: 키 입력 2회 이상일 때 내용 표시
  useEffect(() => {
    let timer;
    function poll(){
      const el = document.querySelector('div[style*="z-index: 123"]');
      if(el){
        const txt = (el.textContent || '').trim();
        // 첫 글자라도 나오면 조합 시작으로 간주
        if(!typedInStep2 && txt.length > 0){ setTypedInStep2(true); }
  // 키 입력 횟수가 3회 이상(두 번 초과)이면 텍스트 표시, 아니면 숨김
  if(step2KeyPressCount > 2){ setStep2BottomText(txt); } else { setStep2BottomText(''); }
        // 항상 최신 입력값을 보관 (3/6에서 이름으로 사용)
        if(txt){ setStep2TypedValue(txt); }
      } else {
        // step2 벗어남: 초기화
        setStep2BottomText('');
        if(step2KeyPressCount !== 0) setStep2KeyPressCount(0);
        if(typedInStep2) setTypedInStep2(false);
      }
      timer = window.setTimeout(poll, 140);
    }
    poll();
    return () => { if(timer) window.clearTimeout(timer); };
  }, [typedInStep2, step2KeyPressCount]);

  // 3/5, 4/5, 5/5 단계 활성 감지: 사이드 패널의 "step / total" 텍스트로 확인 (CSS Modules 회피)
  useEffect(() => {
    let timer;
    const total = steps.length || 5;
    function poll(){
      const spans = Array.from(document.querySelectorAll('span'));
      const match3 = spans.find(sp => {
        const t = (sp.textContent || '').trim();
        return t === `3 / ${total}`;
      });
      const match4 = spans.find(sp => {
        const t = (sp.textContent || '').trim();
        return t === `4 / ${total}`;
      });
      const match5 = spans.find(sp => {
        const t = (sp.textContent || '').trim();
        return t === `5 / ${total}`;
      });
      const active3 = Boolean(match3);
      const active4 = Boolean(match4);
      const active5 = Boolean(match5);
      setIsStep3Active(active3);
      setIsStep4Active(active4);
      setIsStep5Active(active5);
      // 4->5 전환 시 최종 값 초기화 준비: 5 활성화 시점에 캡처
      if(active3 && !randName){
        const fallbackNames = ['김서연','이도윤','박지후','최하윤','정우진','한서준','홍길동','서지후','유하준','노아'];
        const picked = (step2TypedValue || '').trim();
        setRandName(picked.length ? picked : fallbackNames[Math.floor(Math.random()*fallbackNames.length)]);
      }
      if(active3 && !randPhone){
        const n4 = () => String(Math.floor(1000 + Math.random()*9000));
        setRandPhone(`010-${n4()}-${n4()}`);
      }
      // 4단계 진입 시 편집 초기화 (처음 한 번): 기본 편집값을 노출 값으로 세팅
      if(active4){
        setEditedName(prev => prev || randName || '');
        setEditedPhone(prev => prev || randPhone || '');
      }
      timer = window.setTimeout(poll, 180);
    }
    poll();
    return () => { if(timer) window.clearTimeout(timer); };
  }, [steps, randName, randPhone, step2TypedValue]);

  // 5/5 활성화 시점에 4/5에서 눈에 보이던 문자열을 고정 캡처해 전달
  useEffect(() => {
    if(!isStep5Active || lockedFinals) return;
    // 이름: dedupeTail로 정규화된 표시값을 그대로 사용
    try{
      const base = (randName || step2TypedValue || '');
      const current = (editedName || randName || '');
      const deduped = dedupeTail(current, base);
      if(finalizedName !== deduped){ setFinalizedName(deduped); }
    } catch { /* ignore */ }
    // 번호: sanitizePhone으로 정리된 표시값을 그대로 사용
    try{
      const currentPhone = (editedPhone || randPhone || '');
      const cleaned = sanitizePhone(currentPhone);
      if(finalizedPhone !== cleaned){ setFinalizedPhone(cleaned); }
    } catch { /* ignore */ }
  }, [isStep5Active, lockedFinals, editedName, editedPhone, randName, randPhone, step2TypedValue, dedupeTail, finalizedName, finalizedPhone]);

  // 4/5에서 사이드패널 '다음' 버튼 클릭 시에도 고정 캡처 실행
  useEffect(() => {
    if(!isStep4Active) return;
    function onPointerDown(e){
      try{
        const btn = e.target.closest('button');
        if(!btn) return;
        const txt = (btn.textContent || '').trim();
        if(txt === '다음'){
          captureFinals();
        }
      } catch { /* ignore */ }
    }
    window.addEventListener('pointerdown', onPointerDown, true);
    return () => window.removeEventListener('pointerdown', onPointerDown, true);
  }, [isStep4Active, captureFinals]);

  // 4단계 최초 진입 시(아직 사용자가 편집하지 않은 경우) 이름/번호를 전체 값으로 확실히 시드
  useEffect(() => {
    if(!isStep4Active || hasEditedStep4) return;
    const fullName = (randName || step2TypedValue || editedName || '');
    const fullPhone = (randPhone || editedPhone || '');
    if(fullName && editedName !== fullName){ setEditedName(fullName); }
    if(fullPhone && editedPhone !== fullPhone){ setEditedPhone(fullPhone); }
    try{
      const ta = document.querySelector('textarea[class*="chatInputField"]');
      if(ta){
        const want = (editTarget === 'name') ? fullName : fullPhone;
        setTextareaValueSafely(ta, want);
      }
    } catch { /* ignore */ }
  }, [isStep4Active, hasEditedStep4, editTarget, randName, randPhone, step2TypedValue, editedName, editedPhone]);

  // 4단계 편집 입력 폴링: 숨겨진 ChatInputBar textarea 값을 읽어 선택된 대상에 반영
  useEffect(() => {
    let timer;
    function poll(){
      if(!isStep4Active){ timer = window.setTimeout(poll, 180); return; }
      try{
        const ta = document.querySelector('textarea[class*="chatInputField"]');
        const val = (ta && typeof ta.value === 'string') ? ta.value : '';
        if(editTarget === 'name'){
          const normalized = dedupeTail(val, randName || step2TypedValue || '');
          if(editedName !== normalized){ setEditedName(normalized); }
          if(!hasEditedStep4 && val !== (randName || '')){ setHasEditedStep4(true); }
        } else {
          const cleaned = sanitizePhone(val);
          if(editedPhone !== cleaned){ setEditedPhone(cleaned); }
          if(!hasEditedStep4 && val !== (randPhone || '')){ setHasEditedStep4(true); }
        }
      } catch { /* ignore */ }
      timer = window.setTimeout(poll, 160);
    }
    poll();
    return () => { if(timer) window.clearTimeout(timer); };
  }, [isStep4Active, editTarget, editedName, editedPhone, randName, randPhone, hasEditedStep4, step2TypedValue, dedupeTail]);

  // 4단계 진입 시 숨겨진 입력 값을 현재 선택된 텍스트로 초기 세팅 (빈값으로 덮어쓰는 것 방지)
  useEffect(() => {
    if(!isStep4Active) return;
    try{
      const ta = document.querySelector('textarea[class*="chatInputField"]');
      if(!ta) return;
      const want = editTarget === 'name' ? (editedName || randName || '') : (editedPhone || randPhone || '');
      if((ta.value || '') === ''){ setTextareaValueSafely(ta, want); }
    } catch { /* ignore */ }
  }, [isStep4Active, editTarget, editedName, editedPhone, randName, randPhone]);

  // 화면 이미지 재매핑:
  // - 원본 3번(step3) 제외
  // - 1차 압축 결과에서 현재 5번(step5)도 제외 → 최종 5단계
  // 최종 매핑: new[1]=old1, new[2]=old2, new[3]=old4, new[4]=old5, new[5]=old7
  // 특수 처리:
  // - step2 입력 시작 시 new[2]를 old3 이미지로 교체
  // - step4에서 편집이 시작되면 new[4]를 old6 이미지로 교체
  const newScreens = useMemo(() => {
    const result = {};
    const totalOriginal = Object.keys(rawScreens).length; // 보통 7
    for(let i=1;i<=totalOriginal;i++){
      if(i === removedStepId) continue; // old3 skip
      // 1차 매핑
      let targetId = i > removedStepId ? i - 1 : i;
      // 2차 제거 반영: 현재 5단계 제거
      if(targetId === removedStepId2) continue; // current5 skip (old6)
      if(targetId > removedStepId2) targetId = targetId - 1; // old7 -> new5

      if(targetId === 2){
        // step2: 입력 발생 시 old3로 교체
        result[targetId] = typedInStep2 && altImageForStep2 ? altImageForStep2 : rawScreens[2];
      } else if(targetId === 4){
        // step4: 편집 발생 시 old6로 교체, 아니면 old5
        result[targetId] = hasEditedStep4 && rawScreens[6] ? rawScreens[6] : rawScreens[5];
      } else if(targetId === 5){
        // 최종 단계: old7
        result[targetId] = rawScreens[7] || rawScreens[i];
      } else {
        result[targetId] = rawScreens[i];
      }
    }
    return result;
  }, [rawScreens, typedInStep2, altImageForStep2, hasEditedStep4]);
  // 단계별 TapHint 위치/크기 설정을 파일 내부에 직접 정의 (요청사항: 새 파일 없이 몇 줄만 추가)
  // dev 모드(d 키)로 화면에서 x%, y% 좌표를 확인해 그대로 넣어 조정하세요.

  // 2단계 입력값 오버레이 위치/스타일 (조정 가능): 중앙 상단에 한 줄로 표시
  const textOverlayConfig = {
    // 2단계: 왼쪽 기준(첫 글자 고정)으로 오른쪽으로 이어지게 표시 + 깜빡이는 커서 (::after pseudo)
    // zIndex를 고유값(123)으로 부여하여 CSS에서 선택자로 사용
    2: { x: '13%', y: '4%', transform: 'none', width: '88%', fontSize: '13px', fontWeight: 300, textAlign: 'left', color: '#111', whiteSpace: 'nowrap', zIndex: 123 }
  };

  // 2/6 보조 텍스트 위치/정렬 설정 (첫 글자 왼쪽 고정, 오른쪽으로 이어지게)
  // 화면 안에서 마우스를 움직이며 d 키로 좌표 디버그를 켜고 퍼센트를 맞춘 뒤 아래 값을 바꾸면 됩니다.
  const step2HelperOverlayPos = {
    x: '6%',     // 가로 위치 (왼쪽 기준)
    y: '15%',    // 세로 위치
    transform: 'none', // 왼쪽 기준 고정 (translate 제거)
    width: '88%',
    textAlign: 'left'
  };

  // TapHint: 2/5에서 보조텍스트가 보일 때 동일 영역에 힌트를 띄워 눌러도 3/5로 진행되게 함
  const tapHintConfig = {
    // 총 5단계로 축소된 맵핑 (old4~old7 -> 3~5)
    1: { selector: null, x: '50%', y: '16.5%', width: '250px', height: '30px', borderRadius: '0%', offsetX: 0, offsetY: 0 },
    // 2단계: 보조 텍스트가 보일 때만 TapHint 노출 (조건 동일)
    2: step2BottomText ? { selector: null, x: '50%', y: '16.5%', width: '250px', height: '30px', borderRadius: '0%', offsetX: 0, offsetY: 0 } : { hidden: true },
    3: { selector: null, x: '90%', y: '5.5%', width: '40px', height: '24px', borderRadius: '25%', offsetX: 0, offsetY: 0 },
    4: { selector: null, x: '91.5%', y: '9.25%', width: '38px', height: '24px', borderRadius: '25%', offsetX: 0, offsetY: 0, onActivate: () => {
      // 4/5 TapHint로 넘어갈 때 즉시 캡처 후 다음 단계로 이동
      try { captureFinals(); } catch { /* ignore */ }
      try{
        const btns = Array.from(document.querySelectorAll('button'));
        const nextBtn = btns.find(b => (b.textContent || '').trim() === '다음');
        if(nextBtn) nextBtn.click();
      } catch { /* ignore */ }
    } },
    5: { hidden: true }
  };

  // 이 레슨에서만 입력 바를 숨기기 위한 CSS (CSS Modules 클래스명 사용)
  const extraOverlay = (
    <>
      <style>{`
        .${chatInputStyles.chatInputBarAbsolute}, .${chatInputStyles.chatInputBarSticky} { display: none !important; }
        /* fix 2/7 텍스트 오버레이 깜빡이는 커서 (save 3/5 스타일 재사용) */
        @keyframes callFixCursorBlink { 0% { opacity:1; } 49.9% { opacity:1; } 50% { opacity:0; } 100% { opacity:0; } }
        /* z-index:123 이 포함된 inline style div (textOverlayConfig 2단계) 타겟 */
        div[style*="z-index: 123"]::after {
          content: '';
          display: inline-block;
          width: 2px;
          height: 1.05em;
          margin-left: 2px;
          vertical-align: text-bottom;
          background: #2980ff;
          border-radius: 1.5px;
          animation: callFixCursorBlink 0.9s steps(2, start) infinite;
        }
        /* 4/5 단계 편집 타겟에 깜빡이는 커서 표시 */
        div[data-blink-caret="1"]::after {
          content: '';
          display: inline-block;
          width: 2px;
          height: 1.05em;
          margin-left: 2px;
          vertical-align: text-bottom;
          background: #2980ff;
          border-radius: 1.5px;
          animation: callFixCursorBlink 0.9s steps(2, start) infinite;
        }
      `}</style>
      {/* 3/5 단계에서는 가상키보드를 강제로 숨김 */}
      {isStep3Active && (
        <style>{`
          [data-virtual-keyboard="1"] { display: none !important; }
        `}</style>
      )}
      {step2BottomText && (
        <div
          role="button"
          aria-label="보조 텍스트 - 다음으로 이동"
          onClick={() => {
            // GenericLesson 내부의 '다음' 버튼을 찾아 클릭
            try{
              const btns = Array.from(document.querySelectorAll('button'));
              const nextBtn = btns.find(b => (b.textContent || '').trim() === '다음');
              if(nextBtn) nextBtn.click();
            } catch { /* ignore */ }
          }}
          style={{position:'absolute', left:step2HelperOverlayPos.x, top:step2HelperOverlayPos.y, transform:step2HelperOverlayPos.transform, width:step2HelperOverlayPos.width, maxWidth:step2HelperOverlayPos.width, color:'#111', fontSize:'14px', fontWeight:400, textAlign:step2HelperOverlayPos.textAlign, pointerEvents:'auto', cursor:'pointer', whiteSpace:'nowrap', zIndex:124}}
        >
          {step2BottomText}
        </div>
      )}
      {isStep3Active && randName && (
        <div aria-hidden style={{position:'absolute', left:'50%', top:'24%', transform:'translateX(-50%)', width:'84%', whiteSpace:'normal', fontSize:'30px', fontWeight:300, color:'#ffffffff', textAlign:'center', overflow:'hidden', zIndex:125}}>
          {randName}
        </div>
      )}
      {isStep3Active && randPhone && (
        <div aria-hidden style={{position:'absolute', left:'7%', top:'65%', transform:'none', minWidth:'40px', maxWidth:'84%', whiteSpace:'nowrap', fontSize:'13px', fontWeight:300, color:'#0073ffff', textAlign:'left', overflow:'hidden', zIndex:125}}>
          {randPhone}
        </div>
      )}
      {isStep4Active && (
        <>
          {/* 백스페이스 시 한글 분해/중복 보정 표시 */}
          {(() => {
            const base = randName || '';
            const current = editedName || randName || '';
            const deduped = dedupeTail(current, base);
            return (
          <div
            role="button"
            aria-label="이름 편집"
            onClick={(e)=>{
              e.stopPropagation();
              setEditTarget('name');
              const wantRaw = (editedName || randName || '');
              const want = dedupeTail(wantRaw, base);
              setEditedName(want);
              try{
                const ta = document.querySelector('textarea[class*="chatInputField"]');
                if(ta){ setTextareaValueSafely(ta, want); }
              } catch { /* ignore */ }
            }}
            data-blink-caret={editTarget==='name' ? '1' : undefined}
            style={{position:'absolute', left:'4%', top:'15%', transform:'none', width:'92%', maxWidth:'92%', whiteSpace:'nowrap', lineHeight:'1.15', fontSize:'13px', fontWeight:300, color: editTarget==='name' ? '#0a58ff' : '#111', textAlign:'left', overflow:'visible', opacity:0.98, zIndex:126, pointerEvents:'auto', cursor:'text', textDecoration: editTarget==='name' ? 'underline' : 'none', display:'block', wordBreak:'normal', direction:'ltr'}}
          >
            {deduped}
          </div>
            );
          })()}
          <div
            role="button"
            aria-label="번호 편집"
            onClick={(e)=>{
              e.stopPropagation();
              // 이름에 중복 꼬리(마지막 글자 덧붙음)가 있으면 정규화해 둠
              setEditedName(prev => dedupeTail(prev, randName || step2TypedValue || ''));
              setEditTarget('phone');
              const wantRaw = (editedPhone || randPhone || '');
              const want = sanitizePhone(wantRaw);
              setEditedPhone(want);
              try{
                const ta = document.querySelector('textarea[class*="chatInputField"]');
                if(ta){
                  setTextareaValueSafely(ta, want);
                  // 조합 중이던 한글이 추가로 붙으면 조금 뒤에 재정리
                  setTimeout(() => {
                    try{
                      if(ta.value !== sanitizePhone(ta.value)){
                        setTextareaValueSafely(ta, sanitizePhone(ta.value));
                      }
                    } catch {/* ignore */}
                  }, 40);
                }
              } catch { /* ignore */ }
            }}
            data-blink-caret={editTarget==='phone' ? '1' : undefined}
            style={{position:'absolute', left:'37%', top:'36%', transform:'none', width:'60%', maxWidth:'60%', whiteSpace:'nowrap', fontSize:'13px', fontWeight:300, color: editTarget==='phone' ? '#0a58ff' : '#111', textAlign:'left', overflow:'visible', zIndex:126, pointerEvents:'auto', cursor:'text', textDecoration: editTarget==='phone' ? 'underline' : 'none', display:'inline-block'}}
          >
            {(editedPhone || randPhone || '')}
          </div>
        </>
      )}
      {isStep5Active && (
        <>
          {/* 3/5 형식 재사용: 중앙 큰 흰색 이름 (편집된 값 우선) */}
          {finalizedName && (
            <div aria-hidden style={{position:'absolute', left:'50%', top:'24%', transform:'translateX(-50%)', width:'84%', whiteSpace:'normal', fontSize:'30px', fontWeight:300, color:'#ffffffff', textAlign:'center', overflow:'hidden', zIndex:125}}>
              {finalizedName}
            </div>
          )}
          {finalizedPhone && (
            <div aria-hidden style={{position:'absolute', left:'7%', top:'65%', transform:'none', minWidth:'40px', maxWidth:'84%', whiteSpace:'nowrap', fontSize:'13px', fontWeight:300, color:'#0073ffff', textAlign:'left', overflow:'hidden', zIndex:125}}>
              {finalizedPhone}
            </div>
          )}
        </>
      )}
    </>
  );
  return (
    <GenericLesson
      steps={steps}
      images={{ screens: newScreens }}
      backPath="/call/learn"
      headerTitle={meta.title}
      headerTagline={meta.tagline}
      donePath="/call/learn"
      chapterId={9}
      showSubmittedBubble={false}
      tapHintConfig={tapHintConfig}
      textOverlayConfig={textOverlayConfig}
      extraOverlay={extraOverlay}
    />
  );
}
