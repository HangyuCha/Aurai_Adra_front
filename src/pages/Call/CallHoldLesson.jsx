import React from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './CallHoldLessonSteps.js';

export default function CallHoldLesson(){
  return <GenericLesson steps={steps} backPath="/call/learn" headerTitle="대기/연결 표현" headerTagline="잠시만요, 다시 연결하기 같은 표현을 연습해요." donePath="/call/learn" />;
}
