// SmsMdeliverLesson step definitions (placeholder)
const steps = [
  {
    id: 1,
    title: '전달할 메시지 선택',
    instruction: '전달하려는 메시지를 선택하세요.',
    focusAreas: [ { x: 10, y: 30, w: 80, h: 8 } ],
    speak: '전달하려는 메시지를 길게 누르거나 메뉴에서 전달을 선택하세요.'
  },
  {
    id: 2,
    title: '수신자 선택',
    instruction: '전달할 상대를 선택하거나 검색하여 선택합니다.',
    focusAreas: [ { x: 12, y: 42, w: 76, h: 10 } ],
    speak: '전달할 상대를 선택하고 확인 버튼을 눌러보세요.'
  },
  {
    id: 3,
    title: '메시지 전달 연습',
    instruction: '선택한 상대에게 전달 버튼을 눌러 메시지를 전달합니다.',
    focusAreas: [ { x: 70, y: 78, w: 22, h: 12, pill: true } ],
    speak: '전달을 누르면 메시지가 전달됩니다.',
    completionSpeak: '전달이 완료되었습니다.'
  }
];

export default steps;
