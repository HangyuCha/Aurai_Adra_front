import React from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './CallIntroLessonSteps.js';

export default function CallIntroLesson(){
  return <GenericLesson steps={steps} backPath="/call/learn" headerTitle="자기소개 말하기" headerTagline="간단하고 또렷하게 자신을 알리는 연습" donePath="/call/learn" />;
}
