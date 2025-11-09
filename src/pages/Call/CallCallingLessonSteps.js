const steps = [
  { id: 1, title: '번호 입력 및 발신', instruction: '전화번호를 입력하고 발신 버튼을 눌러보세요.', focusAreas:[{x:10,y:26,w:80,h:8}], speak: '번호를 입력하고 발신 버튼을 눌러 전화를 걸어보세요.' },
  { id: 2, title: '통화 연결 확인 및 종료', instruction: '상대가 응답했는지 확인하고 통화를 종료해보세요.', focusAreas:[{x:12,y:38,w:76,h:8}], speak: '상대와 통화가 연결되면 간단히 인사하고 통화를 종료해보세요.' },
  { id: 3, title: '종료 확인', instruction: '통화 종료 버튼을 눌르면 다시 걸 수 있는 화면으로 돌아와요.', speak: '초기 화면으로 돌아왔어요. 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?', focusAreas:[{x:6,y:48,w:88,h:10,pill:true}], completionSpeak: '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?' }
];
export default steps;
