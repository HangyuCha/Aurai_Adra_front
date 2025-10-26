const steps = [
  { id: 1, title: '맥락 유지하기', instruction: '대화의 맥락을 이어가는 방법을 확인하세요.', focusAreas:[{x:8,y:24,w:84,h:8}], speak: '맥락을 잘 유지하면 더 자연스러운 대화가 됩니다.' },
  { id: 2, title: '후속 질문 만들기', instruction: '추가 질문을 어떻게 이어갈지 연습합니다.', focusAreas:[{x:10,y:36,w:80,h:8}], speak: '후속 질문은 구체적일수록 좋아요.' },
  { id: 3, title: '요약으로 맥락 정리', instruction: '간단히 요약해 맥락을 정리하는 연습을 합니다.', focusAreas:[{x:6,y:46,w:88,h:10,pill:true}], speak: '요약을 통해 대화를 깔끔하게 이어갈 수 있어요.', completionSpeak: '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?' }
];
export default steps;
