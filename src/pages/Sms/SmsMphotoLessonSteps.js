// SmsMphotoLesson step definitions (placeholder)
// Edit the instructions, focusAreas, and speak/completionSpeak later as needed.

const steps = [
  {
    id: 1,
    title: "사진 선택하기",
    instruction: "사진을 첨부하려면 클립(또는 사진) 버튼을 눌러보세요.",
    focusAreas: [{ x: 80, y: 86, w: 14, h: 8 }],
    speak: "사진을 보내려면 클립 아이콘을 눌러 사진을 선택하세요.",
  },
  {
    id: 2,
    title: "사진 고르기",
    instruction: "보낼 사진을 골라 확인 버튼을 눌러 메시지에 첨부합니다.",
    focusAreas: [{ x: 12, y: 35, w: 76, h: 40 }],
    speak: "갤러리에서 보내고 싶은 사진을 선택하세요.",
  },
  {
    id: 3,
    title: "사진 전송 연습",
    instruction: "사진이 첨부되면 전송 버튼을 눌러 상대에게 보냅니다.",
    focusAreas: [{ x: 70, y: 78, w: 22, h: 12, pill: true }],
    speak: "사진이 첨부되면 전송 버튼을 눌러 보내보세요.",
    completionSpeak: "잘하셨어요! 사진을 보냈습니다.",
  },
  {
    id: 4,
    title: "사진 전송 완료",
    instruction:
      "사진이 성공적으로 전송되었습니다! 아래 완료 버튼을 눌러주세요.",
    focusAreas: [{ x: 50, y: 90, w: 40, h: 8 }],
    speak: "사진이 성공적으로 전송되었습니다. 완료 버튼을 눌러주세요.",
    completionSpeak: "사진 전송이 완료되었습니다!",
  },
];

export default steps;
