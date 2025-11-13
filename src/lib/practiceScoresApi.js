import api from './api';

/**
 * Fetch best practice scores for current user and given appId.
 * Backend returns: { appId, items: [{ chapterId, total }] }
 * We normalize to { scores: [{ chapterId, total }] } for consumers in UI.
 */
export async function getPracticeScores(appId) {
  const { data } = await api.get('/progress/practice-scores/me', { params: appId ? { appId } : undefined });
  // normalize: prefer items -> scores; fallback to existing shape if already correct
  if (data && Array.isArray(data.items)) {
    return { appId: data.appId || appId || null, scores: data.items };
  }
  return data;
}

/**
 * Build a score array per topics using chapterId ranges.
 * - For SMS: chapters 1..5 map to topic indices 0..4
 * - For CALL: 6..10 map to indices 0..4 (we only display the first 4 topics currently)
 * - For GPT: 11..15 -> 0..4
 * - For KAKAO: 16..20 -> 0..4 (current practice pages map all to 16)
 */
export function mapScoresToTopics(appId, topics, server) {
  const id = (appId || '').toLowerCase();
  const start = id === 'sms' ? 1 : id === 'call' ? 6 : id === 'gpt' ? 11 : id === 'kakao' ? 16 : 1;
  const byChapter = new Map();
  if (server && Array.isArray(server.scores)) {
    for (const s of server.scores) {
      if (s && Number.isFinite(Number(s.chapterId))) {
        byChapter.set(Number(s.chapterId), Number.isFinite(Number(s.total)) ? Number(s.total) : null);
      }
    }
  }
  return topics.map((_, idx) => {
    const chapterId = start + idx;
    if (!Number.isFinite(chapterId)) return null;
    const val = byChapter.get(chapterId);
    return Number.isFinite(val) ? Math.max(0, Math.min(100, val)) : null;
  });
}

export default { getPracticeScores, mapScoresToTopics };
