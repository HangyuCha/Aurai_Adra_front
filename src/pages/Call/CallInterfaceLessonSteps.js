const steps = [
  {
    id: 1,
    title: '수신된 전화 화면 확인',
    instruction: '받은 전화를 확인하고 화면을 눌러보세요.',
    focusAreas: [ { x: 7, y: 23, w: 72, h: 7.2 } ],
    speak: '전화가 왔습니다. 화면을 눌러보세요.'
  },
  {
    id: 2,
    title: '발신자 정보 확인',
    instruction: '발신자의 정보를 확인하고 다음 단계로 진행하세요.',
    focusAreas: [ { x: 32, y: 34.4, w: 60, h: 7 } ],
    speak: '발신자 이름과 번호를 확인해보세요.'
  },
  {
    id: 3,
    title: '통화 종료 연습',
    instruction: '통화 버튼을 눌러 통화를 종료해 보세요.',
    focusAreas: [ { x: 4, y: 45, w: 92, h: 10, pill: true } ],
    speak: '통화 버튼을 눌러 통화를 종료해 보세요.',
    completionSpeak: '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?'
  }
];

export default steps;
