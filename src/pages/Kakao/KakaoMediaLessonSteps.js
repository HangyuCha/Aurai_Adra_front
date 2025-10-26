const steps = [
  { id: 1, title: '사진 전송', instruction: '사진을 선택하고 전송하는 방법을 확인하세요.', focusAreas:[{x:8,y:24,w:84,h:8}], speak: '사진을 보내는 방법을 살펴봅시다.' },
  { id: 2, title: '파일 관리', instruction: '보낸 파일을 재전송/삭제하는 방법을 확인하세요.', focusAreas:[{x:10,y:36,w:80,h:8}], speak: '파일 재전송과 삭제 방법을 연습하세요.' },
  { id: 3, title: '미디어 옵션', instruction: '전송 옵션과 미리보기 기능을 확인해보세요.', focusAreas:[{x:6,y:46,w:88,h:10,pill:true}], speak: '미리보기를 확인하고 전송해보세요.', completionSpeak: '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?' }
];
export default steps;
