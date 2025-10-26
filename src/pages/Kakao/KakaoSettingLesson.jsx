import React from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './KakaoSettingLessonSteps.js';

export default function KakaoSettingLesson(){
  return <GenericLesson steps={steps} backPath="/kakao/learn" headerTitle="알림/환경 설정" headerTagline="알림, 프라이버시, 환경 옵션을 확인해요." donePath="/kakao/learn" />;
}
