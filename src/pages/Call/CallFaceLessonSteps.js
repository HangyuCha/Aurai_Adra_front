const steps = [
  { id: 1, title: '영상통화 시작', instruction: '영상통화 버튼을 눌러 상대에게 영상통화를 걸어보세요.', focusAreas:[{x:9,y:26,w:82,h:8}], speak: '영상통화 버튼을 눌러 통화를 시작해보세요.' },
  { id: 2, title: '카메라/마이크 조작', instruction: '카메라 전환과 마이크 끄기/켜기를 연습하세요.', focusAreas:[{x:10,y:38,w:80,h:8}], speak: '카메라를 전환하거나 마이크를 끄고 켜보세요.' },
  { id: 3, title: '통화 종료', instruction: '영상통화를 안전하게 종료하는 방법을 연습합니다.', focusAreas:[{x:6,y:48,w:88,h:10,pill:true}], completionSpeak: '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?' }
];
export default steps;
