const steps = [
  { id: 1, title: '자기소개 준비', instruction: '짧고 또렷한 자기소개 예시를 확인하세요.', focusAreas:[{x:8,y:24,w:84,h:8}], speak: '자기소개는 간단명료하게 하는 것이 좋아요.' },
  { id: 2, title: '이름과 소속 말하기', instruction: '이름과 소속(또는 관계)을 말하는 연습을 해보세요.', focusAreas:[{x:10,y:36,w:80,h:8}], speak: '이름과 소속을 천천히 말해보세요.' },
  { id: 3, title: '질문에 답하기', instruction: '상대의 질문에 간단히 답하는 연습을 합니다.', focusAreas:[{x:6,y:46,w:88,h:10,pill:true}], speak: '질문을 듣고 간단히 답해보세요.', completionSpeak: '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?' }
];
export default steps;
