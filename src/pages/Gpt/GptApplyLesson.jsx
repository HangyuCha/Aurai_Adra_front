import React, { useMemo } from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './GptApplyLessonSteps.js';
import gptAsk from '../../assets/gptAsk.png';
import gptAsk2 from '../../assets/gptAsk2.png';
import gptAsk3 from '../../assets/gptAsk3.png';

export default function GptApplyLesson(){
  const images = useMemo(()=> ({ screens: { 1: gptAsk, 2: gptAsk2, 3: gptAsk3 } }), []);
  return (
    <GenericLesson
      steps={steps}
      images={images}
      backPath="/gpt/learn"
      headerTitle="GPT 응용하기"
      headerTagline="지브리 풍 만들기"
      donePath="/gpt/learn"
      showSubmittedBubble={false}
    />
  );
}
