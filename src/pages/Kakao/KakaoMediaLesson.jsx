import React from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './KakaoMediaLessonSteps.js';
import kreser1 from '../../assets/kreser1.png';
import kreser2 from '../../assets/kreser2.png';

export default function KakaoMediaLesson() {
  const images = { screens: { 1: kreser1, 2: kreser2 } };
  const tapHintConfig = {
    1: { selector: null, x: '6.65%', y: '137.3%', width: '25px', height: '25px', borderRadius: '10px', ariaLabel: '사진 전송 힌트', suppressInitial: false },
    2: { selector: null, x: '0%', y: '54%', width: '35px', height: '35px', borderRadius: '8px', ariaLabel: '파일 관리 힌트', suppressInitial: false },
    3: { selector: null, x: '50%', y: '60%', width: '100px', height: '40px', borderRadius: '10px', ariaLabel: '미디어 옵션 힌트', suppressInitial: false }
  };
  return <GenericLesson steps={steps} images={images} tapHintConfig={tapHintConfig} backPath="/kakao/learn" headerTitle="사진/파일 보내기" headerTagline="사진과 파일 전송, 삭제 흐름을 익혀요." donePath="/kakao/learn" showSubmittedBubble={false} />;
}
