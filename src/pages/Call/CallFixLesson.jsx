import React from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './CallFixLessonSteps.js';

export default function CallFixLesson(){
  return <GenericLesson steps={steps} backPath="/call/learn" headerTitle="연락처 수정하기" headerTagline="기존 연락처의 정보를 수정하는 방법을 배워요." donePath="/call/learn" chapterId={9} />;
}
