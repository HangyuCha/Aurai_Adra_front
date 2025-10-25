// Kakao JS SDK loader and initializer for Vite (React)
// Usage: const Kakao = await loadKakao(); Kakao.Auth.authorize({ redirectUri })

const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.5.0/kakao.min.js';
// Optional SRI: set VITE_KAKAO_SDK_INTEGRITY to enable. If not set, no integrity is applied to avoid mismatch failures.
const KAKAO_SDK_INTEGRITY = import.meta.env.VITE_KAKAO_SDK_INTEGRITY;

let sdkLoading;

// Resolve app key from multiple sources so local dev works even without .env
export function resolveKakaoAppKey() {
  // Priority: Vite env -> window runtime injection -> localStorage fallback
  let envKey;
  try { envKey = import.meta.env?.VITE_KAKAO_APP_KEY; } catch { /* ignore */ }
  const win = typeof window !== 'undefined' ? window : undefined;
  const injected = win?.['_KAKAO_APP_KEY'];
  const stored = win?.localStorage?.getItem('DEV_KAKAO_APP_KEY');
  return envKey || injected || stored;
}

export async function loadKakao(appKey) {
  if (!appKey) appKey = resolveKakaoAppKey();
  if (!appKey) {
    throw new Error('VITE_KAKAO_APP_KEY is not set. Configure it in your environment.');
  }

  // If already loaded and initialized
  if (typeof window !== 'undefined' && window.Kakao) {
    const K = window.Kakao;
    if (!K.isInitialized?.()) {
      K.init(appKey);
    }
    return K;
  }

  if (!sdkLoading) {
    sdkLoading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = KAKAO_SDK_URL;
      s.async = true;
  s.crossOrigin = 'anonymous';
  if (KAKAO_SDK_INTEGRITY) s.integrity = KAKAO_SDK_INTEGRITY;
      s.onload = () => {
        try {
          if (!window.Kakao) return reject(new Error('Kakao SDK failed to load.'));
          const K = window.Kakao;
          if (!K.isInitialized?.()) K.init(appKey);
          resolve(K);
        } catch (e) { reject(e); }
      };
      s.onerror = () => reject(new Error('Failed to load Kakao SDK script.'));
      document.head.appendChild(s);
    });
  }
  return sdkLoading;
}

export function getKakao() {
  return (typeof window !== 'undefined' ? window.Kakao : undefined);
}
