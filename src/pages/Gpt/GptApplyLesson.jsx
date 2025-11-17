import React, { useMemo } from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './GptApplyLessonSteps.js';
import gptAsk from '../../assets/gptAsk.png';
import gptAsk2 from '../../assets/gptAsk2.png';
import gptAsk3 from '../../assets/gptAsk3.png';
import GptApply1 from '../../assets/GptApply1.mp4';
import GptApply2 from '../../assets/GptApply2.mp4';
import chatInputStyles from '../../components/ChatInputBar/ChatInputBar.module.css';
export default function GptApplyLesson(){
  const images = useMemo(()=> ({ screens: { 1: gptAsk2, 3: gptAsk3 } }), []);
  const videos = useMemo(() => ({ 2: GptApply1, 3: GptApply2 }), []);
  const transparentPoster = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  const posters = useMemo(() => ({ 2: transparentPoster, 3: transparentPoster }), [transparentPoster]);

  // disable GenericLesson's default text overlay to avoid duplication
  const textOverlayConfig = useMemo(() => ({}), []);

  // simple tap hint for step 1: small circular hint over the phone screen
  // Use explicit x/y and fixed px size so the hint does NOT scale with the phone
  const tapHintConfig = useMemo(()=> ({
    // explicit selector:null ensures TapHint will NOT compute size from a target element
    // and will instead use the provided width/height values
    // small circular hint centered horizontally and moved up so it sits above the keyboard
    1: { selector: null, x: '89%', y: '64%', width: '30px', height: '30px', borderRadius: '999px', offsetX: 0, offsetY: 80 },
    // Step2: custom circular tap target centered around the floating text
    2: { selector: null, x: '83.25%', y: '51.25%', width: '40px', height: '40px', borderRadius: '999px', offsetX: 0, offsetY: 0 },
    3: { hidden: true }
  }), []);

  // Render overlays: step1 floating bar + step2 bottom bar above virtual keyboard
  const extraOverlay = ({ step, current, answer, composePreview, submittedText }) => {
    const showStep1 = step === 1 && current && (current.inputPlaceholder || current.forceKeyboard);
    const showStep2 = step === 2 && current && (current.inputPlaceholder || current.forceKeyboard);
    const value = submittedText || (answer || '') + (typeof composePreview === 'function' ? composePreview() : '');
    return (
      <>
        {(showStep1 || showStep2) && (
          <style>{`
            .${chatInputStyles.chatInputBarAbsolute}, .${chatInputStyles.chatInputBarSticky} { display:none !important; }
            @keyframes gptAskCursorBlink { 0%{opacity:1;}49.9%{opacity:1;}50%{opacity:0;}100%{opacity:0;} }
            div[style*='z-index: 223']::after { content:''; display:inline-block; width:2px; height:1.05em; margin-left:2px; vertical-align:text-bottom; background:#2980ff; border-radius:1.5px; animation:gptAskCursorBlink .9s steps(2,start) infinite; }
            /* Step1 floating bar (center) */
            /* lowered so TapHint (z-index:50) can appear above this bar */
            .gpt-apply-bar { position: absolute; left: 16%; top: 42%; width: 58%; transform: none; font-size: 13px; font-weight: 300; color: #fff; background: rgba(18,20,23,0.6); padding: 10px 14px; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.45); z-index: 30; display:flex; align-items:center; gap:8px; backdrop-filter: blur(4px); }
            .gpt-apply-text { flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; opacity: .98; }
            .gpt-apply-cursor { width:2px; height:1.05em; background:#2980ff; border-radius:1px; animation:gptAskCursorBlink .9s steps(2,start) infinite; }
            /* Step2 bottom bar placed above virtual keyboard - make darker and wider */
            /* lowered z-index so TapHint (z-index 50) can appear above this bar without editing TapHint styles */
            .gpt-step2-bottom { position: absolute; left: 4%; right: 4%; bottom: 200px; height: 35px; display:flex; align-items:center; padding: 10px 18px; border-radius: 999px; background: rgba(0,0,0,0.96); color:#fff; font-size:15px; z-index:40; box-shadow: 0 14px 40px rgba(0,0,0,0.6); pointer-events: none; }
            .gpt-step2-bottom .text { flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
            .gpt-step2-bottom .cursor { width:2px; height:1.05em; background:#2980ff; border-radius:1px; margin-left:8px; animation:gptAskCursorBlink .9s steps(2,start) infinite; }
            .gpt-step2-send { width:36px; height:36px; border-radius:999px; background:#eef0f3; display:inline-flex; align-items:center; justify-content:center; margin-left:8px; box-shadow: 0 3px 8px rgba(0,0,0,0.25); border: none; cursor: pointer; pointer-events: auto; }
            .gpt-step2-send:active { transform: translateY(1px); }
            .gpt-step2-send .arrow { width:14px; height:14px; color:#222; transform: translateY(-1px); }
            @media (max-width:800px) { .gpt-step2-bottom { bottom: 180px; left:3%; right:3%; } .gpt-apply-bar { left:8%; width:84%; } }
          `}</style>
        )}

        {showStep1 && (
          <div className="gpt-apply-bar" aria-hidden>
            <div className="gpt-apply-text">{value || current?.inputPlaceholder || '무엇이든 물어보세요'}</div>
            <div className="gpt-apply-cursor" />
          </div>
        )}

        {showStep2 && (
          <div className="gpt-step2-bottom" aria-hidden>
            <div className="text">{value || current?.inputPlaceholder || '무엇이든 물어보세요'}</div>
            <div className="cursor" />
            <button
              type="button"
              aria-label="메시지 보내기"
              className="gpt-step2-send"
              onClick={() => {
                const b = document.querySelector('button[aria-label="메시지 보내기"]:not(.gpt-step2-send)');
                if(b) b.click();
              }}
            >
              <svg className="arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M12 4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 10l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <GenericLesson
      steps={steps}
      images={images}
      backPath="/gpt/learn"
      headerTitle="GPT 응용하기"
      headerTagline="지브리 풍 만들기"
      donePath="/gpt/learn"
      showSubmittedBubble={false}
      videos={videos}
      posters={posters}
      videoLoop={false}
      textOverlayConfig={textOverlayConfig}
      tapHintConfig={tapHintConfig}
      extraOverlay={extraOverlay}
    />
  );
}

