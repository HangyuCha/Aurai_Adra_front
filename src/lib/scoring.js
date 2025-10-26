/*
 * 학습 세션 점수화 모듈 (Reusable Scoring Module)
 *
 * 요구사항 요약
 * - 입력값 기록: stepsRequired, correctCount, errorCount, startTime, endTime, hintCount,
 *   expertTimeSec, speedFactor(기본 2.5)
 * - 파생값: success, elapsed, limit, interactions, errorRate
 * - 점수(총 100점): 성공 50, 시간 30, 오류율 20, 힌트 패널티(-), (선택) 부분진행 보너스 0~10
 * - 규칙: 300ms 디바운스, 접근성 모드, 단계별 오답 한도, 1.5×limit 초과시 자동 종료(미완료)
 *
 * 제공 항목
 * 1) computeScore(metrics, options): 순수 함수로 점수 계산
 * 2) createSessionTracker(config): 이벤트 기반 세션 트래커(정답/오답/힌트 기록 + 자동 디바운스 + 점수 계산)
 */

/**
 * @typedef {Object} ScoreMetrics
 * @property {number} stepsRequired          전체 단계 수 (>=1)
 * @property {number} correctCount           정답(단계 완료로 인정되는 올바른 선택 수)
 * @property {number} errorCount             오답(잘못된 터치 수)
 * @property {number|Date} startTime         세션 시작 시각(ms 타임스탬프 또는 Date)
 * @property {number|Date} endTime           세션 종료 시각(ms 타임스탬프 또는 Date)
 * @property {number} hintCount              힌트 사용 횟수
 */

/**
 * @typedef {Object} AccessibilityOptions
 * @property {boolean} [enabled=false]       접근성 모드 사용 여부
 * @property {('speedFactor'|'relaxTimeBucket')} [method='speedFactor']
 *   - 'speedFactor': speedFactor를 더 크게 적용(기본 3.0)
 *   - 'relaxTimeBucket': 시간 점수 구간을 한 단계 완화
 * @property {number} [speedFactor=3.0]      접근성 모드에서 사용할 speedFactor(기본 3.0)
 */

/**
 * @typedef {Object} ScoreOptions
 * @property {number} expertTimeSec          전문가 기준 시간(초) [필수]
 * @property {number} [speedFactor=2.5]      노년층 배려 배율(권장 2.5, 상황별 2~3)
 * @property {AccessibilityOptions} [accessibility]
 * @property {number} [hintPenaltyPer=5]     힌트 1개당 패널티 점수(감점)
 * @property {number} [hintPenaltyFloor=-20] 힌트 패널티 최저 하한(예: -20)
 * @property {boolean} [enablePartialProgressBonus=true] 성공 못했을 때 부분 진행 보너스 사용 여부
 */

/**
 * @typedef {Object} ScoreResult
 * @property {number} total                  최종 총점(0~100, 클램프됨)
 * @property {{
 *   successScore:number,
 *   timeScore:number,
 *   errorScore:number,
 *   hintPenalty:number,
 *   progressBonus:number
 * }} breakdown
 * @property {{
 *   success:boolean,
 *   elapsedSec:number,
 *   limitSec:number,
 *   interactions:number,
 *   errorRate:number,
 *   autoTerminated:boolean,
 *   timeBucket:'within'|'<=120%'|'<=150%'|'>150%',
 *   errorBucket:'<=5%'|'<=10%'|'<=20%'|'<=30%'|'>30%'
 * }} derived
 * @property {{
 *   stepsRequired:number,
 *   correctCount:number,
 *   errorCount:number,
 *   startTime:number,
 *   endTime:number,
 *   hintCount:number,
 *   expertTimeSec:number,
 *   speedFactor:number,
 *   accessibility:AccessibilityOptions|undefined
 * }} inputsEcho
 */

/** Number 유틸: Date 또는 number(ms) → number(ms) */
function toMs(value) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  return NaN;
}

/** 안전한 정수 변환 */
function toNonNegativeInt(n, fallback = 0) {
  const v = Number.isFinite(n) ? Math.floor(n) : fallback;
  return v < 0 ? 0 : v;
}

/** 0~1 사이로 클램프 */
function clamp01(x) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

/** 최종 점수 0~100 클램프 */
function clampScore100(x) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(100, Math.round(x)));
}

/** 시간 점수(접근성 옵션 반영 전 기본 규칙) */
function baseTimeScore(elapsedSec, limitSec) {
  if (!Number.isFinite(elapsedSec) || !Number.isFinite(limitSec) || limitSec <= 0) return 0;
  const r = elapsedSec / limitSec;
  if (r <= 1) return 30; // ≤ limit
  if (r <= 1.2) return 20; // (limit, 1.2×limit]
  if (r <= 1.5) return 10; // (1.2×limit, 1.5×limit]
  return 0;                 // > 1.5×limit
}

/** 접근성 모드: 시간 구간 한 단계 완화 */
function relaxedTimeScore(elapsedSec, limitSec) {
  if (!Number.isFinite(elapsedSec) || !Number.isFinite(limitSec) || limitSec <= 0) return 0;
  const r = elapsedSec / limitSec;
  if (r <= 1) return 30;      // 그대로 30
  if (r <= 1.2) return 30;    // 20 → 30으로 승급
  if (r <= 1.5) return 20;    // 10 → 20으로 승급
  return 0;                    // > 1.5×limit 은 자동 종료 구간 유지
}

/** 오류율 점수 */
function errorRateScore(errorRate) {
  if (!Number.isFinite(errorRate) || errorRate < 0) return 0;
  if (errorRate <= 0.05) return 20;
  if (errorRate <= 0.10) return 15;
  if (errorRate <= 0.20) return 10;
  if (errorRate <= 0.30) return 5;
  return 0;
}

/**
 * 점수 계산 (순수 함수)
 * @param {ScoreMetrics} metrics
 * @param {ScoreOptions} options
 * @returns {ScoreResult}
 */
export function computeScore(metrics, options) {
  // 입력 정규화
  const stepsRequired = Math.max(1, toNonNegativeInt(metrics?.stepsRequired, 1));
  const correctCount = toNonNegativeInt(metrics?.correctCount, 0);
  const errorCount = toNonNegativeInt(metrics?.errorCount, 0);
  const hintCount = toNonNegativeInt(metrics?.hintCount, 0);
  const startMs = toMs(metrics?.startTime);
  const endMs = toMs(metrics?.endTime);

  const expertTimeSec = Number(options?.expertTimeSec);
  if (!Number.isFinite(expertTimeSec) || expertTimeSec <= 0) {
    throw new Error('computeScore: options.expertTimeSec는 양의 숫자여야 합니다.');
  }

  let speedFactor = Number(options?.speedFactor ?? 2.5);
  if (!Number.isFinite(speedFactor) || speedFactor <= 0) speedFactor = 2.5;

  const accessibility = options?.accessibility;
  const hintPenaltyPer = Number(options?.hintPenaltyPer ?? 5);
  const hintPenaltyFloor = Number(options?.hintPenaltyFloor ?? -20);
  const enablePartialProgressBonus = options?.enablePartialProgressBonus !== false;

  // 접근성 모드: speedFactor 방식이면 우선 적용
  if (accessibility?.enabled && accessibility?.method === 'speedFactor') {
    const accSF = Number(accessibility?.speedFactor ?? 3.0);
    if (Number.isFinite(accSF) && accSF > 0) speedFactor = accSF;
  }

  const limitSec = expertTimeSec * speedFactor;

  const validStart = Number.isFinite(startMs) ? startMs : Date.now();
  const validEnd = Number.isFinite(endMs) ? endMs : validStart; // end가 없으면 0초 소요로 처리
  const elapsedSecRaw = Math.max(0, (validEnd - validStart) / 1000);

  // 상호작용 및 오류율
  const interactionsRaw = correctCount + errorCount;
  const interactions = interactionsRaw === 0 ? 1 : interactionsRaw; // 0이면 1로 보정
  const errorRate = errorCount / interactions;

  // 성공 여부
  let success = correctCount >= stepsRequired;

  // 시간 점수 계산
  const autoTerminated = elapsedSecRaw > (1.5 * limitSec);
  let timeScore = 0;
  let timeBucket = '>150%';
  if (autoTerminated) {
    timeScore = 0; // 자동 종료 구간
    timeBucket = '>150%';
    success = false; // 강제 미완료 처리
  } else {
    if (accessibility?.enabled && accessibility?.method === 'relaxTimeBucket') {
      timeScore = relaxedTimeScore(elapsedSecRaw, limitSec);
    } else {
      timeScore = baseTimeScore(elapsedSecRaw, limitSec);
    }
    const r = elapsedSecRaw / limitSec;
    if (r <= 1) timeBucket = 'within';
    else if (r <= 1.2) timeBucket = '<=120%';
    else if (r <= 1.5) timeBucket = '<=150%';
    else timeBucket = '>150%';
  }

  // 성공 점수
  const successScore = success ? 50 : 0;

  // 오류율 점수
  const errScore = errorRateScore(errorRate);
  const errorBucket = errorRate <= 0.05 ? '<=5%' : errorRate <= 0.10 ? '<=10%'
    : errorRate <= 0.20 ? '<=20%' : errorRate <= 0.30 ? '<=30%' : '>30%';

  // 힌트 패널티
  const rawHintPenalty = -hintPenaltyPer * hintCount;
  const hintPenalty = Math.max(hintPenaltyFloor, rawHintPenalty);

  // (선택) 부분 진행 보너스: 성공 못했을 때만 적용
  let progressBonus = 0;
  if (!success && enablePartialProgressBonus) {
    const progress = clamp01(stepsRequired > 0 ? (correctCount / stepsRequired) : 0);
    progressBonus = Math.round(10 * progress); // 반올림
  }

  // 총합 및 클램프
  const subtotal = successScore + timeScore + errScore + hintPenalty + progressBonus;
  const total = clampScore100(subtotal);

  return {
    total,
    breakdown: {
      successScore,
      timeScore,
      errorScore: errScore,
      hintPenalty,
      progressBonus,
    },
    derived: {
      success,
      elapsedSec: Math.round(elapsedSecRaw * 100) / 100,
      limitSec: Math.round(limitSec * 100) / 100,
      interactions,
      errorRate: Math.round(errorRate * 10000) / 10000, // 소수점 4자리
      autoTerminated,
      timeBucket,
      errorBucket,
    },
    inputsEcho: {
      stepsRequired,
      correctCount,
      errorCount,
      startTime: validStart,
      endTime: validEnd,
      hintCount,
      expertTimeSec,
      speedFactor,
      accessibility,
    },
  };
}

// -------------------- 세션 트래커 --------------------

/**
 * @typedef {Object} SessionTrackerConfig
 * @property {number} stepsRequired
 * @property {number} expertTimeSec
 * @property {number} [speedFactor=2.5]
 * @property {AccessibilityOptions} [accessibility]
 * @property {number} [debounceWindowMs=300]  동일 타입 이벤트를 묶는 디바운스 윈도우(ms)
 * @property {number} [errorAdvanceThreshold=5] 같은 단계에서 오답 N회가 넘으면 다음 단계로 유도
 * @property {number} [hintPenaltyPer=5]
 * @property {number} [hintPenaltyFloor=-20]
 * @property {boolean} [enablePartialProgressBonus=true]
 */

/** @typedef {'start'|'end'|'correct'|'error'|'hint'} EventType */

/**
 * 이벤트 기반 세션 트래커 생성
 * @param {SessionTrackerConfig} config
 */
export function createSessionTracker(config) {
  const stepsRequired = Math.max(1, toNonNegativeInt(config?.stepsRequired, 1));
  const expertTimeSec = Number(config?.expertTimeSec);
  if (!Number.isFinite(expertTimeSec) || expertTimeSec <= 0) {
    throw new Error('createSessionTracker: config.expertTimeSec는 양의 숫자여야 합니다.');
  }
  let speedFactor = Number(config?.speedFactor ?? 2.5);
  if (!Number.isFinite(speedFactor) || speedFactor <= 0) speedFactor = 2.5;

  const accessibility = config?.accessibility;
  const debounceWindowMs = toNonNegativeInt(config?.debounceWindowMs ?? 300, 300);
  const errorAdvanceThreshold = toNonNegativeInt(config?.errorAdvanceThreshold ?? 5, 5);

  const hintPenaltyPer = Number(config?.hintPenaltyPer ?? 5);
  const hintPenaltyFloor = Number(config?.hintPenaltyFloor ?? -20);
  const enablePartialProgressBonus = config?.enablePartialProgressBonus !== false;

  /** @type {Array<{type:EventType, ts:number, stepIndex?:number}>} */
  const events = [];

  let startMs = NaN;
  let endMs = NaN;

  function nowMs() { return Date.now(); }

  function pushEvent(type, stepIndex) {
    const ts = nowMs();
    // 디바운스: 같은 타입 + 같은 stepIndex(정의된 경우) 기준 300ms 내 중복은 무시
    const last = [...events].reverse().find(e => e.type === type && (e.stepIndex ?? -1) === (stepIndex ?? -1));
    if (last && (ts - last.ts) <= debounceWindowMs && (type === 'error' || type === 'correct')) {
      return; // 중복 터치 무시
    }
    events.push({ type, ts, stepIndex });
  }

  function start() {
    if (!Number.isFinite(startMs)) {
      startMs = nowMs();
      events.push({ type: 'start', ts: startMs });
    }
    return startMs;
  }

  function end() {
    if (!Number.isFinite(endMs)) {
      endMs = nowMs();
      events.push({ type: 'end', ts: endMs });
    }
    return endMs;
  }

  function markCorrect(stepIndex) { pushEvent('correct', stepIndex); }
  function markError(stepIndex) { pushEvent('error', stepIndex); }
  function markHint() { pushEvent('hint'); }

  function getMetrics() {
    // 디바운스는 기록 시점에 적용했으므로 단순 집계
    const correctCount = events.filter(e => e.type === 'correct').length;
    const errorCount = events.filter(e => e.type === 'error').length;
    const hintCount = events.filter(e => e.type === 'hint').length;

    // 시작/종료 시간
    const s = Number.isFinite(startMs) ? startMs : (events.find(e => e.type === 'start')?.ts ?? nowMs());
    const e = Number.isFinite(endMs) ? endMs : (events.findLast?.(ev => ev.type === 'end')?.ts
      || [...events].reverse().find(ev => ev.type === 'end')?.ts
      || s);

    return {
      stepsRequired,
      correctCount,
      errorCount,
      startTime: s,
      endTime: e,
      hintCount,
    };
  }

  function shouldAutoAdvance(errorCountForStep) {
    return toNonNegativeInt(errorCountForStep, 0) >= errorAdvanceThreshold;
  }

  function score(optionsOverride) {
    const metrics = getMetrics();
    return computeScore(metrics, {
      expertTimeSec,
      speedFactor,
      accessibility,
      hintPenaltyPer,
      hintPenaltyFloor,
      enablePartialProgressBonus,
      ...optionsOverride,
    });
  }

  function scoreNow(optionsOverride) {
    end();
    return score(optionsOverride);
  }

  return {
    // 원시 이벤트
    events,
    // 시간 제어
    start,
    end,
    // 상호작용 기록
    markCorrect,
    markError,
    markHint,
    // 메트릭/스코어
    getMetrics,
    score,
    scoreNow,
    // 규칙 헬퍼
    shouldAutoAdvance,
  };
}

export default {
  computeScore,
  createSessionTracker,
};
