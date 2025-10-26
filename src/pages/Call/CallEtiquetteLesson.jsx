import React from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './CallEtiquetteLessonSteps.js';

export default function CallEtiquetteLesson(){
  return <GenericLesson steps={steps} backPath="/call/learn" headerTitle="전화 예절" headerTagline="첫 인사와 마무리 멘트를 연습해요." donePath="/call/learn" />;
}
