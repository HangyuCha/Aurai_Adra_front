// 단계 정의: 예약 메시지 보내기 흐름 (마지막 단계에서 입력/전송을 기대)
// focusAreas: { x, y, w, h } (percent)
// speak: 읽어줄 문장 (문자열 또는 문자열 배열)
// completionSpeak: 마지막 단계 제출 성공 시 재생할 문구

const steps = [
  {
    id: 1,
    title: "수신된 메시지 확인하고, 더하기 버튼 누르기 ",
    instruction: "수신된 문자함을 열어 왼쪽 하단의 더하기 버튼을 누릅니다.",
    focusAreas: [{ x: 7, y: 23, w: 72, h: 7.2 }],
    speak: "예약 메시지를 보내기 위해 왼쪽 하단의 더하기 버튼을 눌러보세요.",
  },
  {
    id: 2,
    title: "예약 메시지 누르기",
    instruction: "예약 메시지 버튼을 눌러보세요.",
    focusAreas: [{ x: 32, y: 34.4, w: 60, h: 7 }],
    speak: "예약 메시지 버튼을 찾고, 눌러보세요.ㅂ",
  },
  {
    id: 3,
    title: "예약 저장 및 전송",
    instruction:
      "작성한 메시지를 확인한 뒤 초록색 예약(전송) 버튼을 눌러 예약을 완료하세요.",
    focusAreas: [{ x: 4, y: 45, w: 92, h: 10, pill: true }],
    speak: "메시지를 입력한 후 초록색 버튼을 눌러 예약을 저장해보세요.",
    completionSpeak:
      "잘하셨어요! 예약 메시지가 저장되었습니다. 아래 완료 버튼을 눌러 학습으로 돌아가세요.",
    inputPlaceholder: "예약 메시지를 입력하세요",
  },
  {
    id: 4,
    title: "예약 확인 화면",
    instruction:
      "작성한 예약 메시지를 확인하세요. 입력한 내용이 왼쪽에 표시됩니다.",
    focusAreas: [{ x: 4, y: 45, w: 92, h: 10, pill: true }],
    speak: "예약된 메시지를 확인해보세요.",
    completionSpeak:
      "잘하셨어요! 예약 메시지가 저장되었습니다. 아래 완료 버튼을 눌러 학습으로 돌아가세요.",
    // no inputPlaceholder: this page is display-only (shows the entered text)
  },
];

export default steps;
