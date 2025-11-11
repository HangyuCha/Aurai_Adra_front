import React, { useMemo, useEffect, useState } from 'react';
import GenericLesson from '../common/GenericLesson';
import { buildCallLessonConfig, topicMeta } from './callDynamicSteps.js';
import chatInputStyles from '../../components/ChatInputBar/ChatInputBar.module.css';

export default function CallFaceLesson(){
  // face 기본 구성과 fix 구성을 모두 불러와 이미지(스크린) 1~3만 fix 것으로 덮어씌웁니다.
  const { steps: faceRawSteps, screens: faceScreens } = useMemo(() => buildCallLessonConfig('face'), []);
  const { screens: fixScreens } = useMemo(() => buildCallLessonConfig('fix'), []);
  const meta = topicMeta.face;
  // 원본 face 단계 수 (예: 7). 3단계를 제거하고 뒤 단계를 앞으로 당겨 총 단계수 -1.
  // 제거 후 재번호화하면서 2단계에 placeholder 추가.
  const steps = useMemo(() => {
    const filtered = (faceRawSteps || []).filter(s => s.id !== 3); // 원래 3단계 제거
    // 1차 재번호화
    const remapped = filtered.map((s, idx) => ({ ...s, id: idx + 1 }));
    // 현재 5/6 단계 제거 요구 반영: 새 id 5 제거
    const removedStep5 = remapped.filter(s => s.id !== 5);
    // 최종 재번호화
    const finalRemap = removedStep5.map((s, idx) => ({ ...s, id: idx + 1 }));
    // 2단계에서 키보드 유도를 위해 placeholder 부여
    return finalRemap.map(s => (s.id === 2 ? { ...s, inputPlaceholder: '수정할 내용을 입력하세요' } : s));
  }, [faceRawSteps]);

  const totalSteps = steps.length; // 총 단계: (원본-2) -> 예: 7→5, 6→4 등

  // 2단계에서 첫 키 입력 후 이미지(스크린)를 원래 3번 이미지를 보여주도록 스왑
  const [step2Upgraded, setStep2Upgraded] = useState(false); // true면 2단계 이미지 교체

  // 이미지 매핑:
  // - 새 1단계: 원래 1단계 이미지 (fix override 적용)
  // - 새 2단계: 기본은 원래 2단계 이미지, 키 입력 후 원래 3단계 이미지로 교체 (fix override 적용 대상: 1,2단계만)
  // - 새 3단계 이후: 원래 4→3, 5→4, ... 순으로 당겨짐
  const [step4Upgraded, setStep4Upgraded] = useState(false); // true면 4단계 이미지(원래 6)로 교체

  const mergedScreens = useMemo(() => {
    const result = {};
    if(faceScreens){
      // 새 id 1 -> 원래 id1 (fix override)
      result[1] = (fixScreens && fixScreens[1]) ? fixScreens[1] : faceScreens[1];
      // 새 id 2 -> 원래 id2 또는 (업그레이드 시) 원래 id3 (fix override)
      result[2] = step2Upgraded
        ? ((fixScreens && fixScreens[3]) ? fixScreens[3] : faceScreens[3])
        : ((fixScreens && fixScreens[2]) ? fixScreens[2] : faceScreens[2]);
      // 새 id 3 -> 원래 id4 (3 제거 영향)
      result[3] = faceScreens[4];
      // 새 id 4 -> 기본 원래 id5, 1초 후 업그레이드 시 원래 id6
      result[4] = step4Upgraded ? faceScreens[6] : faceScreens[5];
      // 새 id 5 -> 원래 id7 (3 제거 + 새 5 제거로 +2 시프트)
      if(totalSteps >= 5){
        result[5] = faceScreens[7];
      }
    }
    return result;
  }, [faceScreens, fixScreens, step2Upgraded, step4Upgraded, totalSteps]);

  // fix 1~3단계와 동일한 기능: 2단계 입력 오버레이 + TapHint 조건 + 3단계 이름/번호 표시
  const [typedInStep2, setTypedInStep2] = useState(false);
  const [step2KeyPressCount, setStep2KeyPressCount] = useState(0);
  const [step2BottomText, setStep2BottomText] = useState('');
  const [step2TypedValue, setStep2TypedValue] = useState('');
  const [isStep3Active, setIsStep3Active] = useState(false);
  const [isStep5Active, setIsStep5Active] = useState(false);
  const [randName, setRandName] = useState('');
  const [randPhone, setRandPhone] = useState('');

  // VK 키 입력 횟수 증가 (모드 전환/Shift 제외) - pointerdown 캡처
  useEffect(() => {
    function handlePointer(e){
      // 새 2단계 진행 중인지 판별: 진행 표시가 '2 / totalSteps' 인 span 존재 + 오버레이 위치
      const spans = Array.from(document.querySelectorAll('span'));
      const progressSpan = spans.find(sp => (sp.textContent || '').trim() === `2 / ${totalSteps}`);
      if(!progressSpan) return;
      const kbRoot = e.target.closest('[data-virtual-keyboard="1"]');
      if(!kbRoot) return;
      const btn = e.target.closest('button');
      if(!btn) return;
      const label = (btn.getAttribute('aria-label') || btn.textContent || '').trim();
      if(['123','ABC','#+=','한','⇧'].includes(label)) return;
      setStep2KeyPressCount(c => c + 1);
    }
    window.addEventListener('pointerdown', handlePointer, true);
    return () => window.removeEventListener('pointerdown', handlePointer, true);
  }, [totalSteps]);

  // 첫 실제 키 입력 발생 시 업그레이드 플래그 설정
  useEffect(() => {
    if(step2KeyPressCount >= 1 && !step2Upgraded){
      setStep2Upgraded(true);
    }
  }, [step2KeyPressCount, step2Upgraded]);

  // 4단계에 진입 후 1초 뒤 이미지 업그레이드(원래 6번 이미지로 교체)
  useEffect(() => {
    let pollTimer;
    let upgradeTimer;
    function poll(){
      const total = steps.length || 5;
      const spans = Array.from(document.querySelectorAll('span'));
      const onStep4 = spans.some(sp => ((sp.textContent || '').trim() === `4 / ${total}`));
      if(onStep4 && !step4Upgraded && !upgradeTimer){
        upgradeTimer = window.setTimeout(() => setStep4Upgraded(true), 1000);
      }
      pollTimer = window.setTimeout(poll, 180);
    }
    poll();
    return () => { if(pollTimer) window.clearTimeout(pollTimer); if(upgradeTimer) window.clearTimeout(upgradeTimer); };
  }, [steps, step4Upgraded]);

  // step2 오버레이 텍스트 폴링 + 보조텍스트 노출 조건 (새 2단계 기준)
  useEffect(() => {
    let timer;
    function poll(){
      // 오버레이는 여전히 z-index:123 사용
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

  // 새 3단계(원래 4단계) 활성 감지 및 이름/번호 준비
  useEffect(() => {
    let timer;
    const total = steps.length || 6;
    function poll(){
      const spans = Array.from(document.querySelectorAll('span'));
      const match3 = spans.find(sp => ((sp.textContent || '').trim() === `3 / ${total}`));
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
  }, [steps, randName, randPhone, step2TypedValue]);

  // 5단계 활성 감지 (최종 단계에 동일 오버레이 표시)
  useEffect(() => {
    let timer;
    const total = steps.length || 5;
    function poll(){
      const spans = Array.from(document.querySelectorAll('span'));
      const match5 = spans.find(sp => ((sp.textContent || '').trim() === `5 / ${total}`));
      setIsStep5Active(Boolean(match5));
      timer = window.setTimeout(poll, 180);
    }
    poll();
    return () => { if(timer) window.clearTimeout(timer); };
  }, [steps]);

  // fix 2/5 오버레이 스타일과 동일한 텍스트 오버레이 (깜빡이는 커서)
  const textOverlayConfig = {
    2: { x: '13%', y: '4%', transform: 'none', width: '88%', fontSize: '13px', fontWeight: 300, textAlign: 'left', color: '#111', whiteSpace: 'nowrap', zIndex: 123 }
  };

  // TapHint 설정: 1단계, 2단계(보조텍스트 있을 때만), 3단계
  const tapHintConfig = {
    1: { selector: null, x: '50%', y: '16.5%', width: '250px', height: '30px', borderRadius: '0%', offsetX: 0, offsetY: 0 },
    2: step2BottomText ? { selector: null, x: '50%', y: '16.5%', width: '250px', height: '30px', borderRadius: '0%', offsetX: 0, offsetY: 0 } : { hidden: true },
    3: { selector: null, x: '62%', y: '38.75%', width: '64px', height: '46px', borderRadius: '25%', offsetX: 0, offsetY: 0 },
    // 4단계 TapHint는 1초 후(이미지 업그레이드 시점) 나타나도록 gating
    4: step4Upgraded
      ? { selector: null, x: '87.25%', y: '17.5%', width: '40px', height: '40px', borderRadius: '50%', offsetX: 0, offsetY: 0 }
      : { hidden: true }
  };

  // 보조텍스트 클릭 시 다음으로 이동
  const step2HelperOverlayPos = { x: '6%', y: '15%', transform: 'none', width: '88%', textAlign: 'left' };
  const extraOverlay = (
    <>
      <style>{`
        .${chatInputStyles.chatInputBarAbsolute}, .${chatInputStyles.chatInputBarSticky} { display: none !important; }
        @keyframes faceCursorBlink { 0% { opacity:1; } 49.9% { opacity:1; } 50% { opacity:0; } 100% { opacity:0; } }
        div[style*="z-index: 123"]::after {
          content: '';
          display: inline-block;
          width: 2px;
          height: 1.05em;
          margin-left: 2px;
          vertical-align: text-bottom;
          background: #2980ff;
          border-radius: 1.5px;
          animation: faceCursorBlink 0.9s steps(2, start) infinite;
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
      {/* 5/5에서도 3/5와 동일한 오버레이 표시 */}
      {isStep5Active && randName && (
        <div aria-hidden style={{position:'absolute', left:'50%', top:'24%', transform:'translateX(-50%)', width:'84%', whiteSpace:'normal', fontSize:'30px', fontWeight:300, color:'#ffffffff', textAlign:'center', overflow:'hidden', zIndex:125}}>
          {randName}
        </div>
      )}
      {isStep5Active && randPhone && (
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
      chapterId={14}
      tapHintConfig={tapHintConfig}
      textOverlayConfig={textOverlayConfig}
      extraOverlay={extraOverlay}
      showSubmittedBubble={false}
    />
  );
}
