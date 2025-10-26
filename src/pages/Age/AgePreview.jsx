// src/pages/Age/AgePreview.jsx
import React, { useMemo, useRef, useState } from 'react';
import { AGE_STEPS, PRESET_AVATARS } from '../../lib/aging.js';

export default function AgePreview() {
  const [mode, setMode] = useState('preset'); // 'preset' | 'ai'
  const [gender, setGender] = useState('M'); // 'M' | 'F'
  const [fileUrl, setFileUrl] = useState(null);
  const fileInputRef = useRef(null);

  const images = useMemo(() => {
    if (mode === 'preset') {
      return AGE_STEPS.map((age) => ({ age, url: PRESET_AVATARS[gender][age] }));
    }
    return [];
  }, [mode, gender]);

  function onPickFile() {
    fileInputRef.current?.click();
  }

  function onFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setFileUrl(url);
  }

  async function downloadImage(url, filename) {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();
  }

  async function handleDownloadAll() {
    for (const { age, url } of images) {
      const fname = `avatar-${gender}-${age}.png`;
      await downloadImage(url, fname);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>아바타 에이징 미리보기</h1>
      <p style={{ color: '#666', marginBottom: 16 }}>
        업로드한 사진을 기반으로 한 AI 아바타 변환을 준비 중입니다. 지금은 프리셋 캐릭터로 20~80대를 미리 볼 수 있어요.
      </p>

      <section style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
          <button
            onClick={() => setMode('preset')}
            style={{ padding: '8px 12px', background: mode === 'preset' ? '#111' : '#fff', color: mode === 'preset' ? '#fff' : '#111' }}
          >
            프리셋
          </button>
          <button
            onClick={() => setMode('ai')}
            style={{ padding: '8px 12px', background: mode === 'ai' ? '#111' : '#fff', color: mode === 'ai' ? '#fff' : '#111', borderLeft: '1px solid #ddd' }}
          >
            AI (준비중)
          </button>
        </div>

        <div style={{ display: 'inline-flex', border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
          <button
            onClick={() => setGender('M')}
            style={{ padding: '8px 12px', background: gender === 'M' ? '#111' : '#fff', color: gender === 'M' ? '#fff' : '#111' }}
          >
            남성
          </button>
          <button
            onClick={() => setGender('F')}
            style={{ padding: '8px 12px', background: gender === 'F' ? '#111' : '#fff', color: gender === 'F' ? '#fff' : '#111', borderLeft: '1px solid #ddd' }}
          >
            여성
          </button>
        </div>

        <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
          <button onClick={onPickFile} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8 }}>내 사진 업로드</button>
          {fileUrl && (
            <img src={fileUrl} alt="preview" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
          )}
        </div>

        {mode === 'preset' && (
          <button onClick={handleDownloadAll} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8 }}>
            전체 저장 (다운로드)
          </button>
        )}
      </section>

      {mode === 'ai' && (
        <div style={{ padding: 12, background: '#fff6e5', border: '1px solid #ffd18a', borderRadius: 8, marginBottom: 16 }}>
          <strong>AI 변환</strong>
          <div style={{ fontSize: 14, color: '#444', marginTop: 6 }}>
            • 서버(백엔드) 연결이 필요합니다. 업로드한 사진을 서버로 전송하여 연령대별(20~80)로 변환한 뒤 저장/반환합니다.
            <br />• 저장 위치: 개발 단계에서는 로컬(public/generated), 운영에서는 S3/Supabase 같은 클라우드 스토리지 권장.
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
        {images.map(({ age, url }) => (
          <figure key={age} style={{ margin: 0, border: '1px solid #eee', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
            <div style={{ position: 'relative', width: '100%', paddingTop: '100%', background: '#fafafa' }}>
              <img
                src={url}
                alt={`${age}대 ${gender === 'M' ? '남성' : '여성'} 아바타`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <figcaption style={{ padding: 8, fontSize: 14, textAlign: 'center' }}>{age}대</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
