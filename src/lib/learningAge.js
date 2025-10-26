/*
 * Learning Age Utility
 * - 목표: 사용자 실제 나이(actualAge)와 성공한 챕터 수(successCount) 기반으로 '배움 나이' 산정
 * - 정책: 실제 나이의 10년대(actualDecade)에서 10대(=10)까지를 총 20챕터 비율로 등분하여
 *         일정 비율에 도달할 때마다 한 단계(10년)씩 낮아지는 디케이드(decade, 80→70→...→10)
 */

/** 실제 나이를 10년대 하한으로 정규화 (67 → 60, 81 → 80) */
export function toDecade(actualAge) {
  const age = Number.isFinite(actualAge) ? Math.max(0, Math.floor(actualAge)) : 0;
  const decade = Math.floor(age / 10) * 10;
  return Math.max(10, decade); // 최소 10대로 고정
}

/**
 * 학습(배움) 나이의 10년대 계산
 * @param {number} actualAgeYears 실제 나이(년)
 * @param {number} successCount   성공한 챕터 수
 * @param {number} [totalChapters=20] 전체 챕터 수(기본 20)
 * @returns {number} decade (예: 80,70,60,...,10)
 */
export function getLearningDecade(actualAgeYears, successCount, totalChapters = 20) {
  const startDecade = toDecade(actualAgeYears); // 시작 디케이드 (예: 80)
  const minDecade = 10;                         // 목표 최저 디케이드
  const steps = Math.max(0, (startDecade - minDecade) / 10); // 내려갈 수 있는 단계 수
  if (steps === 0) return minDecade; // 이미 10대 이하면 10대 유지

  const total = Math.max(1, Number.isFinite(totalChapters) ? Math.floor(totalChapters) : 20);
  const done = Math.max(0, Number.isFinite(successCount) ? Math.floor(successCount) : 0);

  // 각 단계당 필요한 챕터 수: total / steps
  const perStep = total / steps;
  const stepIndex = Math.min(steps, Math.floor(done / perStep)); // 0..steps
  return startDecade - (10 * stepIndex);
}

/** 10년대 숫자를 한글 라벨로 변환 (예: 70 → '70대') */
export function getLearningAgeLabelFromDecade(decade) {
  const d = Math.max(10, Math.floor(decade / 10) * 10);
  return `${d}대`;
}

/** 바로 실제 나이와 성공 수에서 라벨 산출 */
export function getLearningAgeLabel(actualAgeYears, successCount, totalChapters = 20) {
  return getLearningAgeLabelFromDecade(getLearningDecade(actualAgeYears, successCount, totalChapters));
}

/** 진행 퍼센트 (0~100) */
export function getProgressPercent(successCount, totalChapters = 20) {
  const total = Math.max(1, Number.isFinite(totalChapters) ? Math.floor(totalChapters) : 20);
  const done = Math.max(0, Number.isFinite(successCount) ? Math.floor(successCount) : 0);
  return Math.min(100, Math.round((done / total) * 100));
}

export default {
  toDecade,
  getLearningDecade,
  getLearningAgeLabelFromDecade,
  getLearningAgeLabel,
  getProgressPercent,
};
