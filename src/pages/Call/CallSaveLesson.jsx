import React, { useMemo } from 'react';
import GenericLesson from '../common/GenericLesson';
import { buildCallLessonConfig, topicMeta } from './callDynamicSteps.js';

export default function CallSaveLesson(){
  const { steps, screens } = useMemo(() => buildCallLessonConfig('save'), []);
  const meta = topicMeta.save;
  // Step 1: small circular TapHint at top-right, moved down by 100px
  // Use absolute x/y with pixels and omit selector so width/height stay fixed (20x20)
  const tapHintConfig = {
    1: {
      selector: null,
      // 중앙 기준에서 오른쪽/아래로 이동시키는 이전 사용자 조정 값 복구 (없다면 기본 중앙)
      x: '50%',
      y: '50%',
      offsetX: 118,
      offsetY: 193,
      width: '20px',
      height: '20px',
      borderRadius: '20%'
    },
    2: {
      // focusAreas[1] 정보 {x:12,y:38,w:76,h:8} ⇒ 중심 (12 + 76/2 = 50, 38 + 8/2 = 42)
      selector: null,
      x: '50%',
      y: '42%',
      offsetX: 0,
      offsetY: -100,
      width: '100%',
      height: '8%',
      borderRadius: '10px'
    },
    3: {
      // 3/5에서는 TapHint를 숨김
      hidden: true
    }
  };
  // Step 3: 상단 중앙에 현재 입력값(또는 제출된 값) 표시
  const textOverlayConfig = {
    3: {
      x: '8%',
      y: '23%',
      width: '84%',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: 500,
      color: '#111'
    }
  };
  return (
    <GenericLesson
      steps={steps}
      images={{ screens }}
      tapHintConfig={tapHintConfig}
      textOverlayConfig={textOverlayConfig}
      backPath="/call/learn"
      headerTitle={meta.title}
      headerTagline={meta.tagline}
      donePath="/call/learn"
      chapterId={7}
    />
  );
}
