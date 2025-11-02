import React, { useState } from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './KakaoSettingLessonSteps.js';
import kreser1 from '../../assets/kreser1.png';
import kreser2 from '../../assets/kreser2.png';
import kreser3 from '../../assets/kreser3.png';
import kreser4 from '../../assets/kreser4.png';
import kreser5 from '../../assets/kreser5.png';
import kreser6 from '../../assets/kreser6.png';

export default function KakaoSettingLesson() {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateStage, setDateStage] = useState('date'); // 'date' or 'time'
  const [selectedDate, setSelectedDate] = useState(''); // 'YYYY-MM-DD'
  const [selectedMeridiem, setSelectedMeridiem] = useState(''); // '오전' | '오후'
  const [selectedHour, setSelectedHour] = useState(''); // '1'..'12'
  const [selectedMinute, setSelectedMinute] = useState(''); // '00'..'59'
  const [selectedDateTime, setSelectedDateTime] = useState(''); // 'YYYY-MM-DD HH:MM'

  function openCalendar() {
    setCalendarOpen(true);
    setDateStage('date');
  }

  // 12시간 형식(오전/오후, 시, 분)을 24시간 형식(HH:MM)으로 변환하고 저장합니다.
  function composeAndClose(mer, hourStr, minuteStr) {
    let h = parseInt(hourStr || '12', 10);
    const m = parseInt(minuteStr || '0', 10);
    if (Number.isNaN(h) || Number.isNaN(m)) return;
    if (mer === '오후' && h < 12) h += 12;
    if (mer === '오전' && h === 12) h = 0; // 오전 12시는 0시
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    if (selectedDate) setSelectedDateTime(`${selectedDate} ${hh}:${mm}`);
    setCalendarOpen(false);
    setDateStage('date');
  }

  // 'YYYY-MM-DD HH:MM' 형식을 'YYYY.MM.DD.요일 오전/오후 H시:MM분' 형식으로 변환합니다.
  function formatKoreanDateTime(dtStr) {
    if (!dtStr) return '';
    const parts = dtStr.split(' ');
    if (parts.length < 2) return dtStr;
    const [datePart, timePart] = parts;
    const [y, mo, d] = datePart.split('-').map(s => parseInt(s, 10));
    const [hh, mm] = timePart.split(':').map(s => parseInt(s, 10));
    const dt = new Date(y, mo - 1, d, hh, mm); // 월은 0부터 시작하므로 mo - 1
    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const wk = weekdays[dt.getDay()];
    const mer = hh >= 12 ? '오후' : '오전';
    let hour12 = hh % 12;
    if (hour12 === 0) hour12 = 12; // 0시(오전 12시)와 12시(오후 12시) 처리
    return `${y}.${String(mo).padStart(2, '0')}.${String(d).padStart(2, '0')}.${wk} ${mer} ${hour12}시:${String(mm).padStart(2, '0')}분`;
  }

  // 날짜/시간 선택을 위한 팝업 오버레이 및 선택된 날짜/시간 텍스트(단일 라인)
  const extraOverlay = (
    <>
      {calendarOpen ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: '60%',
            top: '60%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            background: '#fff',
            padding: 8,
            borderRadius: 8,
            boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
            width: 240
          }}
        >
          {dateStage === 'date' ? (
            // 날짜 선택 단계
            <div style={{ padding: 6 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#333', marginBottom: 6 }}>예약 날짜 선택</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="date"
                  value={selectedDate || ''}
                  onChange={(e) => { setSelectedDate(e.target.value); /* don't auto-advance to time; allow calendar arrow navigation to change visible month */ }}
                  style={{ fontSize: '14px', padding: '6px 8px', flex: 1 }}
                />
                <button type="button" disabled={!selectedDate} onClick={() => { if(selectedDate) setDateStage('time'); }} style={{ padding: '6px 10px', fontSize: 13 }}>시간 선택</button>
              </div>
              <div style={{ marginTop: 8, textAlign: 'right' }}>
                <button type="button" onClick={() => { setCalendarOpen(false); setDateStage('date'); }} style={{ padding: '6px 10px', fontSize: 13 }}>닫기</button>
              </div>
            </div>
          ) : (
            // 시간 선택 단계
            <div style={{ padding: 6 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#333', marginBottom: 6 }}>예약 시간 선택</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select value={selectedMeridiem} onChange={(e) => setSelectedMeridiem(e.target.value)} style={{ padding: '6px 8px' }}>
                  <option value="">AM/PM</option>
                  <option value="오전">오전</option>
                  <option value="오후">오후</option>
                </select>
                <select value={selectedHour} onChange={(e) => setSelectedHour(e.target.value)} style={{ padding: '6px 8px' }}>
                  <option value="">시</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                    <option key={h} value={String(h)}>{h}</option>
                  ))}
                </select>
                <select value={selectedMinute} onChange={(e) => setSelectedMinute(e.target.value)} style={{ padding: '6px 8px' }}>
                  <option value="">분</option>
                  {Array.from({ length: 60 }, (_, i) => i).map(m => (
                    <option key={m} value={String(m).padStart(2, '0')}>{String(m).padStart(2, '0')}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => { setSelectedMeridiem(''); setSelectedHour(''); setSelectedMinute(''); setDateStage('date'); }} style={{ marginRight: 8, padding: '6px 10px', fontSize: 13 }}>뒤로</button>
                <button type="button" onClick={() => { composeAndClose(selectedMeridiem || '오전', selectedHour || '12', selectedMinute || '00'); }} style={{ padding: '6px 10px', fontSize: 13 }}>확인</button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* 선택된 날짜/시간을 이미지(kreser6) 위에 한 줄로 표시 (step 4에서만) */}
  {selectedDateTime ? (
        <div aria-hidden style={{ position: 'absolute', left: '33%', top: '94.2%', transform: 'translate(-50%, -50%)', zIndex: 4, pointerEvents: 'none', width: '60%', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: 6, fontSize: 12, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {formatKoreanDateTime(selectedDateTime)}
          </div>
        </div>
      ) : null}
    </>
  );

  return (
    <GenericLesson
      steps={steps}
      backPath="/kakao/learn"
      headerTitle="예약 메시지 보내기"
      headerTagline="원하는 시간과 날짜를 지정하여 메시지를 작성하고, 자동으로 발송되는 기능까지 완벽하게 예약하고 취소하는 과정을 연습합니다."
      donePath="/kakao/learn"
      images={{ screenshot1: kreser3, screenshot2: kreser1, screenshot3: kreser2, screens: { 1: kreser1, 2: kreser2, 3: kreser3, 4: kreser5 } }}
      showSubmittedBubble={false}

      imageOverlayConfig={{
        3: { src: kreser4, x: '45%', y: '65%', width: '90%', transform: 'translate(-50%, -48%)', zIndex: 1, opacity: 1 },
        // show kreser6 on step 4 only when a date/time has been selected
        ...(selectedDateTime ? { 4: { src: kreser6, x: '34%', y: '93.5%', width: '60%', transform: 'translate(-50%, -50%)', zIndex: 2, opacity: 1 } } : {})
      }}

      textOverlayConfig={{
        3: { x: '40%', y: '20%', width: '72%', fontSize: '14px', color: '#111', textAlign: 'left', zIndex: 2, whiteSpace: 'pre-wrap' },
        // For step 4 we omit an explicit `value` so GenericLesson will fall back
        // to its internal `submittedText` (the message the user composed on step 3),
        // ensuring the message appears in the same position on step 4.
        4: { x: '32%', y: '22%', width: '60%', fontSize: '14px', color: '#0f172a', textAlign: 'left', zIndex: 3, whiteSpace: 'nowrap' }
      }}

      tapHintConfig={{
        1: { selector: null, x: '7%', y: '86%', width: '26px', height: '24px', borderRadius: '10px', suppressInitial: true, ariaLabel: '더하기 버튼 힌트', offsetY: -20 },
        2: { selector: null, x: '49%', y: '74%', width: '35px', height: '35px', borderRadius: '10px', suppressInitial: true, ariaLabel: '예약 메시지 버튼 힌트', offsetY: -20.5 },
        3: { selector: null, x: '90.1%', y: '85%', width: '25px', height: '25px', borderRadius: '15px', suppressInitial: false, ariaLabel: '예약 전송 힌트', offsetY: 142 },
        4: {
          selector: null,
          x: '80%', y: '85%', width: '190px', height: '28px', borderRadius: '10px', suppressInitial: false,
          ariaLabel: '예약 완료 힌트', offsetY: -37, offsetX: -120, onActivate: openCalendar,
          hidden: Boolean(selectedDateTime),
          inner: selectedDateTime ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'none' }}>
              <img src={kreser6} alt="kreser6" style={{ height: 32, width: 32, objectFit: 'cover', borderRadius: 6 }} />
              <div style={{ fontSize: 12, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span style={{ marginRight: 6 }}>🕒</span>
                {formatKoreanDateTime(selectedDateTime)}
              </div>
            </div>
          ) : null
        }
      }}

      extraOverlay={extraOverlay}
    />
  );
}