const steps = [
  { id: 1, title: '마무리 인사 연습', instruction: '감사와 안부로 통화를 마무리하는 문구를 확인하세요.', focusAreas:[{x:8,y:24,w:84,h:8}], speak: '통화 마무리 인사는 자연스럽게 해보세요.' },
  { id: 2, title: '약속 정리', instruction: '다음 약속이나 후속 연락을 정리하는 표현을 연습합니다.', focusAreas:[{x:10,y:36,w:80,h:8}], speak: '다음에 연락하겠습니다 등 약속을 정리해보세요.' },
  { id: 3, title: '안전하게 종료', instruction: '친절하게 통화를 종료하는 방법을 연습합니다.', focusAreas:[{x:6,y:46,w:88,h:10,pill:true}], speak: '좋은 하루 보내세요, 감사합니다 같은 마무리 표현을 사용해보세요.', completionSpeak: '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?' }
];
export default steps;
