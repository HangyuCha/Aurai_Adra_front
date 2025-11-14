// SmsMdeliverLesson step definitions (placeholder)
const steps = [
  {
    id: 1,
    title: "전달할 메시지 선택",
    instruction: "전달하려는 메시지를 선택하세요.",
    focusAreas: [{ x: 10, y: 30, w: 80, h: 8 }],
    speak: "전달하려는 메시지를 길게 누르거나 메뉴에서 전달을 선택하세요.",
  },
  {
    id: 2,
    title: "문자 전달 시작",
    instruction: "전달하려는 문자를 선택해주세요.",
    focusAreas: [{ x: 12, y: 42, w: 76, h: 10 }],
    speak: "문자를 전달하기 위해 깜빡거리는 버튼을 눌러주세요.",
  },
  {
    id: 3,
    title: "전달하기 버튼 선택",
    instruction: "전달하기 버튼을 눌러주세요.",
    focusAreas: [{ x: 70, y: 78, w: 22, h: 12, pill: true }],
    speak: "문자를 전달하기 위해 전달하기 버튼을 눌러주세요.",
  },
  {
    id: 4,
    title: "전달 상대 입력",
    instruction: "키보드를 꺼내기 위해 깜빡거리는 버튼을 눌러주세요.",
    focusAreas: [{ x: 70, y: 78, w: 22, h: 12, pill: true }],
    speak: "받는 사람 입력을 위해 키보드를 꺼내보세요.",
  },
  {
    id: 5,
    title: "전달 상대 입력",
    instruction: "전달하려는 수신자를 입력하세요.",
    focusAreas: [{ x: 12, y: 42, w: 76, h: 14 }],
    speak: "상대를 확인한 뒤 깜빡거리는 버튼을 눌러보세요.",
  },
  {
    id: 6,
    title: "전달 상대 선택",
    instruction: "전달하려는 상대를 선택하세요.",
    focusAreas: [{ x: 10, y: 20, w: 80, h: 12 }],
    speak: "전달하려는 상대를 선택하세요.",
  },
  {
    id: 7,
    title: "메시지 보내기",
    instruction: "전달할 메시지를 전송하세요.",
    focusAreas: [{ x: 10, y: 20, w: 80, h: 12 }],
    speak: "메시지를 전달하기 위해 전송 버튼을 눌러보세요.",
  },
  {
    id: 8,
    title: "전달하기 완료",
    instruction: "문자가 성공적으로 전달되었어요.",
    focusAreas: [{ x: 8, y: 18, w: 84, h: 14 }],
    speak:
      "문자가 성공적으로 전달되었어요. 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?",
  },
];

export default steps;
