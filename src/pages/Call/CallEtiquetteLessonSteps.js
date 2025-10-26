const steps = [
  { id: 1, title: '통화 인사하기', instruction: '간단한 첫 인사 문구를 확인하고 눌러보세요.', focusAreas:[{x:10,y:25,w:80,h:8}], speak: '상대에게 먼저 인사하는 연습을 해봅시다.' },
  { id: 2, title: '명확한 발음', instruction: '천천히 명확하게 말하는 방법을 확인하세요.', focusAreas:[{x:12,y:38,w:76,h:8}], speak: '천천히 말하면 상대가 더 잘 알아들을 수 있어요.' },
  { id: 3, title: '마무리 인사', instruction: '통화를 마칠 때 하는 간단한 인사를 연습합니다.', focusAreas:[{x:6,y:48,w:88,h:10,pill:true}], speak: '마무리 인사를 하고 전화를 끊어봅시다.', completionSpeak: '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?' }
];
export default steps;
