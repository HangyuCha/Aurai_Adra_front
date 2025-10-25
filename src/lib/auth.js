import api from './api';

// Exchange Kakao OAuth authorization code for our app's access token.
// redirectUri must match what we used in Kakao.Auth.authorize and be registered in Kakao developers console.
export async function exchangeKakaoCode(code, redirectUri) {
  // Allow backend path override via env for precise control.
  let envAuth, envCallback;
  try { envAuth = import.meta.env?.VITE_KAKAO_AUTH_PATH; } catch { /* ignore env access in non-Vite contexts */ }
  try { envCallback = import.meta.env?.VITE_KAKAO_CALLBACK_PATH; } catch { /* ignore env access in non-Vite contexts */ }

  // Call ONLY the intended backend endpoint to avoid hitting legacy paths that may 403 with CORS.
  const q = `code=${encodeURIComponent(code)}&redirectUri=${encodeURIComponent(redirectUri)}`;
  const candidates = [];
  // Prefer explicit env override, else default to our backend contract
  if (envAuth) {
    candidates.push({ method: 'post', url: envAuth, body: { code, redirectUri } });
  } else {
    candidates.push({ method: 'post', url: '/auth/kakao', body: { code, redirectUri } });
  }
  // Optional single GET fallback if backend exposes a callback endpoint
  if (envCallback) candidates.push({ method: 'get', url: `${envCallback}${envCallback.includes('?') ? '&' : '?'}${q}` });

  let lastErr; const tried = [];
  for (const c of candidates) {
    try {
      console.log('[KAKAO EXCHANGE TRY]', c.method.toUpperCase(), c.url);
      tried.push(`${c.method.toUpperCase()} ${c.url}`);
      let res;
      if (c.method === 'post') res = await api.post(c.url, c.body);
      else res = await api.get(c.url);
      console.log('[KAKAO EXCHANGE OK]', res.status, c.url);
      return res.data;
    } catch (err) {
      const status = err?.response?.status;
      // If 404/403 on the primary endpoint, try the optional callback once; otherwise surface.
      if (status === 404 || status === 403) { lastErr = err; continue; }
      // For other errors, stop and surface
      throw err;
    }
  }
  const e = lastErr || new Error('No Kakao auth endpoint responded.');
  e.tried = tried;
  throw e;
}
