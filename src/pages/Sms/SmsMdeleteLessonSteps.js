// SmsMdeleteLesson step definitions (placeholder)
const steps = [
  {
    id: 1,
    title: "문자 대화방 열기",
    instruction: "아들로부터 온 문자를 확인하려면 대화방을 눌러주세요.",
    focusAreas: [{ x: 80, y: 86, w: 14, h: 8 }],
    speak: "아들로부터 온 문자를 확인하려면 대화방을 눌러주세요.",
  },
  {
    id: 2,
    title: "문자 삭제 시작",
    instruction: "삭제하려는 문자를 선택해주세요.",
    focusAreas: [{ x: 12, y: 35, w: 76, h: 40 }],
    speak: "문자를 삭제하기 위해 깜빡거리는 버튼을 눌러주세요.",
  },
  {
    id: 3,
    title: "삭제 버튼 선택",
    instruction: "삭제 버튼을 눌러주세요.",
    focusAreas: [{ x: 70, y: 78, w: 22, h: 12, pill: true }],
    speak: "문자를 삭제하기 위해 삭제 버튼을 눌러주세요.",
  },
  {
    id: 4,
    title: "삭제 문자 선택",
    instruction: "삭제하려는 문자의 옆의 원을 눌러주세요.",
    focusAreas: [{ x: 50, y: 90, w: 40, h: 8 }],
    speak: "삭제하려는 문자를 선택하기 위해 깜빡거리는 버튼을 눌러주세요.",
  },
  {
    id: 5,
    title: "휴지통 버튼 누르기",
    instruction: "휴지통을 눌러보세요.",
    focusAreas: [{ x: 50, y: 90, w: 40, h: 8 }],
    speak: "휴지통을 눌러 문자를 삭제해 보세요.",
  },
  {
    id: 6,
    title: "삭제 완료",
    instruction: "문자가 성공적으로 삭제되었어요.",
    focusAreas: [{ x: 50, y: 90, w: 40, h: 8 }],
    speak:
      "문자가 성공적으로 삭제되었어요. 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?",
  },
];

export default steps;
