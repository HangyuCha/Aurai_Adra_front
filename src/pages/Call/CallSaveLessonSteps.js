const steps = [
  { id: 1, title: '새 연락처 추가', instruction: '새 연락처를 추가하는 버튼을 찾아 눌러보세요.', focusAreas:[{x:10,y:26,w:80,h:8}], speak: '새 연락처 추가 버튼을 눌러 정보를 입력해보세요.' },
  { id: 2, title: '이름과 번호 입력', instruction: '이름과 전화번호를 정확히 입력하고 저장하세요.', focusAreas:[{x:12,y:38,w:76,h:8}], speak: '이름과 번호를 입력한 뒤 저장 버튼을 눌러보세요.' },
  { id: 3, title: '저장 확인', instruction: '저장된 연락처를 확인하고 목록에 나타나는지 확인하세요.', focusAreas:[{x:6,y:48,w:88,h:10,pill:true}], completionSpeak: '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?' }
];
export default steps;
