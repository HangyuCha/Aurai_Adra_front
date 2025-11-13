import api from './api';

/**
 * Mark progress for a session or app.
 * @param {string} appId - app id e.g. 'sms'
 * @param {string} type - 'learn' | 'practice'
 * @param {string|null} sessionId - optional session id e.g. 'msend'
 * @param {object|null} metadata - optional metadata (score, attempts...)
 */
export async function markAppProgress(appId, type, sessionId = null, metadata = null){
  if(!appId || !type) return;
  try {
    // set local flag for quick UI (prefer per-session key when sessionId is provided)
    try {
      const key = sessionId ? `${appId}_${sessionId}_${type}Done` : `${appId}_${type}Done`;
      localStorage.setItem(key, 'true');
    } catch { /* ignore */ }

    // prepare payload for server: use session endpoint
    const payload = {
      appId,
      type,
      sessionId: sessionId || null,
      at: new Date().toISOString(),
      metadata: metadata || null,
    };

    // best-effort POST to server via axios helper which injects Authorization header when available
    await api.post('/progress/session', payload);
  } catch (e) {
    // ignore network/auth errors; optionally log
    console.debug('markAppProgress failed', e && e.message);
  }
}

/**
 * Fetch per-session progress for current user (normalized shape).
 * Actual backend: GET /progress/sessions/me → { appProgress: { [appId]: AppProgressSummaryDto } }
 * We normalize to { sessions: [{ sessionId, type, completedAt, metadata }] } for the requested appId.
 */
export async function getSessionProgress(appId) {
  // Call the correct endpoint that returns the full appProgress map
  const { data } = await api.get('/progress/sessions/me');
  // Normalize to the legacy shape expected by buildCompletionMapFromSessions
  const out = { sessions: [] };
  try {
    const map = data && data.appProgress ? data.appProgress : null;
    if (!map) return out;
    const key = (appId || '').toLowerCase();
    const entry = map[key];
    if (!entry || !entry.sessions) return out;
    const sessionsMap = entry.sessions; // { [sessionId]: { learn?: SessionProgressDto, practice?: SessionProgressDto } }
    for (const [sid, types] of Object.entries(sessionsMap)) {
      // Prefer 'learn' entries for completion on Learn hubs
      if (types && types.learn && types.learn.completed) {
        out.sessions.push({
          sessionId: sid,
          type: 'learn',
          completedAt: types.learn.completedAt || null,
          metadata: types.learn.metadata || null,
        });
        continue;
      }
      // Fallback: if any type exists and is completed, include it
      if (types) {
        for (const [t, v] of Object.entries(types)) {
          if (v && v.completed) {
            out.sessions.push({
              sessionId: sid,
              type: t,
              completedAt: v.completedAt || null,
              metadata: v.metadata || null,
            });
            break;
          }
        }
      }
    }
  } catch {
    // return empty normalized shape on parse issues
    return out;
  }
  return out;
}

/**
 * Convenience: Build a { [sessionId]: true } map from session list.
 */
export function buildCompletionMapFromSessions(list) {
  const out = {};
  if (!list || !Array.isArray(list.sessions)) return out;
  for (const s of list.sessions) {
    if (s && s.sessionId && (s.type === 'learn' || !s.type)) {
      out[s.sessionId] = true;
    }
  }
  return out;
}
