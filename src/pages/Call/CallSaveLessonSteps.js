const steps = [
  // 1~3단계는 기존 그대로 사용하세요.
  { id: 1, title: '새 연락처 추가', instruction: '새 연락처를 추가하는 버튼을 찾아 눌러보세요.', focusAreas:[{x:10,y:26,w:80,h:8}], speak: '새 연락처 추가 버튼을 눌러 정보를 입력해보세요.' },
  { id: 2, title: '이름과 전화번호 입력', instruction: '이름과 전화번호를 정확히 입력하고 저장하세요.', focusAreas:[{x:12,y:38,w:76,h:8}], speak: '이름과 번호를 입력한 뒤 저장 버튼을 눌러보세요.' },
  { id: 3, title: '이름 입력', instruction: '이름을 작성 후 전화번호를 추가하세요.', focusAreas:[{x:6,y:48,w:88,h:10,pill:true}], forceKeyboard: true, speak: '이름을 입력하고 전화번호 추가 버튼을 눌러주세요.' },

  // 4, 5단계 커스텀: 이 파일에서 title/instruction/speak를 자유롭게 수정할 수 있습니다.
  // 화면(이미지) 개수보다 단계 수가 많을 경우에는 실제 표시 단계는 이미지 개수에 맞춰집니다.
  { id: 4, title: '전화번호 입력', instruction: '전화번호를 입력하고 저장을 완료하세요.', speak: '전화번호를 입력한 뒤 저장 버튼을 눌러 완료해 보세요.' },
  { id: 5, title: '저장 완료 확인', instruction: '저장된 연락처 정보를 확인하고 학습을 마무리하세요.', speak: '이제 연락처가 저장되었습니다.', completionSpeak: '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?' }
];
export default steps;
