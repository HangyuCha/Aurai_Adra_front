
import api from './api';

// 건의사항 목록 조회
export async function getSuggestions() {
  const res = await api.get('/api/suggestions');
  return res.data;
}

// 건의사항 추가
export async function addSuggestion({ title, content, author }) {
  const res = await api.post('/api/suggestions', { title, content, author });
  return res.data;
}

// 건의사항 단일 조회
export async function getSuggestion(id) {
  const res = await api.get(`/api/suggestions/${id}`);
  return res.data;
}

// 건의사항 수정
export async function updateSuggestion(id, fields) {
  const res = await api.put(`/api/suggestions/${id}`, fields);
  return res.data;
}

// 건의사항 삭제
export async function deleteSuggestion(id) {
  const res = await api.delete(`/api/suggestions/${id}`);
  return res.data;
}
