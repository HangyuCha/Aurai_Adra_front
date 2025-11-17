import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import steps from './GptWhatLessonSteps.js';

// 간단한 노인 친화 뷰: 폰 프레임 제거, 글씨 크게, 이전/다음 버튼
export default function GptWhatLesson(){
  const [step, setStep] = useState(1);
  const total = steps.length || 1;
  const navigate = useNavigate();
  const current = steps.find(s => s.id === step) || steps[0];

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <header style={{ marginBottom: 12, textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>GPT란?</h1>
        <p style={{ fontSize: 16, margin: '8px 0 0', color: '#333' }}>소개와 접속·로그인 안내</p>
      </header>

      <main style={{ background: '#fff', padding: 28, borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 22, marginTop: 0 }}>{current.title}</h2>
        <div style={{ fontSize: 20, lineHeight: '1.8', color: '#111', whiteSpace: 'pre-wrap' }}>
          {current.instruction}
        </div>
      </main>

      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
        <div style={{ fontSize: 16 }}> {step} / {total} 단계</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => { if(step > 1) setStep(s => s - 1); else navigate('/gpt/learn'); }}
            style={{ padding: '10px 18px', fontSize: 18, borderRadius: 8, border: '1px solid #ccc', background: '#fff' }}
          >이전</button>
          {step < total ? (
            <button
              onClick={() => setStep(s => Math.min(total, s + 1))}
              style={{ padding: '10px 18px', fontSize: 18, borderRadius: 8, border: 'none', background: '#2b7cff', color: '#fff' }}
            >다음</button>
          ) : (
            <button
              onClick={() => navigate('/gpt/learn')}
              style={{ padding: '10px 18px', fontSize: 18, borderRadius: 8, border: 'none', background: '#1da23a', color: '#fff' }}
            >완료</button>
          )}
        </div>
      </footer>
    </div>
  );
}
