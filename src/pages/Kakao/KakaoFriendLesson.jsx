import React from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './KakaoFriendLessonSteps.js';
import kaddid from '../../assets/kaddid.png';
import kaddid1 from '../../assets/kaddid1.png';
import kaddid2 from '../../assets/kaddid2.png';
import kaddid3 from '../../assets/kaddid3.png';
import kaddid4 from '../../assets/kaddid4.png';

export default function KakaoFriendLesson(){
  const images = { screens: { 1: kaddid, 2: kaddid1, 3: kaddid2, 4: kaddid3, 5: kaddid4 } };
    // make the TapHint on step 1 a bit smaller and keep the vertical nudge
    // also ensure the TapHint is visible on step 3 (explicit override)
    const tapHintConfig = {
      1: { offsetY: 335, offsetX: 60, width: '40px', height: '40px' }, 
      2: { offsetY: 295, offsetX: 35, width: '60px', height: '50px' },
      3: { hidden: false, width: '280px', height: '30px', offsetY: 300, offsetX: 0, suppressInitial: false },
      // set selector: null so TapHint doesn't size itself to the target element
      // (TapHint uses the target's bounding rect when `selector` is present)
      4: { hidden: false, selector: null, width: '25px', height: '25px', offsetY: 120, offsetX: 111, borderRadius: '50px', suppressInitial: false },
      // ensure step 5 tap hint doesn't size itself to a missing selector; force explicit size/position
      5: { selector: null, offsetY: 162, offsetX: 60, width: '130px', height: '40px', suppressInitial: false }
    };
    // render submitted text as a plain overlay on step 5 (no green bubble)
    const textOverlayConfig = {
      5: {
        // place near the right side of the phone screen where the bubble was
        x: '-2%',
        y: '12%',
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

    return <GenericLesson steps={steps} images={images} tapHintConfig={tapHintConfig} textOverlayConfig={textOverlayConfig} backPath="/kakao/learn" headerTitle="친구 추가/관리" headerTagline="친구를 추가하고 관리하는 방법을 배워요." donePath="/kakao/learn" showSubmittedBubble={false} />;
}
