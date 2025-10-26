// Progress API client & helpers
// - 서버 DB에 사용자별로 성공한 챕터를 기록/조회합니다.
// - 프론트에서는 성공 세션 종료 시 markChapterSuccess를 호출하세요.

import api from './api.js';
import { getLearningDecade, getLearningAgeLabel, getProgressPercent } from './learningAge.js';

/**
 * 서버 엔드포인트 (제안)
 * - GET    /api/progress/chapters/:userId           → { userId, totalChapters, successes: number[], successCount }
 * - POST   /api/progress/chapters                   → { userId, chapterId, success: true, at? }  (idempotent upsert)
 * - DELETE /api/progress/chapters                   → { userId, chapterId }                       (성공 기록 취소)
 */

export async function getUserProgress(userId) {
  const { data } = await api.get(`/progress/chapters/${encodeURIComponent(userId)}`);
  return data; // { userId, totalChapters, successes:number[], successCount }
}

export async function markChapterSuccess(userId, chapterId, payload = {}) {
  const body = { userId, chapterId, success: true, ...payload };
  const { data } = await api.post('/progress/chapters', body);
  return data; // 최신 progress 스냅샷 반환하도록 서버에서 처리 권장
}

export async function removeChapterSuccess(userId, chapterId) {
  const { data } = await api.delete('/progress/chapters', { data: { userId, chapterId } });
  return data;
}

/**
 * 서버/클라이언트 공용 계산 도우미: 학습 나이 & 진행 퍼센트
 */
export function computeLearningAgeView(actualAgeYears, successCount, totalChapters = 20) {
  const decade = getLearningDecade(actualAgeYears, successCount, totalChapters);
  const label = getLearningAgeLabel(actualAgeYears, successCount, totalChapters);
  const percent = getProgressPercent(successCount, totalChapters);
  return { decade, label, percent };
}

export default {
  getUserProgress,
  markChapterSuccess,
  removeChapterSuccess,
  computeLearningAgeView,
};
