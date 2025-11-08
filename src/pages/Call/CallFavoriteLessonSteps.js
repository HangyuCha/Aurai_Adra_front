const steps = [
  { id: 1, title: '연락처 선택', instruction: '즐겨찾기에 추가할 연락처를 찾아 선택하세요.', focusAreas:[{x:8,y:24,w:84,h:8}], speak: '즐겨찾기에 추가할 연락처를 선택해보세요.' },
  { id: 2, title: '즐겨찾기 추가', instruction: '연락처 화면에서 즐겨찾기 버튼을 눌러 등록해보세요.', focusAreas:[{x:10,y:36,w:80,h:8}], speak: '즐겨찾기 버튼을 눌러 연락처를 등록해보세요.' },
  { id: 3, title: '즐겨찾기 확인', instruction: '즐겨찾기 목록에서 추가된 항목을 확인하세요.', focusAreas:[{x:6,y:46,w:88,h:10,pill:true}], completionSpeak: '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?' }
];
export default steps;
