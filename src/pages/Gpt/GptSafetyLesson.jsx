import React from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './GptSafetyLessonSteps.js';

export default function GptSafetyLesson(){
  return <GenericLesson steps={steps} backPath="/gpt/learn" headerTitle="안전한 사용" headerTagline="개인정보와 민감정보 주의사항" donePath="/gpt/learn" />;
}
