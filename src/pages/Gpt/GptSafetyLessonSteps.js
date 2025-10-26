const steps = [
  { id: 1, title: '민감정보 주의', instruction: '개인정보를 주지 않는 연습을 해보세요.', focusAreas:[{x:8,y:24,w:84,h:8}], speak: '개인정보는 입력하지 않는 것이 안전합니다.' },
  { id: 2, title: '위법/유해 내용 회피', instruction: '모델에 요청하면 안되는 내용을 확인하세요.', focusAreas:[{x:10,y:36,w:80,h:8}], speak: '민감하거나 불법적인 요청은 피해야 합니다.' },
  { id: 3, title: '출처 확인 습관', instruction: '결과의 출처와 신뢰도를 확인해보세요.', focusAreas:[{x:6,y:46,w:88,h:10,pill:true}], speak: '출처를 확인하는 습관을 들이면 안전합니다.', completionSpeak: '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?' }
];
export default steps;
