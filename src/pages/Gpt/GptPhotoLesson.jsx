import React, { useMemo } from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './GptPhotoLessonSteps.js';
import gptAsk from '../../assets/gptAsk.png';
import gptAsk2 from '../../assets/gptAsk2.png';
import gptAsk3 from '../../assets/gptAsk3.png';

export default function GptPhotoLesson(){
  // 재사용 가능한 GPT 화면 스크린샷 활용
  const images = useMemo(()=> ({ screens: { 1: gptAsk, 2: gptAsk2, 3: gptAsk3 } }), []);
  const tapHintConfig = useMemo(()=> ({
    1: { // 사진 버튼 영역 강조 (오른쪽 하단 + 또는 이미지 아이콘 영역 근사치)
      width: '60px', height: '60px', borderRadius: '999px', offsetX: 108, offsetY: -30,
      ariaLabel: '사진 추가 버튼 탭힌트'
    }
  }), []);
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
