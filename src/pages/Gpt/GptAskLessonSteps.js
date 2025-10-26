const steps = [
  { id: 1, title: '질문 구조 이해', instruction: '명확한 질문의 구조를 살펴보세요.', focusAreas:[{x:8,y:24,w:84,h:8}], speak: '좋은 질문을 만드는 법을 배워봅시다.' },
  { id: 2, title: '구체적 예시 만들기', instruction: '맥락과 예시를 넣어 질문을 구체화해보세요.', focusAreas:[{x:10,y:36,w:80,h:8}], speak: '구체적인 예시가 있으면 더 정확한 답을 받습니다.' },
  { id: 3, title: '출력 형식 요청', instruction: '원하는 답변 형식을 요청해보세요 (예: 목록, 표).', focusAreas:[{x:6,y:46,w:88,h:10,pill:true}], speak: '원하는 출력 형식을 알려주면 더 쓸모있는 답변을 얻을 수 있어요.', completionSpeak: '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?' }
];
export default steps;
