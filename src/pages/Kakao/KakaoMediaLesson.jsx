import React from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './KakaoMediaLessonSteps.js';

export default function KakaoMediaLesson(){
  return <GenericLesson steps={steps} backPath="/kakao/learn" headerTitle="사진/파일 보내기" headerTagline="사진과 파일 전송, 삭제 흐름을 익혀요." donePath="/kakao/learn" />;
}
