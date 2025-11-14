import React, { useMemo, useState, useEffect } from 'react';
import GenericLesson from '../common/GenericLesson';
import stepsBase from './GptAskLessonSteps.js';
// 새로 교체된 1,2단계 이미지
import gask1 from '../../assets/gask1.png';
import gask2 from '../../assets/gask2.png';
import gptAsk3 from '../../assets/gptAsk3.png';
import gptAsk3mp4 from '../../assets/gptAsk3.mp4';
import chatInputStyles from '../../components/ChatInputBar/ChatInputBar.module.css';

export default function GptAskLesson(){
  // Step2: keep inputPlaceholder so VirtualKeyboard appears, but we'll hide ChatInputBar visually.
  const steps = useMemo(()=> (stepsBase || []).map(s => s.id === 2 ? ({...s, inputPlaceholder: '무엇이든 물어보세요'}) : s), []);
  const images = useMemo(()=> ({ screens: { 1: gask1, 2: gask2, 3: gptAsk3 } }), []);
  const videos = useMemo(()=> ({ 3: gptAsk3mp4 }), []);
  // 3단계에서는 png 포스터가 잠깐 보이지 않도록 투명 1px poster 사용
  const transparentPoster = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  const posters = useMemo(()=> ({ 3: transparentPoster }), [transparentPoster]);
  const tapHintConfig = useMemo(()=> ({
    1: { x: '42%', y: '92%', width: '149px', height: '36px', borderRadius: '0%', offsetX: 0, offsetY: 0 },
    // Step2: custom circular tap target centered around the floating text
    2: { selector: null, x: '89.25%', y: '51.25%', width: '34px', height: '34px', borderRadius: '999px', offsetX: 0, offsetY: 0 },
    3: { hidden: true }
  }), []);

  // --- Step2 typed text overlay (DOM polling similar to CallFixLesson) ---
  const [isStep2Active, setIsStep2Active] = useState(false);
  // Overlay 텍스트는 GenericLesson 내부 textarea 값이 직접 반영되므로 별도 state 불필요
  // (중복 제거 후 미사용 state 삭제)
  useEffect(() => {
    let timer;
    function poll(){
      try {
        const spans = Array.from(document.querySelectorAll('span'));
        const total = (steps || []).length || 3;
        const active2 = spans.some(sp => (sp.textContent||'').trim() === `2 / ${total}`);
        setIsStep2Active(active2);
        // active2일 때 GenericLesson overlay의 내용은 내부 상태로 처리되므로 추가 setState 불필요
      } catch {/* ignore */}
      timer = window.setTimeout(poll, 160);
    }
    poll();
    return () => { if(timer) window.clearTimeout(timer); };
  }, [steps]);

  const textOverlayConfig = useMemo(() => ({
    2: { x: '18%', y: '49.5%', width: '88%', transform: 'none', fontSize: '13px', fontWeight: 300, textAlign: 'left', color: '#fff', whiteSpace: 'nowrap', zIndex: 223 }
  }), []);

  const extraOverlay = (
    <>
      {isStep2Active && (
        <style>{`
          .${chatInputStyles.chatInputBarAbsolute}, .${chatInputStyles.chatInputBarSticky} { display:none !important; }
          @keyframes gptAskCursorBlink { 0%{opacity:1;}49.9%{opacity:1;}50%{opacity:0;}100%{opacity:0;} }
          div[style*='z-index: 223']::after { content:''; display:inline-block; width:2px; height:1.05em; margin-left:2px; vertical-align:text-bottom; background:#2980ff; border-radius:1.5px; animation:gptAskCursorBlink .9s steps(2,start) infinite; }
        `}</style>
      )}
      {/* 중복 표시 제거: GenericLesson이 textOverlayConfig로 렌더링하는 한 줄만 사용 */}
    </>
  );

  return (
    <GenericLesson
      steps={steps}
      images={images}
      videos={videos}
      posters={posters}
      tapHintConfig={tapHintConfig}
      textOverlayConfig={textOverlayConfig}
      extraOverlay={extraOverlay}
      backPath="/gpt/learn"
      headerTitle="글로 질문하기"
      headerTagline="궁금한 것을 글로 질문하기"
      donePath="/gpt/learn"
      showSubmittedBubble={false}
    />
  );
}
