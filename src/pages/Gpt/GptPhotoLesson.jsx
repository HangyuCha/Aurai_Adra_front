import React, { useMemo, useState, useEffect } from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './GptPhotoLessonSteps.js';
import gptAsk from '../../assets/gptAsk.png';
import GptPhoto2 from '../../assets/GptPhoto2.png';
import GptPhoto3 from '../../assets/GptPhoto3.mp4';
import chatInputStyles from '../../components/ChatInputBar/ChatInputBar.module.css';
import gptAsk3 from '../../assets/gptAsk3.png';
import gptAttach1 from '../../assets/gpt_attach1.png';

export default function GptPhotoLesson(){
  // 재사용 가능한 GPT 화면 스크린샷 활용
  // 1단계 이미지는 state로 관리하여 TapHint로 교체 가능하도록 한다.
  const [screen1, setScreen1] = useState(gptAsk);
  // hintStage: 1 = initial hint visible, 2 = show secondary hint after first tap
  const [hintStage, setHintStage] = useState(1);
  const images = useMemo(() => ({ screens: { 1: screen1, 2: GptPhoto2 } }), [screen1]);
  const videos = useMemo(() => ({ 3: GptPhoto3 }), []);
  const transparentPoster = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  const posters = useMemo(() => ({ 3: transparentPoster }), [transparentPoster]);

  // 첫번째 탭힌트: 이미지 교체 후 두번째 힌트를 보여준다
  function handleAttachTap(){
    try{ setScreen1(gptAttach1); } catch { /* ignore */ }
    setHintStage(2);
  }

  // Note: rely on GenericLesson to provide `answer` + `composePreview` to extraOverlay

  // step 1에는 두 개의 힌트를 배열로 전달: 첫번재는 초기, 두번째는 첫 탭 후 활성화
  const tapHintConfig = useMemo(() => ({
    1: [
      {
        width: '45px', height: '30px', borderRadius: '99px', offsetX: -100, offsetY: -65,
        ariaLabel: '사진 추가 버튼 탭힌트', onActivate: handleAttachTap,
        hidden: hintStage !== 1
      },
      {
        width: '100px', height: '30px', borderRadius: '12px', offsetX: -70, offsetY: 155,
        ariaLabel: '사진 확인 탭힌트',
        // no onActivate -> GenericLesson will use its default handler (advance/next)
        hidden: hintStage !== 2
      }
    ]
    ,
    2: {
      // small circular hint near the floating text area
      selector: null,
      x: '88%', y: '47%', width: '34px', height: '34px', borderRadius: '999px', offsetX: 0, offsetY: 0,
      ariaLabel: '스텝2 탭힌트'
      // no onActivate -> GenericLesson will use its default handler (advance/next)
    }
  }), [hintStage]);
  // disable the default textOverlay for this lesson to avoid duplicating the step2 input
  const textOverlayConfig = useMemo(() => ({}), []);

  const extraOverlay = ({ step, current, answer, composePreview, submittedText }) => {
    const show = step === 2 && current && (current.inputPlaceholder || current.forceKeyboard);
    const value = submittedText || (answer || '') + (typeof composePreview === 'function' ? composePreview() : '');
    return (
      <>
        {show && (
          <style>{`
            .${chatInputStyles.chatInputBarAbsolute}, .${chatInputStyles.chatInputBarSticky} { display:none !important; }
            @keyframes gptAskCursorBlink { 0%{opacity:1;}49.9%{opacity:1;}50%{opacity:0;}100%{opacity:0;} }
            div[style*='z-index: 223']::after { content:''; display:inline-block; width:2px; height:1.05em; margin-left:2px; vertical-align:text-bottom; background:#2980ff; border-radius:1.5px; animation:gptAskCursorBlink .9s steps(2,start) infinite; }
            /* Step2 floating text bar that mimics GPT input (more transparent) */
            .gpt-step2-bar { position: absolute; left: 18%; top: 43%; width: 64%; transform: none; font-size: 13px; font-weight: 300; color: #fff; background: rgba(18,20,23,0.38); padding: 10px 14px; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.35); z-index: 230; display:flex; align-items:center; gap:8px; backdrop-filter: blur(6px); }
            .gpt-step2-text { flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; opacity: .98; }
            .gpt-step2-cursor { width:2px; height:1.05em; background:#2980ff; border-radius:1px; animation:gptAskCursorBlink .9s steps(2,start) infinite; }
            @media (max-width:800px) { .gpt-step2-bar { left: 8%; width: 84%; } }
          `}</style>
        )}
        {show && (
          <div className="gpt-step2-bar" aria-hidden>
            <div className="gpt-step2-text">{value || current?.inputPlaceholder || '무엇이든 물어보세요'}</div>
            <div className="gpt-step2-cursor" />
          </div>
        )}
      </>
    );
  };
  return (
    <GenericLesson
      steps={steps}
      images={images}
      videos={videos}
      posters={posters}
      videoLoop={false}
      tapHintConfig={tapHintConfig}
      textOverlayConfig={textOverlayConfig}
      extraOverlay={extraOverlay}
      backPath="/gpt/learn"
      headerTitle="사진으로 질문하기"
      headerTagline="프롬프트 사진 넣어서 질문하기"
      donePath="/gpt/learn"
      showSubmittedBubble={false}
    />
  );
}
