const steps = [
  {
    id: 1,
    title: 'GPT 인터페이스 확인',
    instruction: 'GPT 대화창을 확인하고 입력창을 눌러보세요.',
    focusAreas: [ { x: 7, y: 23, w: 72, h: 7.2 } ],
    speak: 'GPT에게 물어볼 질문을 입력해보세요.'
  },
  {
    id: 2,
    title: '답변 확인하기',
    instruction: 'GPT의 답변을 확인하고 다음으로 넘어가세요.',
    focusAreas: [ { x: 32, y: 34.4, w: 60, h: 7 } ],
    speak: 'GPT가 어떻게 답하는지 확인해보세요.'
  },
  {
    id: 3,
    title: '요청 보내기',
    instruction: '입력창에 질문을 쓰고 전송 버튼을 눌러보세요.',
    focusAreas: [ { x: 4, y: 45, w: 92, h: 10, pill: true } ],
    speak: '질문을 입력하고 전송 버튼을 눌러보세요.',
    completionSpeak: '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?'
  }
];

export default steps;
