import React from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './KakaoRoomLessonSteps.js';

export default function KakaoRoomLesson(){
  return <GenericLesson steps={steps} backPath="/kakao/learn" headerTitle="오픈채팅 & 단체방" headerTagline="방 만들기와 초대 기본을 익혀요." donePath="/kakao/learn" />;
}
