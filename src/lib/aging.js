// src/lib/aging.js
// 아바타 에이징 프리셋 및 향후 AI 연동 스텁

// 에이징 단계 (배움나이 시각화용)
export const AGE_STEPS = [20, 30, 40, 50, 60, 70, 80];

// 정적 자산 매핑 (vite는 정적 import 경로를 권장)
// 남성(M)
import A20M from '../assets/20M.png';
import A30M from '../assets/30M.png';
import A40M from '../assets/40M.png';
import A50M from '../assets/50M.png';
import A60M from '../assets/60M.png';
import A70M from '../assets/70M.png';
import A80M from '../assets/80M.png';

// 여성(F)
import A20F from '../assets/20F.png';
import A30F from '../assets/30F.png';
import A40F from '../assets/40F.png';
import A50F from '../assets/50F.png';
import A60F from '../assets/60F.png';
import A70F from '../assets/70F.png';
import A80F from '../assets/80F.png';

export const PRESET_AVATARS = {
  M: {
    20: A20M,
    30: A30M,
    40: A40M,
    50: A50M,
    60: A60M,
    70: A70M,
    80: A80M,
  },
  F: {
    20: A20F,
    30: A30F,
    40: A40F,
    50: A50F,
    60: A60F,
    70: A70F,
    80: A80F,
  },
};

export function getPresetAvatar(gender = 'M', age = 20) {
  const g = gender === 'F' ? 'F' : 'M';
  const a = AGE_STEPS.includes(age) ? age : 20;
  return PRESET_AVATARS[g][a];
}

// 향후 AI 변환 연동 스텁: 백엔드 API에 업로드하고 결과 URL 배열을 리턴
// 실제 구현 시:
// - 서버: 이미지 업로드 처리, AI 변환(예: Replicate Instant-ID + re-aging), 스토리지 저장(S3/Supabase)
// - 프론트: 아래 함수로 서버 엔드포인트 호출
export async function requestAgedAvatarsByAI(/* opts: { file: File, ages?: number[], signal?: AbortSignal } */) {
  // TODO: 백엔드 준비 전까지는 예외 처리
  // 서버 엔드포인트 예시: POST /api/ageify (multipart form-data: file, ages[])
  // const form = new FormData();
  // form.append('file', file);
  // ages.forEach((a) => form.append('ages[]', String(a)));
  // const res = await fetch('/api/ageify', { method: 'POST', body: form, signal });
  // if (!res.ok) throw new Error('AI 변환 실패');
  // return await res.json(); // { results: [{ age: 20, url: '...' }, ...] }

  throw new Error('AI 변환은 아직 연결되지 않았습니다. (백엔드 필요)');
}
