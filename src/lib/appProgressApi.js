import api from './api';

export async function markAppProgress(appId, type){
  // type: 'learn' | 'practice'
  if(!appId || !type) return;
  try {
    // set local flag for quick UI
    try { localStorage.setItem(`${appId}_${type}Done`, 'true'); } catch { /* ignore */ }
    // best-effort POST to server via axios helper which injects Authorization header when available
    await api.post('/progress/app', { appId, type, at: new Date().toISOString() });
  } catch { /* ignore network/auth errors */ }
}
