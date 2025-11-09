// 동적 Call 학습 단계/스크린 로더
// 이미지 네이밍 규칙: c<prefix><번호>.png  (예: ccalling1.png, cfix7.png)
// 각 토픽의 기존 3단계 Steps.js 내용을 1~3단계 템플릿으로 재활용하고
// 추가 이미지가 더 있으면 4단계 이후는 자동 생성합니다.

import callingBase from './CallCallingLessonSteps.js';
import saveBase from './CallSaveLessonSteps.js';
import fixBase from './CallFixLessonSteps.js';
import faceBase from './CallFaceLessonSteps.js';
import favoriteBase from './CallFavoriteLessonSteps.js';

// Vite의 import.meta.glob 은 문자열 리터럴이어야 하므로 토픽별로 미리 선언
const imageGlobs = {
  calling: import.meta.glob('../../assets/ccalling*.png', { eager: true, import: 'default' }),
  save: import.meta.glob('../../assets/csave*.png', { eager: true, import: 'default' }),
  fix: import.meta.glob('../../assets/cfix*.png', { eager: true, import: 'default' }),
  face: import.meta.glob('../../assets/cface*.png', { eager: true, import: 'default' }),
  favorite: import.meta.glob('../../assets/cfavorite*.png', { eager: true, import: 'default' })
};

const baseStepsMap = {
  calling: callingBase,
  save: saveBase,
  fix: fixBase,
  face: faceBase,
  favorite: favoriteBase
};

export const topicMeta = {
  calling: { title: '전화걸기', tagline: '전화번호 입력부터 종료까지 전체 흐름을 익혀요.' },
  save: { title: '연락처 저장하기', tagline: '새 연락처를 추가하고 저장하는 방법을 배워요.' },
  fix: { title: '연락처 수정하기', tagline: '기존 연락처 정보를 수정하는 방법을 배워요.' },
  face: { title: '영상통화 하기', tagline: '영상통화 시작과 화면 전환을 연습해요.' },
  favorite: { title: '즐겨찾기 등록하기', tagline: '중요한 연락처를 즐겨찾기에 추가해 보세요.' }
};

const COMPLETION_SPEAK_DEFAULT = '잘하셨어요 아래 완료 버튼을 눌러 더 많은걸 배우러 가볼까요?';

function extractIndex(prefix, filePath){
  // filePath 예: /src/assets/ccalling12.png
  const file = filePath.split('/').pop() || '';
  const re = new RegExp(`^c${prefix}([0-9]+)\\.png$`); // prefix는 calling, save 등
  const m = file.match(re);
  if(!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

// prefixMap: topicKey -> 파일 prefix (c + prefix + N) 여기서는 topicKey가 그대로 prefix 역할
export function buildCallLessonConfig(topicKey){
  if(!imageGlobs[topicKey]){
    return { steps: baseStepsMap[topicKey] || [], screens: {} };
  }
  const globResult = imageGlobs[topicKey];
  const entries = Object.entries(globResult);
  // 숫자 인덱스 추출 + 정렬
  const indexed = entries.map(([path, mod]) => ({ path, mod, idx: extractIndex(topicKey, path) }))
    .filter(o => o.idx != null)
    .sort((a,b) => a.idx - b.idx);

  // step당 스크린 이미지 매핑 (1-based id)
  const screens = {};
  indexed.forEach(o => { screens[o.idx] = o.mod; });

  const count = indexed.length || 1; // 최소 1
  const base = (baseStepsMap[topicKey] || []).map(s => ({ ...s }));

  const steps = [];
  for(let i=1;i<=count;i++){
    const baseStep = base.find(b => b.id === i);
    if(baseStep){
      // id 재보장
      const cloned = { ...baseStep, id: i };
      if(i === count && !cloned.completionSpeak){ cloned.completionSpeak = COMPLETION_SPEAK_DEFAULT; }
      steps.push(cloned);
    } else {
      // 자동 생성 단계
      const isLast = (i === count);
      steps.push({
        id: i,
        title: `단계 ${i}`,
        instruction: isLast ? '마지막 화면을 확인하고 학습을 마무리하세요.' : `이미지 ${i}을(를) 보고 해당 기능을 살펴보세요.`,
        speak: isLast ? '마지막 단계입니다. 수고하셨어요.' : `단계 ${i} 화면을 살펴보세요.`,
        completionSpeak: isLast ? COMPLETION_SPEAK_DEFAULT : undefined
      });
    }
  }

  return { steps, screens };
}
