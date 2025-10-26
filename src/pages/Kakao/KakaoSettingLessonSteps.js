const steps = [
  { id: 1, title: '알림 설정', instruction: '알림 설정을 켜고 끄는 방법을 살펴보세요.', focusAreas:[{x:8,y:24,w:84,h:8}], speak: '알림을 설정하여 원치 않는 알림을 제어해보세요.' },
  { id: 2, title: '프라이버시 옵션', instruction: '숨김/차단 옵션을 확인하세요.', focusAreas:[{x:10,y:36,w:80,h:8}], speak: '차단과 숨김 기능을 확인해보세요.' },
  { id: 3, title: '환경 맞춤 설정', instruction: '테마/글자 크기 등 환경을 조정해보세요.', focusAreas:[{x:6,y:46,w:88,h:10,pill:true}], speak: '환경을 조절하여 더 편리하게 사용해보세요.', completionSpeak: '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?' }
];
export default steps;
