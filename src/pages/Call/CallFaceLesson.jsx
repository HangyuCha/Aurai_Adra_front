import React from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './CallFaceLessonSteps.js';

export default function CallFaceLesson(){
  return <GenericLesson steps={steps} backPath="/call/learn" headerTitle="영상통화 하기" headerTagline="영상통화 시작과 화면 전환을 연습해요." donePath="/call/learn" chapterId={14} />;
}
