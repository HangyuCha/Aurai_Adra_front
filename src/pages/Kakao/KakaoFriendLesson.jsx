import React from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './KakaoFriendLessonSteps.js';

export default function KakaoFriendLesson(){
  return <GenericLesson steps={steps} backPath="/kakao/learn" headerTitle="친구 추가/관리" headerTagline="친구를 추가하고 관리하는 방법을 배워요." donePath="/kakao/learn" showSubmittedBubble={false} />;
}
