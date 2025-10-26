import React from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './GptFollowLessonSteps.js';

export default function GptFollowLesson(){
  return <GenericLesson steps={steps} backPath="/gpt/learn" headerTitle="대화 이어가기" headerTagline="후속 질문과 맥락 유지 요령" donePath="/gpt/learn" />;
}
