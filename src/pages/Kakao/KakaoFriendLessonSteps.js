const steps = [
  { id: 1, title: '친구 추가 방법', instruction: '연락처, QR, 아이디로 친구를 추가하는 방법을 확인하세요.', focusAreas:[{x:8,y:24,w:84,h:8}], speak: '친구 추가 방법을 확인해볼까요.' },
  { id: 2, title: '친구 관리', instruction: '친구 목록에서 차단/숨김 등 관리를 연습합니다.', focusAreas:[{x:10,y:36,w:80,h:8}], speak: '친구를 관리하는 옵션을 살펴보세요.' },
  { id: 3, title: '친구와 대화 시작', instruction: '추가한 친구에게 메시지를 보내보세요.', focusAreas:[{x:6,y:46,w:88,h:10,pill:true}], speak: '친구에게 인사말을 보내보세요.', completionSpeak: '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?' }
];
export default steps;
