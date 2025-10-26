const steps = [
  {
    id: 1,
    title: '대화 목록 살펴보기',
    instruction: '대화 목록을 확인하고 원하는 대화를 선택해보세요.',
    focusAreas: [ { x: 7, y: 23, w: 72, h: 7.2 } ],
    speak: '대화를 선택해보세요.'
  },
  {
    id: 2,
    title: '채팅 확인',
    instruction: '선택한 대화의 메시지를 확인하세요.',
    focusAreas: [ { x: 32, y: 34.4, w: 60, h: 7 } ],
    speak: '메시지 내용을 확인해보세요.'
  },
  {
    id: 3,
    title: '메시지 보내기 연습',
    instruction: '입력창에 메시지를 입력하고 전송해보세요.',
    focusAreas: [ { x: 4, y: 45, w: 92, h: 10, pill: true } ],
    speak: '메시지를 입력하고 전송 버튼을 눌러보세요.',
    completionSpeak: '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?'
  }
];

export default steps;
