const steps = [
  { id: 1, title: '방 만들기', instruction: '오픈채팅/단체방을 만드는 방법을 확인하세요.', focusAreas:[{x:8,y:24,w:84,h:8}], speak: '방을 만드는 방법을 확인해봅시다.' },
  { id: 2, title: '초대와 설정', instruction: '사람 초대와 방 설정을 살펴보세요.', focusAreas:[{x:10,y:36,w:80,h:8}], speak: '초대와 설정 옵션을 확인해보세요.' },
  { id: 3, title: '채팅 참여', instruction: '방에 참여해 메시지를 보내보세요.', focusAreas:[{x:6,y:46,w:88,h:10,pill:true}], speak: '방에서 인사하고 참여해보세요.', completionSpeak: '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?' }
];
export default steps;
