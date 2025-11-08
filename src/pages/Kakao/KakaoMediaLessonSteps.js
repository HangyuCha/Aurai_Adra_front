const steps = [
  {
    id: 1,
    title: "수신된 메시지 확인하고, 더하기 버튼 누르기",
    instruction: "수신된 문자함을 열어 왼쪽 하단의 더하기 버튼을 누릅니다.",
    focusAreas: [{ x: 8, y: 24, w: 84, h: 8 }],
    speak: "앨범을 확인하기 위해 왼쪽 하단의 더하기 버튼을 눌러보세요.",
  },
  {
    id: 2,
    title: "앨범 누르기",
    instruction: "앨범을 눌러보세요.",
    focusAreas: [{ x: 10, y: 36, w: 80, h: 8 }],
    speak: "앨범을 찾고 눌러보세요.",
  },
  {
    id: 3,
    title: "사진 선택하기",
    instruction: "전송할 사진을 선택해보세요.",
    focusAreas: [{ x: 6, y: 46, w: 88, h: 10, pill: true }],
    speak: "전송할 사진을 선택하기 위해 파란색 버튼을 눌러보세요.",
  },
  {
    id: 4,
    title: "사진 중복 선택하기",
    instruction: "여러 장의 사진을 선택해 묶어 보내는 방법을 확인하세요.",
    focusAreas: [{ x: 6, y: 30, w: 88, h: 40 }],
    speak: "여러 장을 선택해 묶어 보내기 위해 파란색 버튼을 눌러보세요.",
  },
  {
    id: 5,
    title: "묶어 전송 옵션",
    instruction: "전송 버튼을 눌러보세요.",
    focusAreas: [{ x: 6, y: 30, w: 88, h: 40 }],
    speak: "묶어 전송하기 위해 전송 버튼을 눌러보세요.",
  },
  {
    id: 6,
    title: "묶어 보내기 완료",
    instruction: "사진 묶어 보내기에 성공하셨어요.",
    focusAreas: [{ x: 6, y: 30, w: 88, h: 40 }],
    speak:
      "사진 묶어 보내기에 성공하셨어요. 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?",
  },
];
export default steps;
