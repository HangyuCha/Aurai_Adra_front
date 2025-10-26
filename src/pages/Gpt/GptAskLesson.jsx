import React from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './GptAskLessonSteps.js';

export default function GptAskLesson(){
  return <GenericLesson steps={steps} backPath="/gpt/learn" headerTitle="질문 잘 하기" headerTagline="명확하고 구체적인 프롬프트 작성법" donePath="/gpt/learn" />;
}
