import { useMemo } from 'react';
import { createSessionTracker } from './scoring.js';
import { markChapterSuccess, getUserProgress, computeLearningAgeView } from './progress.js';

/**
 * useScoringProgress
 * - 각 연습 챕터 페이지에서 점수 계산 + 성공 시 서버에 진행 저장을 단순화하는 훅
 *
 * @param {Object} params
 * @param {{id:string|number, age?:number}} params.user           현재 사용자
 * @param {number} params.chapterId                               현재 챕터 식별자(1..N)
 * @param {number} params.expertTimeSec                           콘텐츠 전문가 기준 시간(초)
 * @param {number} params.stepsRequired                           현재 세션 단계 수(가변)
 * @param {number} [params.speedFactor=2.5]
 * @param {Object} [params.accessibility]
 * @param {number} [params.totalChapters=20]
 * @param {(score: any) => boolean} [params.shouldSave]  저장 조건(기본: 총점 100점일 때만 저장)
 */
export function useScoringProgress({ user, chapterId, expertTimeSec, stepsRequired, speedFactor = 2.5, accessibility, totalChapters = 20, shouldSave }) {
  const tracker = useMemo(() => createSessionTracker({
    stepsRequired,
    expertTimeSec,
    speedFactor,
    accessibility,
  }), [stepsRequired, expertTimeSec, speedFactor, accessibility]);

  async function finalizeAndSave() {
    tracker.end();
    const score = tracker.scoreNow();
    let progress = null;
    let learning = null;

    // 저장 조건: 기본적으로 총점 100점일 때만 저장
    const canSave = typeof shouldSave === 'function' ? !!shouldSave(score) : (score?.total === 100);
    if (canSave && user?.id != null && chapterId != null) {
      await markChapterSuccess(String(user.id), Number(chapterId), { at: new Date().toISOString() });
    }

    if (user?.id != null) {
      progress = await getUserProgress(String(user.id));
      const successCount = Number(progress?.successCount || 0);
      const ageYears = Number(user?.age || 0);
      learning = computeLearningAgeView(ageYears, successCount, Number(progress?.totalChapters || totalChapters));
    }

    return { score, progress, learning };
  }

  return { tracker, finalizeAndSave };
}

export default useScoringProgress;
