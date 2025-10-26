const steps = [
  { id: 1, title: '모델 한계 이해', instruction: '모델이 틀릴 수 있음을 알아두세요.', focusAreas:[{x:8,y:24,w:84,h:8}], speak: '모델은 항상 정답을 주지 않을 수 있습니다.' },
  { id: 2, title: '정보 검증', instruction: '중요 정보는 외부에서 검증하는 방법을 확인하세요.', focusAreas:[{x:10,y:36,w:80,h:8}], speak: '중요한 결정은 추가 검증이 필요합니다.' },
  { id: 3, title: '피드백 주기', instruction: '응답이 부정확할 때 보완 요청하는 방법을 연습합니다.', focusAreas:[{x:6,y:46,w:88,h:10,pill:true}], speak: '정확도를 높이기 위해 질문을 재작성해보세요.', completionSpeak: '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?' }
];
export default steps;
