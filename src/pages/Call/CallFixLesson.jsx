import React, { useMemo } from 'react';
import GenericLesson from '../common/GenericLesson';
import { buildCallLessonConfig, topicMeta } from './callDynamicSteps.js';
import chatInputStyles from '../../components/ChatInputBar/ChatInputBar.module.css';

export default function CallFixLesson(){
  const { steps: rawSteps, screens } = useMemo(() => buildCallLessonConfig('fix'), []);
  const meta = topicMeta.fix;
  // 2/7 단계에서 가상키보드 활성화를 위해 inputPlaceholder 추가 (ChatInputBar는 추후 원하면 숨김 처리 가능)
  const steps = useMemo(() => rawSteps.map(s => s.id === 2 ? { ...s, inputPlaceholder: '수정할 내용을 입력하세요' } : s), [rawSteps]);
  // 단계별 TapHint 위치/크기 설정을 파일 내부에 직접 정의 (요청사항: 새 파일 없이 몇 줄만 추가)
  // dev 모드(d 키)로 화면에서 x%, y% 좌표를 확인해 그대로 넣어 조정하세요.
  const tapHintConfig = {
    // selector:null + offsetX/offsetY:0 으로 기본 오프셋 무시하고 x/y를 절대 좌표로 사용
    1: { selector: null, x: '50%', y: '16.5%', width: '250px', height: '30px', borderRadius: '0%', offsetX: 0, offsetY: 0 },
    2: { hidden: true }, // 2/7 단계 TapHint 제거
    3: { selector: null, x: '18%', y: '55%', width: '34px', height: '34px', borderRadius: '50%', offsetX: 0, offsetY: 0 },
    4: { selector: null, x: '50%', y: '72%', width: '40px', height: '40px', borderRadius: '50%', offsetX: 0, offsetY: 0 },
    5: { selector: null, x: '83%', y: '28%', width: '30px', height: '30px', borderRadius: '50%', offsetX: 0, offsetY: 0 },
    6: { selector: null, x: '30%', y: '34%', width: '34px', height: '34px', borderRadius: '50%', offsetX: 0, offsetY: 0 },
    7: { selector: null, x: '58%', y: '50%', width: '36px', height: '36px', borderRadius: '50%', offsetX: 0, offsetY: 0 }
  };

  // 2단계 입력값 오버레이 위치/스타일 (조정 가능): 중앙 상단에 한 줄로 표시
  const textOverlayConfig = {
    // 2단계: 왼쪽 기준(첫 글자 고정)으로 오른쪽으로 이어지게 표시 + 깜빡이는 커서 (::after pseudo)
    // zIndex를 고유값(123)으로 부여하여 CSS에서 선택자로 사용
    2: { x: '13%', y: '4%', transform: 'none', width: '88%', fontSize: '13px', fontWeight: 300, textAlign: 'left', color: '#111', whiteSpace: 'nowrap', zIndex: 123 }
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
          box-shadow: 0 0 4px #5aa4ff, 0 0 8px rgba(41,128,255,0.65);
          animation: callFixCursorBlink 0.9s steps(2, start) infinite;
        }
      `}</style>
    </>
  );
  return (
    <GenericLesson
      steps={steps}
      images={{ screens }}
      backPath="/call/learn"
      headerTitle={meta.title}
      headerTagline={meta.tagline}
      donePath="/call/learn"
      chapterId={9}
      tapHintConfig={tapHintConfig}
      textOverlayConfig={textOverlayConfig}
      extraOverlay={extraOverlay}
    />
  );
}
