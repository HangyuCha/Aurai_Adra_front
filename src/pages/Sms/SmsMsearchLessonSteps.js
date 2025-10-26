// SmsMsearchLesson step definitions (placeholder)
const steps = [
  {
    id: 1,
    title: '검색 화면 열기',
    instruction: '문자 앱의 검색 기능을 찾아 누르세요.',
    focusAreas: [ { x: 78, y: 8, w: 18, h: 6 } ],
    speak: '검색 아이콘을 눌러 지난 메시지에서 단어를 찾아볼 수 있어요.'
  },
  {
    id: 2,
    title: '키워드 입력',
    instruction: '검색어 입력창에 찾고 싶은 단어를 입력합니다.',
    focusAreas: [ { x: 12, y: 20, w: 76, h: 8 } ],
    speak: '여기에 단어를 입력하면 관련된 메시지를 찾을 수 있습니다.'
  },
  {
    id: 3,
    title: '검색 결과 확인',
    instruction: '검색 결과에서 원하는 메시지를 찾아 선택해 보세요.',
    focusAreas: [ { x: 12, y: 34, w: 76, h: 40 } ],
    speak: '검색 결과를 확인하고 원하는 메시지를 선택하세요.',
    completionSpeak: '검색을 잘 해내셨어요.'
  }
];

export default steps;
