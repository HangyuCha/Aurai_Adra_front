import React from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './KakaoSettingLessonSteps.js';
import kreser1 from '../../assets/kreser1.png';
import kreser2 from '../../assets/kreser2.png';
import kreser3 from '../../assets/kreser3.png';

export default function KakaoSettingLesson(){
  console.log('[KakaoSettingLesson] render');
  return (
    <GenericLesson
      steps={steps}
      backPath="/kakao/learn"
      headerTitle="예약 메시지 보내기"
      headerTagline="원하는 시간과 날짜를 지정하여 메시지를 작성하고, 자동으로 발송되는 기능까지 완벽하게 예약하고 취소하는 과정을 연습합니다."
      donePath="/kakao/learn"
  images={{ screenshot1: kreser3, screenshot2: kreser1, screenshot3: kreser2 }}
      tapHintConfig={{
        // step 1: position the hint at the left-bottom "+" button area
        // moved down by ~100px via negative offsetY (TapHint subtracts offsetY)
        1: {
          // no selector — use explicit coordinates (percent of PhoneFrame overlay)
          // ensure selector is falsy so TapHint uses the explicit x/y fallback
          selector: null,
          x: '7%',
          y: '86%',
          width: '26px',
          height: '24px',
          borderRadius: '10px',
          suppressInitial: true,
          ariaLabel: '더하기 버튼 힌트',
          offsetY: -20
        }
        ,
        2: {
          // nudge step 2 hint up by ~15px relative to GenericLesson default
          selector: null,
          x: '49%',
          y: '74%',
          width: '33px',
          height: '35px',
          borderRadius: '10px',
          suppressInitial: true,
          ariaLabel: '더하기 버튼 힌트',
          offsetY: -20
        }
      }}
    />
  );
}
