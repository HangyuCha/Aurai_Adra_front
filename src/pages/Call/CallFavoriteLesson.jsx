import React, { useMemo, useState, useEffect } from 'react';
import GenericLesson from '../common/GenericLesson';
import { buildCallLessonConfig, topicMeta } from './callDynamicSteps.js';
import chatInputStyles from '../../components/ChatInputBar/ChatInputBar.module.css';

export default function CallFavoriteLesson(){
  const { steps: rawSteps, screens } = useMemo(() => buildCallLessonConfig('favorite'), []);
  // Face 1/5~2/5의 phone module 기능을 Favorite 2/6~3/6에 이식: 2단계에 키보드 띄우기
  const steps = useMemo(() => (rawSteps || []).map(s => (s.id === 2 ? { ...s, inputPlaceholder: '수정할 내용을 입력하세요' } : s)), [rawSteps]);
  const totalSteps = steps.length || 6;
  // 요청: 3/6 단계 이미지를 cfavorite6.png로 교체 (즉, step 3의 화면을 index 6 이미지로 대체)
  const mergedScreens = useMemo(() => {
    const out = { ...(screens || {}) };
    if (screens && screens[6]) {
      out[3] = screens[6];
    }
    return out;
  }, [screens]);
  const meta = topicMeta.favorite;

  // Face와 동일한 동작을 위한 상태들
  const [typedInStep2, setTypedInStep2] = useState(false);
  const [step2KeyPressCount, setStep2KeyPressCount] = useState(0);
  const [step2BottomText, setStep2BottomText] = useState('');
  const [step2TypedValue, setStep2TypedValue] = useState('');
  const [isStep3Active, setIsStep3Active] = useState(false);
  const [randName, setRandName] = useState('');
  const [randPhone, setRandPhone] = useState('');

  // VK 키 입력 카운트 (모드키 제외)
  useEffect(() => {
    function onPointer(e){
      const spans = Array.from(document.querySelectorAll('span'));
      const onStep2 = spans.some(sp => ((sp.textContent || '').trim() === `2 / ${totalSteps}`));
      if(!onStep2) return;
      const kbRoot = e.target.closest('[data-virtual-keyboard="1"]');
      if(!kbRoot) return;
      const btn = e.target.closest('button');
      if(!btn) return;
      const label = (btn.getAttribute('aria-label') || btn.textContent || '').trim();
      if(['123','ABC','#+=','한','⇧'].includes(label)) return;
      setStep2KeyPressCount(c => c + 1);
    }
    window.addEventListener('pointerdown', onPointer, true);
    return () => window.removeEventListener('pointerdown', onPointer, true);
  }, [totalSteps]);

  // step2 텍스트/보조텍스트 폴링
  useEffect(() => {
    let timer;
    function poll(){
      const el = document.querySelector('div[style*="z-index: 123"]');
      if(el){
        const txt = (el.textContent || '').trim();
        if(!typedInStep2 && txt.length > 0){ setTypedInStep2(true); }
        if(step2KeyPressCount > 2){ setStep2BottomText(txt); } else { setStep2BottomText(''); }
        if(txt){ setStep2TypedValue(txt); }
      } else {
        setStep2BottomText('');
        if(step2KeyPressCount !== 0) setStep2KeyPressCount(0);
        if(typedInStep2) setTypedInStep2(false);
      }
      timer = window.setTimeout(poll, 140);
    }
    poll();
    return () => { if(timer) window.clearTimeout(timer); };
  }, [typedInStep2, step2KeyPressCount]);

  // 3/6 활성 감지 및 이름/번호 준비
  useEffect(() => {
    let timer;
    function poll(){
      const spans = Array.from(document.querySelectorAll('span'));
      const match3 = spans.find(sp => ((sp.textContent || '').trim() === `3 / ${totalSteps}`));
      const active3 = Boolean(match3);
      setIsStep3Active(active3);
      if(active3){
        if(!randName){
          const fallbackNames = ['김서연','이도윤','박지후','최하윤','정우진','한서준','홍길동','서지후','유하준','노아'];
          const picked = (step2TypedValue || '').trim();
          setRandName(picked.length ? picked : fallbackNames[Math.floor(Math.random()*fallbackNames.length)]);
        }
        if(!randPhone){
          const n4 = () => String(Math.floor(1000 + Math.random()*9000));
          setRandPhone(`010-${n4()}-${n4()}`);
        }
      }
      timer = window.setTimeout(poll, 180);
    }
    poll();
    return () => { if(timer) window.clearTimeout(timer); };
  }, [totalSteps, randName, randPhone, step2TypedValue]);

  // Face 2/5 오버레이 스타일과 동일 (깜빡이는 커서)
  const textOverlayConfig = {
    2: { x: '13%', y: '4%', transform: 'none', width: '88%', fontSize: '13px', fontWeight: 300, textAlign: 'left', color: '#111', whiteSpace: 'nowrap', zIndex: 123 }
  };
  // TapHint: Face 1/5 위치를 Favorite 2/6에 매핑, 3/6은 다음 버튼 영역
  const tapHintConfig = {
    2: { selector: null, x: '50%', y: '16.5%', width: '250px', height: '30px', borderRadius: '0%', offsetX: 0, offsetY: 0 },
    3: { selector: null, x: '90%', y: '5.5%', width: '40px', height: '24px', borderRadius: '25%', offsetX: 0, offsetY: 0 }
  };

  const step2HelperOverlayPos = { x: '6%', y: '15%', transform: 'none', width: '88%', textAlign: 'left' };
  const extraOverlay = (
    <>
      <style>{`
        .${chatInputStyles.chatInputBarAbsolute}, .${chatInputStyles.chatInputBarSticky} { display: none !important; }
        @keyframes favCursorBlink { 0% { opacity:1; } 49.9% { opacity:1; } 50% { opacity:0; } 100% { opacity:0; } }
        div[style*="z-index: 123"]::after {
          content: '';
          display: inline-block;
          width: 2px;
          height: 1.05em;
          margin-left: 2px;
          vertical-align: text-bottom;
          background: #2980ff;
          border-radius: 1.5px;
          animation: favCursorBlink 0.9s steps(2, start) infinite;
        }
      `}</style>
      {step2BottomText && (
        <div
          role="button"
          aria-label="보조 텍스트 - 다음으로 이동"
          onClick={() => {
            try{
              const btns = Array.from(document.querySelectorAll('button'));
              const nextBtn = btns.find(b => (b.textContent || '').trim() === '다음');
              if(nextBtn) nextBtn.click();
            } catch { /* no-op */ }
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
    </>
  );
  return (
    <GenericLesson
      steps={steps}
      images={{ screens: mergedScreens }}
      backPath="/call/learn"
      headerTitle={meta.title}
      headerTagline={meta.tagline}
      donePath="/call/learn"
      chapterId={10}
      tapHintConfig={tapHintConfig}
      textOverlayConfig={textOverlayConfig}
      extraOverlay={extraOverlay}
    />
  );
}
