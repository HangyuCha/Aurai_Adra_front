// 공용 axios 인스턴스 + 디버그 로깅
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
});

api.interceptors.request.use(cfg => {
  const raw = localStorage.getItem('accessToken');
  if (raw) {
    const token = raw.replace(/^"|"$/g, '');
    cfg.headers.Authorization = `Bearer ${token}`;
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
