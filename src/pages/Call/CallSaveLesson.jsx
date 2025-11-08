import React from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './CallSaveLessonSteps.js';

export default function CallSaveLesson(){
  return <GenericLesson steps={steps} backPath="/call/learn" headerTitle="연락처 저장하기" headerTagline="새 연락처를 추가하고 저장하는 방법을 배워요." donePath="/call/learn" chapterId={7} />;
}
