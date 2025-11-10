// SmsMphotoLesson step definitions (placeholder)
// Edit the instructions, focusAreas, and speak/completionSpeak later as needed.

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
    title: "사진 선택하기",
    instruction: "사진을 첨부하려면 클립(또는 사진) 버튼을 눌러보세요.",
    focusAreas: [{ x: 80, y: 86, w: 14, h: 8 }],
    speak: "사진을 보내려면 카메라 버튼을 눌러보세요.",
  },
  {
    id: 3,
    title: "사진 고르기",
    instruction: "보낼 사진을 골라보세요.",
    focusAreas: [{ x: 12, y: 35, w: 76, h: 40 }],
    speak: "갤러리에서 보내고 싶은 사진을 선택하세요.",
  },
  {
    id: 4,
    title: "사진 전송 연습",
    instruction: "사진이 첨부되면 전송 버튼을 눌러 상대에게 보냅니다.",
    focusAreas: [{ x: 70, y: 78, w: 22, h: 12, pill: true }],
    speak: "사진이 첨부되면 전송 버튼을 눌러 보내보세요.",
  },
  {
    id: 5,
    title: "사진 전송 완료",
    instruction:
      "사진이 성공적으로 전송되었습니다! 아래 완료 버튼을 눌러주세요.",
    focusAreas: [{ x: 50, y: 90, w: 40, h: 8 }],
    speak:
      "사진이 성공적으로 전송되었습니다. 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?",
  },
];

export default steps;
