import React, { useMemo } from 'react';
import GenericLesson from '../common/GenericLesson';
import stepsBase from './GptAskLessonSteps.js';
import gptAsk from '../../assets/gptAsk.png';
import gptAsk2 from '../../assets/gptAsk2.png';
import gptAsk3 from '../../assets/gptAsk3.png';
import gptAsk3mp4 from '../../assets/gptAsk3.mp4';

export default function GptAskLesson(){
  // Inject inputPlaceholder for step 2 so GenericLesson shows the keyboard/input bar
  const steps = useMemo(()=> (stepsBase || []).map(s => s.id === 2 ? ({...s, inputPlaceholder: '무엇이든 물어보세요'}) : s), []);
  const images = useMemo(()=> ({ screens: { 1: gptAsk, 2: gptAsk2, 3: gptAsk3 } }), []);
  const videos = useMemo(()=> ({ 3: gptAsk3mp4 }), []);
  const posters = useMemo(()=> ({ 3: gptAsk3 }), []);
  return (
    <GenericLesson
      steps={steps}
      images={images}
      videos={videos}
      posters={posters}
      backPath="/gpt/learn"
      headerTitle="글로 질문하기"
      headerTagline="궁금한 것을 글로 질문하기"
      donePath="/gpt/learn"
      showSubmittedBubble={false}
    />
  );
}
