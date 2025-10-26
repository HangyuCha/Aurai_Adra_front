import React from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './CallEndingLessonSteps.js';

export default function CallEndingLesson(){
  return <GenericLesson steps={steps} backPath="/call/learn" headerTitle="통화 마무리" headerTagline="감사 인사와 자연스러운 종료 멘트" donePath="/call/learn" />;
}
