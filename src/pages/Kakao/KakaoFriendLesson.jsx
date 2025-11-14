import React from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './kakaofriendlessonsteps.js';
import kaddid from '../../assets/kaddid.png';
import kaddid1 from '../../assets/kaddid1.png';
import kaddid2 from '../../assets/kaddid2.png';
import kaddid3 from '../../assets/kaddid3.png';
import kaddid4 from '../../assets/kaddid4.png';
import kaddid5 from '../../assets/kaddid5.png';

export default function KakaoFriendLesson(){
  const images = { screens: { 1: kaddid, 2: kaddid1, 3: kaddid2, 4: kaddid3, 5: kaddid4, 6: kaddid5 } };
    // make the TapHint on step 1 a bit smaller and keep the vertical nudge
    // also ensure the TapHint is visible on step 3 (explicit override)
    const tapHintConfig = {
      1: { offsetY: 335, offsetX: 60, width: '40px', height: '40px' }, 
      2: { offsetY: 295, offsetX: 35, width: '60px', height: '50px' },
      3: { hidden: false, width: '280px', height: '30px', offsetY: 300, offsetX: 0, suppressInitial: false },
      // set selector: null so TapHint doesn't size itself to the target element
      // (TapHint uses the target's bounding rect when `selector` is present)
        4: { hidden: false, selector: null, width: '50px', height: '40px', offsetY: -34, offsetX: 107, borderRadius: '12px', suppressInitial: false },
      // ensure step 5 tap hint doesn't size itself to a missing selector; force explicit size/position
      5: { selector: null, offsetY: 162, offsetX: 60, width: '130px', height: '40px', suppressInitial: false }
    };
    // render submitted text as a plain overlay on step 5 (no green bubble)
    const textOverlayConfig = {
      5: {
        // show the text typed in step 4 (capture from forceKeyboard step)
        valueFromStep: 4,
        x: '-4%',
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

    // dynamic overlay: show a blinking input caret (and live text) on step 4
    const extraOverlay = ({ step, current, answer, composePreview }) => {
      if (step !== 4) return null;
      const area = (current && current.focusAreas && current.focusAreas[0]) || null;
      // Slightly move left and up from the previous position
      const left = area ? `${area.x + -3}%` : '12%';
      const top = area ? `${area.y + (area.h ? area.h / 2 : 0) - 40}%` : '49%';
      const value = (answer || '') + (composePreview ? composePreview() : '');
      return (
        <>
          <style>{`@keyframes kakaoCaretBlink { 0% { opacity: 1 } 50% { opacity: 0 } 100% { opacity: 1 } }`}</style>
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left,
              top,
              transform: 'translate(0, -50%)',
              maxWidth: '72%',
              color: '#111',
              fontSize: '13px',
              fontWeight: 400,
              lineHeight: '1.2',
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              pointerEvents: 'none',
              zIndex: 200,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <div style={{ display: 'inline-block' }}>{value}</div>
            <div style={{ width: 2, height: 20, background: '#111', borderRadius: 1, animation: 'kakaoCaretBlink 1s steps(1) infinite' }} />
          </div>
        </>
      );
    };

  return <GenericLesson steps={steps} images={images} tapHintConfig={tapHintConfig} textOverlayConfig={textOverlayConfig} extraOverlay={extraOverlay} backPath="/kakao/learn" headerTitle="친구 추가하기 (아이디)" headerTagline="친구를 아이디로 추가하는 방법을 연습합니다." donePath="/kakao/learn" showSubmittedBubble={false} />;
}
