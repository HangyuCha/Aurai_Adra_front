const steps = [
  { id: 1, title: '연락처 선택', instruction: '수정할 연락처를 찾아 선택해보세요.', focusAreas:[{x:8,y:24,w:84,h:8}], speak: '수정할 연락처를 선택해보세요.' },
  { id: 2, title: '정보 수정', instruction: '연락처의 이름이나 번호를 수정해보세요.', focusAreas:[{x:10,y:36,w:80,h:8}], speak: '필요한 정보를 수정하고 저장해보세요.' },
  { id: 3, title: '변경사항 확인', instruction: '수정된 내용이 목록에 반영되었는지 확인하세요.', focusAreas:[{x:6,y:46,w:88,h:10,pill:true}], completionSpeak: '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?' }
];
export default steps;
