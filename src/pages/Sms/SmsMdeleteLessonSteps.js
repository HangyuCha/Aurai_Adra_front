// SmsMdeleteLesson step definitions (placeholder)
const steps = [
  {
    id: 1,
    title: '대화 선택',
    instruction: '삭제하려는 대화를 길게 누르거나 선택하세요.',
    focusAreas: [ { x: 7, y: 23, w: 72, h: 7.2 } ],
    speak: '삭제하려는 메시지를 선택하면 삭제 메뉴가 나옵니다.'
  },
  {
    id: 2,
    title: '메시지 선택하기',
    instruction: '삭제하려는 메시지를 선택한 후 삭제 버튼을 찾습니다.',
    focusAreas: [ { x: 20, y: 40, w: 60, h: 8 } ],
    speak: '삭제 버튼을 눌러 메시지를 지울 수 있습니다.'
  },
  {
    id: 3,
    title: '메시지 삭제 연습',
    instruction: '삭제 확인 대화상자에서 확인 버튼을 눌러 메시지를 삭제해 보세요.',
    focusAreas: [ { x: 48, y: 66, w: 36, h: 12, pill: true } ],
    speak: '확인을 누르면 메시지가 삭제됩니다.',
    completionSpeak: '메시지를 잘 삭제했어요.'
  }
];

export default steps;
