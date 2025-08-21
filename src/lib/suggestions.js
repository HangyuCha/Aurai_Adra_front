// 로컬 스토리지 기반 간단한 건의사항 저장 유틸
const KEY = 'suggestions';

export function getSuggestions() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch (e) {
    console.error('getSuggestions error', e);
    return [];
  }
}

function save(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function addSuggestion({ title, content, author }) {
  const list = getSuggestions();
  const now = new Date().toISOString();
  const item = {
    id: crypto.randomUUID(),
    title: title.trim(),
    content: content.trim(),
    author,
    createdAt: now,
    updatedAt: now,
  };
  list.unshift(item); // 최신이 위로
  save(list);
  return item;
}

export function getSuggestion(id) {
  return getSuggestions().find(s => s.id === id) || null;
}

export function updateSuggestion(id, fields) {
  const list = getSuggestions();
  const idx = list.findIndex(s => s.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...fields, updatedAt: new Date().toISOString() };
  save(list);
  return list[idx];
}

export function deleteSuggestion(id) {
  const list = getSuggestions();
  const next = list.filter(s => s.id !== id);
  save(next);
  return list.length !== next.length;
}
