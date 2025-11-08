import React from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './KakaoFriendNumLessonSteps.js';
import kaddnum1 from '../../assets/kaddnum1.png';
import kaddid1 from '../../assets/kaddid1.png';
import kaddnum2 from '../../assets/kaddnum2.png';
import kaddnum3 from '../../assets/kaddnum3.png';
import kaddnum5 from '../../assets/kaddnum5.png';

export default function KakaoFriendNumLesson(){
  const images = { screens: { 1: kaddnum1, 2: kaddid1, 3: kaddnum2, 4: kaddnum2, 5: kaddnum3, 6: kaddnum3, 7: kaddnum5 } };
  const tapHintConfig = {
    1: { offsetY: 335, offsetX: 60, width: '40px', height: '40px' }, 
    2: { offsetY: 293, offsetX: -35, width: '60px', height: '50px' },
    3: { hidden: false, width: '280px', height: '30px', offsetY: 305, offsetX: 0, suppressInitial: false },
    4: { hidden: false, selector: null, width: '25px', height: '25px', offsetY: 120, offsetX: 111, borderRadius: '50px', suppressInitial: false },
    5: { selector: null, offsetY: 270, offsetX: 30, width: '200px', height: '40px', suppressInitial: false },
    6: { selector: null, x: '50%', y: '70%', offsetY: 75, offsetX: 112, width: '25px', height: '25px', borderRadius: '50px', suppressInitial: false }
  };

  const textOverlayConfig = {
    5: {
      x: '-3%',
      y: '13%',
      transform: 'translate(-50%, -50%)',
      width: '40%',
      color: '#111',
      fontSize: '13px',
      fontWeight: 400,
      textAlign: 'right',
      whiteSpace: 'pre-wrap',
      zIndex: 3
    },
    6: {
      x: '-3%',
      y: '13%',
      transform: 'translate(-50%, -50%)',
      width: '40%',
      color: '#111',
      fontSize: '13px',
      fontWeight: 400,
      textAlign: 'right',
      whiteSpace: 'pre-wrap',
      zIndex: 3
    },
    7: {
      // show the text that was submitted on step 4 (not step 6)
      valueFromStep: 4,
      x: '35%',
      y: '50%',
      transform: 'translate(-50%, -50%)',
      width: '40%',
      color: '#111',
      fontSize: '13px',
      fontWeight: 400,
      textAlign: 'right',
      whiteSpace: 'pre-wrap',
      zIndex: 3
    }
  };

  return (
    <GenericLesson
      steps={steps}
      images={images}
      tapHintConfig={tapHintConfig}
      textOverlayConfig={textOverlayConfig}
      backPath="/kakao/learn"
      headerTitle="친구 추가하기 (전화번호)"
      headerTagline="친구를 전화번호로 추가하는 방법을 연습합니다."
      donePath="/kakao/learn"
      showSubmittedBubble={false}
    />
  );
}
