# 학습 점수 모듈 사용 가이드

이 문서는 `src/lib/scoring.js` 모듈을 각 연습(Practice) 페이지에서 쉽게 불러와 점수를 계산하는 방법을 설명합니다. 단계 수(3/4/5 … 가변)를 포함한 모든 규칙이 모듈 안에 캡슐화되어 있습니다.

## 제공 기능

- computeScore(metrics, options): 순수 함수. 이미 수집한 카운트/시간으로 점수 계산
- createSessionTracker(config): 이벤트 기반 세션 트래커. 정답/오답/힌트 이벤트만 기록하면 자동으로 디바운스/집계/점수화

## 점수 규칙 요약

- 성공 50점: correctCount ≥ stepsRequired 이면 50, 아니면 0
- 시간 30점: limit = expertTimeSec × speedFactor
  - elapsed ≤ limit → 30
  - limit < elapsed ≤ 1.2×limit → 20
  - 1.2×limit < elapsed ≤ 1.5×limit → 10
  - 1.5×limit 초과 → 0(자동 종료/미완료)
- 오류율 20점:
  - 0~5% → 20, 5~10% → 15, 10~20% → 10, 20~30% → 5, 30% 초과 → 0
- 힌트 패널티: 1개당 −5점, 하한 −20점(옵션으로 변경 가능)
- (선택) 진행 보너스 0~10점: 실패시에만 correctCount/stepsRequired 비례(반올림)
- 디바운스: 300ms 내 중복 터치는 1회로 처리(세션 트래커가 자동 적용)
- 접근성 모드:
  - method 'speedFactor': speedFactor를 3.0 등으로 상향
  - method 'relaxTimeBucket': 시간 구간을 한 단계 완화(예: 1.2× 이내면 30점)
- 단계별 오답 한도: 같은 단계 오답 N회(기본 5회) 넘으면 다음 단계로 유도(집계는 유지). `tracker.shouldAutoAdvance(n)` 제공

---

## 1) 간단 사용법: computeScore (카운트 기반)

이미 카운트/시간을 보유한 경우 사용합니다.

```js
// NOTE: import 경로는 페이지 파일 위치에 따라 조정하세요.
// 예) pages/* 에서: import { computeScore } from '../../lib/scoring';
// 예) 같은 디렉토리 기준: import { computeScore } from '../lib/scoring';
import { computeScore } from '../lib/scoring';

const result = computeScore(
  {
    stepsRequired: 4,
    correctCount: 4,
    errorCount: 1,
    startTime: Date.now() - 95_000, // 95초 전 시작
    endTime: Date.now(),
    hintCount: 1,
  },
  {
    expertTimeSec: 40,
    speedFactor: 2.5,
    // 접근성 옵션(선택)
    accessibility: {
      enabled: false,
      method: 'speedFactor', // 또는 'relaxTimeBucket'
      speedFactor: 3.0,
    },
    hintPenaltyPer: 5,
    hintPenaltyFloor: -20,
    enablePartialProgressBonus: true,
  }
);

console.log(result.total, result.breakdown, result.derived);
```

예시 계산: 단계 4, 정답 4, 오답 1, 힌트 1, 전문가시간 40초, speedFactor 2.5 → limit 100초, 실제 95초 → 시간 30점, 오류율 20% → 10점, 성공 50점, 힌트 −5점 → 총점 85점.

---

## 2) 이벤트 기반: createSessionTracker (추천)

페이지에서 정답/오답/힌트 이벤트만 호출하면 나머지는 자동으로 처리됩니다.

```js
// NOTE: import 경로는 페이지 파일 위치에 따라 조정하세요.
import { createSessionTracker } from '../lib/scoring';

const tracker = createSessionTracker({
  stepsRequired: 5,
  expertTimeSec: 50, // 콘텐츠별 사전 정의
  speedFactor: 2.5,
  // 접근성 모드(선택)
  accessibility: { enabled: false, method: 'speedFactor', speedFactor: 3.0 },
  debounceWindowMs: 300,
  errorAdvanceThreshold: 5,
  hintPenaltyPer: 5,
  hintPenaltyFloor: -20,
});

tracker.start();

// 사용자가 상호작용할 때
tracker.markCorrect(0); // 0번 단계 완료
tracker.markError(1);   // 1번 단계에서 오답 1회
tracker.markHint();     // 힌트 1회

// 진행 중, 특정 단계에서 오답이 너무 많으면 다음 단계로 유도할지 판단
const shouldSkip = tracker.shouldAutoAdvance(6); // true (기본 임계값 5)

// 연습 종료 시점
tracker.end();

const score = tracker.scoreNow();
console.log(score.total, score.breakdown, score.derived);
```

- 디바운스: `markError`/`markCorrect`는 동일 타입 + 동일 stepIndex에서 300ms 내 반복 입력을 무시합니다.
- 자동 종료: 내부 계산에서 elapsed > 1.5×limit이면 `derived.autoTerminated = true`, 성공 점수 0 & 시간 점수 0 처리됩니다.

---

## 3) 페이지 통합 팁(React)

- 각 Practice/Learn 페이지 마운트 시 `tracker.start()` 호출, 언마운트 시 `tracker.end()`와 `tracker.scoreNow()`로 결과를 얻어 서버에 전송하세요.
- 콘텐츠 메타데이터(`expertTimeSec`)는 각 토픽/챕터 파일에 상수로 보관하고, A/B로 `speedFactor`만 조정 가능합니다.

```jsx
import { useEffect, useMemo } from 'react';
// NOTE: import 경로는 페이지 파일 위치에 따라 조정하세요.
import { createSessionTracker } from '../lib/scoring';

export default function LessonPractice() {
  const tracker = useMemo(() => createSessionTracker({
    stepsRequired: 4,
    expertTimeSec: 40,
    speedFactor: 2.5,
  }), []);

  useEffect(() => {
    tracker.start();
    return () => {
      tracker.end();
      const score = tracker.scoreNow();
      // TODO: 서버 업로드 or 상태 저장
      // api.post('/scores', score)
    };
  }, [tracker]);

  // 예시 핸들러
  const onCorrect = (stepIdx) => tracker.markCorrect(stepIdx);
  const onError = (stepIdx) => tracker.markError(stepIdx);
  const onHint = () => tracker.markHint();

  return (
    <div>
      {/* UI 내부에서 onCorrect/onError/onHint 연결 */}
    </div>
  );
}
```

---

## 4) 반환 값(ScoreResult)

```ts
{
  total: number,             // 0~100, 반올림 및 클램프
  breakdown: {
    successScore: number,
    timeScore: number,
    errorScore: number,
    hintPenalty: number,
    progressBonus: number,
  },
  derived: {
    success: boolean,
    elapsedSec: number,
    limitSec: number,
    interactions: number,
    errorRate: number,
    autoTerminated: boolean,
    timeBucket: 'within' | '<=120%' | '<=150%' | '>150%',
    errorBucket: '<=5%' | '<=10%' | '<=20%' | '<=30%' | '>30%',
  },
  inputsEcho: { /* 입력값 에코백 */ }
}
```

---

## 5) 커스터마이징 포인트

- 접근성 모드
  - speedFactor 확장: 고령층 모드에서 `speedFactor: 3.0` 등으로 여유를 더 줌
  - relaxTimeBucket: 시간 구간을 한 단계 완화(예: 1.2× 이내면 30점)
- 힌트 하한선: `hintPenaltyFloor`로 최대 감점 제한(기본 −20)
- 부분 진행 보너스: `enablePartialProgressBonus: false`로 끌 수 있음
- 디바운스 윈도우: `debounceWindowMs` 변경(기본 300ms)
- 오답 한도: `errorAdvanceThreshold` 변경(기본 5회)

---

## 6) 주의사항

- stepsRequired는 1 이상이어야 합니다(내부에서 최소 1로 보정).
- 상호작용이 0이면 오류율 분모를 1로 보정하여 0으로 나눔을 방지합니다.
- 1.5×limit을 초과하면 자동 종료 및 실패 처리됩니다.
