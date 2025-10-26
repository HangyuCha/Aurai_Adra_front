// Fixed chapter mapping helper for 20 chapters
// Default mapping:
// 1–5: SMS, 6–10: CALL, 11–15: GPT, 16–20: KAKAO

export const ChapterDomain = {
  SMS: 'SMS',
  CALL: 'CALL',
  GPT: 'GPT',
  KAKAO: 'KAKAO',
};

export const CHAPTER_MAP = {
  [ChapterDomain.SMS]: [1, 2, 3, 4, 5],
  [ChapterDomain.CALL]: [6, 7, 8, 9, 10],
  [ChapterDomain.GPT]: [11, 12, 13, 14, 15],
  [ChapterDomain.KAKAO]: [16, 17, 18, 19, 20],
};

// Get chapter id by domain and zero-based topic index (0..4)
export function getChapterId(domain, index) {
  const arr = CHAPTER_MAP?.[domain];
  if (!arr) return null;
  const idx = Number.isFinite(index) ? index : -1;
  return idx >= 0 && idx < arr.length ? arr[idx] : null;
}

export default {
  ChapterDomain,
  CHAPTER_MAP,
  getChapterId,
};
