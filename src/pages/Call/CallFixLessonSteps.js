// 연락처 수정(fix) 5단계 구성
// 1/5: 항목 선택 → 2/5: 입력 유도(키보드) → 3/5: 미리보기 → 4/5: 편집(키보드) → 5/5: 최종 확인
const steps = [
  {
    id: 1,
    title: '연락처 선택',
    instruction: '수정할 연락처를 찾아 선택해보세요.',
    focusAreas: [{ x: 8, y: 24, w: 84, h: 8 }],
    speak: '수정할 연락처를 선택해보세요.'
  },
  {
    id: 2,
    title: '수정 내용 입력',
    instruction: '화면 상단 입력란에 수정할 내용을 가볍게 입력해보세요.',
    // ChatInputBar 표시를 위한 placeholder (실제 로직은 GenericLesson에서 처리)
    inputPlaceholder: '수정할 내용을 입력하세요',
    focusAreas: [{ x: 10, y: 36, w: 80, h: 8 }],
    speak: '수정할 내용을 입력해 보세요. 두세 글자 정도 입력하면 다음으로 넘어갈 수 있어요.'
  },
  {
    id: 3,
    title: '변경 내용 미리보기',
    instruction: '입력했던 이름과 번호가 어떻게 보일지 확인해보세요.',
    focusAreas: [{ x: 6, y: 46, w: 88, h: 10, pill: true }],
    speak: '변경될 정보를 미리 확인해보세요.'
  },
  {
    id: 4,
    title: '정보 수정',
    instruction: '이름이나 번호를 눌러 원하는 부분을 직접 수정해보세요.',
    // 4/5는 실제로 이름/번호 영역을 클릭해서 편집합니다. 키보드 노출을 위해 placeholder 부여.
    inputPlaceholder: '수정할 내용을 입력하세요',
    focusAreas: [{ x: 10, y: 36, w: 80, h: 8 }],
    speak: '이름 또는 번호를 선택해서 수정해보세요.'
  },
  {
    id: 5,
    title: '최종 확인',
    instruction: '수정된 값이 올바른지 확인하고 완료를 눌러 마무리하세요.',
    focusAreas: [{ x: 6, y: 46, w: 88, h: 10, pill: true }],
    completionSpeak: '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?'
  }
];
export default steps;
