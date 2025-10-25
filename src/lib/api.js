// 공용 axios 인스턴스 + 디버그 로깅
import axios from 'axios';

const api = axios.create({
  // Use relative base URL; in dev/preview proxy '/api' to backend; in production deploy behind same origin
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use(cfg => {
  const url = (cfg.url || '').toString();
  const isKakaoExchange = /(\/auth\/kakao(\/callback)?|\/users\/kakao(\/callback)?|\/oauth2?\/kakao(\/callback)?|\/login\/oauth2\/code\/kakao)/.test(url);
  if (!isKakaoExchange) {
    const raw = localStorage.getItem('accessToken');
    if (raw) {
      const token = raw.replace(/^"|"$/g, '');
      const looksJwt = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(token);
      if (looksJwt) {
        cfg.headers.Authorization = `Bearer ${token}`;
      }
    }
  } else if (cfg.headers && 'Authorization' in cfg.headers) {
    delete cfg.headers.Authorization;
  }
  console.log('[API REQ]', cfg.method?.toUpperCase(), cfg.url, 'auth?=', !!cfg.headers.Authorization);
  return cfg;
});

api.interceptors.response.use(
  res => {
    console.log('[API RES]', res.status, res.config.url);
    return res;
  },
  err => {
    console.log('[API ERR]', err.config?.url, err.response?.status, err.message, err.response?.data);
    return Promise.reject(err);
  }
);

export default api;
