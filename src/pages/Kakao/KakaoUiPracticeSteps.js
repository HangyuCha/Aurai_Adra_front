const steps = [
  {
    id: 1,
    title: "대화 내용 살펴보기",
    instruction: "대화 내용을 확인하고 더하기 버튼을 눌러보세요.",
    focusAreas: [{ x: 7, y: 23, w: 72, h: 7.2 }],
    speak: "더하기 버튼을 눌러보세요.",
  },
  {
    id: 2,
    title: "이모티콘 선택하기",
    instruction: "보내고 싶은 이모티콘을 선택해보세요.",
    focusAreas: [{ x: 32, y: 34.4, w: 60, h: 7 }],
    speak: "이모티콘을 선택해보세요.",
  },
  {
    id: 3,
    title: "이모티콘 전송하기",
    instruction: "전송 버튼을 눌러보세요.",
    focusAreas: [{ x: 4, y: 45, w: 92, h: 10, pill: true }],
    speak: "전송 버튼을 눌러 보내고 싶은 이모티콘을 보내보세요.",
    completionSpeak:
      "잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?",
  },
];

export default steps;
