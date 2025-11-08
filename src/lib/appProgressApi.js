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
