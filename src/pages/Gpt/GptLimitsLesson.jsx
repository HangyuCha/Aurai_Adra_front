import React from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './GptLimitsLessonSteps.js';

export default function GptLimitsLesson(){
  return <GenericLesson steps={steps} backPath="/gpt/learn" headerTitle="한계 이해" headerTagline="모델의 한계와 검증 방법" donePath="/gpt/learn" />;
}
