const steps = [
  { id: 1, title: '대화창 찾기', instruction: '대화창을 찾아 클릭하세요.', focusAreas:[{x:8,y:24,w:84,h:8}], speak: '대화창을 클릭하여 질문을 시작하세요.' },
  { id: 2, title: '질문 입력하기', instruction: '궁금하거나 원하는 질문을 입력하세요. \n지금은\n"맛있는 음식을 추천해줘"\n라고 해보세요. \n 그후 버튼을 눌러 전송합니다.', focusAreas:[{x:10,y:36,w:80,h:8}], speak: '질문을 입력하고 보내기를 눌러주세요.' },
  { id: 3, title: '답변 확인하기', instruction: '조금 기다린다면 원하시는 답변을 들을 수 있습니다.', focusAreas:[{x:6,y:46,w:88,h:10,pill:true}], speak: '질문을 보내고 기다리면 원하시는 답변을 얻을 수 있습니다.', completionSpeak: '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?' }
];
export default steps;
