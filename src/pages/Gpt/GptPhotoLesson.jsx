import React, { useMemo, useState } from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './GptPhotoLessonSteps.js';
import gptAsk from '../../assets/gptAsk.png';
import gptAsk2 from '../../assets/gptAsk2.png';
import gptAsk3 from '../../assets/gptAsk3.png';
import gptAttach1 from '../../assets/gpt_attach1.png';

export default function GptPhotoLesson(){
  // 재사용 가능한 GPT 화면 스크린샷 활용
  // 1단계 이미지는 state로 관리하여 TapHint로 교체 가능하도록 한다.
  const [screen1, setScreen1] = useState(gptAsk);
  // hintStage: 1 = initial hint visible, 2 = show secondary hint after first tap
  const [hintStage, setHintStage] = useState(1);
  const images = useMemo(() => ({ screens: { 1: screen1, 2: gptAsk2, 3: gptAsk3 } }), [screen1]);

  // 첫번째 탭힌트: 이미지 교체 후 두번째 힌트를 보여준다
  function handleAttachTap(){
    try{ setScreen1(gptAttach1); } catch { /* ignore */ }
    setHintStage(2);
  }

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
  }), [hintStage]);
  return (
    <GenericLesson
      steps={steps}
      images={images}
      tapHintConfig={tapHintConfig}
      backPath="/gpt/learn"
      headerTitle="사진으로 질문하기"
      headerTagline="프롬프트 사진 넣어서 질문하기"
      donePath="/gpt/learn"
      showSubmittedBubble={false}
    />
  );
}
