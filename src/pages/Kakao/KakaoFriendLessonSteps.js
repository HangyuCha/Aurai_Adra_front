const steps = [
  {
    id: 1,
    title: "친구 추가 버튼 누르기",
    instruction: "아이디로 친구를 추가하는 방법을 확인하세요.",
    focusAreas: [{ x: 8, y: 24, w: 84, h: 8 }],
    speak: "상단의 사람 버튼을 눌러보세요.",
  },
  {
    id: 2,
    title: "카카오톡 ID 버튼 누르기",
    instruction: "카카오톡 ID 탭을 눌러보세요.",
    focusAreas: [{ x: 10, y: 36, w: 80, h: 8 }],
    speak: "카카오톡 ID 탭을 눌러보세요.",
  },
  {
    id: 3,
    title: "키보드 꺼내보기",
    instruction: "키보드를 꺼내보세요.",
    focusAreas: [{ x: 6, y: 46, w: 88, h: 10, pill: true }],
    speak: "친구의 카카오톡 ID를 입력하기 위해 키보드를 꺼내보세요.",
  },
  {
    id: 4,
    title: "ID 입력하기",
    instruction: "친구의 카카오톡 ID를 입력해보세요.",
    focusAreas: [{ x: 6, y: 46, w: 88, h: 10, pill: true }],
    inputPlaceholder: "메시지를 입력하세요",
    allowEnglish: true,
    speak: "친구에게 인사말을 보내보세요.",
  },
  {
    id: 5,
    title: "친구 추가 완료",
    instruction: "친구 추가 탭을 눌러보세요.",
    focusAreas: [{ x: 6, y: 46, w: 88, h: 10, pill: true }],
    speak: "친구 추가 탭을 눌러 친구 추가를 완료해보세요.",
    completionSpeak:
      "잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?",
  },
  {
    id: 6,
    title: "추가 정보 확인",
    instruction: "추가로 표시되는 정보를 확인해보세요.",
    focusAreas: [{ x: 6, y: 46, w: 88, h: 10, pill: true }],
    inputPlaceholder: "메시지를 입력하세요",
    speak: "화면에 표시된 추가 정보를 확인해보세요.",
  },
  {
    id: 7,
    title: "완료 및 확인",
    instruction: "작업이 완료되었는지 최종 확인해보세요.",
    focusAreas: [{ x: 6, y: 46, w: 88, h: 10, pill: true }],
    speak: "모든 작업을 확인하셨다면 완료해보세요.",
  },
];
export default steps;
