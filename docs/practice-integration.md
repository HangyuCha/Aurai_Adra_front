# Practice Integration Guide

This guide shows how to wire Practice pages to scoring + progress save, with the rule: only save when total score === 100.

## What you have
- Scoring: `src/lib/scoring.js` (createSessionTracker, computeScore)
- Save/API: `src/lib/progress.js` (GET/POST/DELETE)
- Hook: `src/lib/useScoringProgress.js` (session → score → save* → refresh)
- Chapter mapping: `src/lib/chapters.js` (1–5 SMS, 6–10 Call, 11–15 GPT, 16–20 KAKAO)

Save rule (default): total score must equal 100.
You can override via `shouldSave(score): boolean` if needed.

## Minimal wiring inside a Practice session component

```jsx
import { useEffect } from 'react';
import { useScoringProgress } from '../lib/useScoringProgress';
import { getChapterId, ChapterDomain } from '../lib/chapters';

export default function SomePractice({ user, topicIndex /* 0..4 */ }) {
  const chapterId = getChapterId(ChapterDomain.SMS, topicIndex); // choose domain
  const stepsRequired = 4;     // this session's steps
  const expertTimeSec = 40;    // content baseline

  const { tracker, finalizeAndSave } = useScoringProgress({
    user, chapterId, stepsRequired, expertTimeSec, speedFactor: 2.5,
    // Optional: shouldSave: (score) => score.total === 100, // default
  });

  useEffect(() => { tracker.start(); return () => tracker.end(); }, [tracker]);

  // During interaction
  const onCorrect = (idx) => tracker.markCorrect(idx);
  const onError = (idx) => tracker.markError(idx);
  const onHint = () => tracker.markHint();

  // When the session ends (no need for a button specifically)
  const onSessionDone = async () => {
    const { score, progress, learning } = await finalizeAndSave();
    // Saved only when score.total === 100
  };

  return null;
}
```

## Notes
- Do not change Learn pages; wire only Practice sessions.
- If a specific Practice is split by topics, pass a fixed `chapterId` per topic with `getChapterId(domain, index)`.
- Touch debounce and time/penalty rules are handled inside the scoring module.
- If a session auto-terminates (> 1.5×limit), success is forced false and total will not be 100, so save won’t trigger.
