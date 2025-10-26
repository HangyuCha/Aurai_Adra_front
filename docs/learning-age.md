# 배움 나이( Learning Age )

연습하기 20개 챕터의 성공 현황을 기반으로 사용자의 '배움 나이'를 산정합니다. 나이가 많을수록 시작점이 높고, 챕터를 성공할수록 10년 단위(디케이드)로 점차 젊어지며, 최종 최소치는 10대입니다.

## 핵심 규칙

- 입력
  - actualAge: 실제 나이(년)
  - successCount: 성공한 챕터 수(0..totalChapters)
  - totalChapters: 기본 20
- 산정 방식
  1. 실제 나이를 10년대 하한으로 내림: 67 → 60, 81 → 80
  2. 시작 디케이드에서 10대까지(예: 80→10)는 총 `steps = (startDecade-10)/10` 단계
  3. 전체 챕터 20개를 `steps` 구간으로 등분하여, 특정 구간에 도달할 때마다 10년씩 감소
  4. 10대 이하는 항상 10대로 고정

예) 실제 나이 82세(80대 시작), 총 20챕터
- 단계 수: (80-10)/10 = 7 (80→70→60→50→40→30→20→10, 7번 이동)
- 구간당 챕터 수: 20/7 ≈ 2.857
- 성공 0~2 챕터: 80대, 3~5: 70대, 6~8: 60대, ... 누적 성공에 따라 한 단계씩 낮아짐

## 프론트 계산 유틸

`src/lib/learningAge.js`

- getLearningDecade(actualAgeYears, successCount, totalChapters?) → 숫자 디케이드(예: 70)
- getLearningAgeLabel(actualAgeYears, successCount, totalChapters?) → '70대'
- getProgressPercent(successCount, totalChapters?) → 진행 퍼센트(0~100)

```js
import { getLearningDecade, getLearningAgeLabel, getProgressPercent } from '../lib/learningAge';

const decade = getLearningDecade(67, 8, 20);   // 예: 50
const label = getLearningAgeLabel(67, 8, 20);  // '50대'
const pct = getProgressPercent(8, 20);         // 40
```

## 서버 연동(제안 스키마)

추천 엔드포인트 (실서비스 백엔드 구현 필요):

- GET    /api/progress/chapters/:userId
  - 응답: { userId, totalChapters, successes: number[], successCount }
- POST   /api/progress/chapters
  - 요청: { userId, chapterId, success: true, at?: ISO8601 }
  - 동작: 성공시 idempotent upsert (같은 chapterId는 중복 저장 없이 유지)
  - 응답: 최신 스냅샷
- DELETE /api/progress/chapters
  - 요청: { userId, chapterId }
  - 동작: 해당 성공 기록 제거(관리용)

프론트 헬퍼: `src/lib/progress.js`

```js
import { markChapterSuccess, getUserProgress, computeLearningAgeView } from '../lib/progress';

// 성공 세션 종료 후 호출
await markChapterSuccess(user.id, chapterId);

// 사용자 진행/배움나이 갱신
const progress = await getUserProgress(user.id);
const view = computeLearningAgeView(user.age, progress.successCount, progress.totalChapters);
// view = { decade: 50, label: '50대', percent: 40 }
```

## 로컬 개발용 목업

Vite 개발 서버에서 아래 환경변수를 켜면 in-memory 목업 API가 활성화됩니다(배포 금지):

- DEV_PROGRESS_MOCK=1
- PROGRESS_TOTAL_CHAPTERS=20 (선택)

엔드포인트는 위 스키마와 동일하게 동작합니다. 데이터는 서버 재시작 시 초기화됩니다.
