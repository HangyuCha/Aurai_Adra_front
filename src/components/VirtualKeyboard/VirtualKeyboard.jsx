import React, { useState } from 'react';
import styles from './VirtualKeyboard.module.css';

// VirtualKeyboard with Korean jamo mode and numeric/symbol modes.
// Props:
// - onKey(char) : called when a character key is pressed
// - onBackspace() : called when backspace pressed
// - onEnter() : called when return pressed
// - className : optional
export default function VirtualKeyboard({onKey, onBackspace, onEnter, className='', allowEnglish=false}){
  const [mode, setMode] = useState('k'); // 'k' = korean, 'n' = number, 's' = symbol, 'e' = english
  const [shift, setShift] = useState(false);
  const lastLocalRef = React.useRef({ch:null, t:0});

  const SHIFT_MAP = {
    'ㄱ': 'ㄲ',
    'ㄷ': 'ㄸ',
    'ㅂ': 'ㅃ',
    'ㅅ': 'ㅆ',
    'ㅈ': 'ㅉ'
  };

  const jamoRows = [
    ['ㅂ','ㅈ','ㄷ','ㄱ','ㅅ','ㅛ','ㅕ','ㅑ','ㅐ','ㅔ'],
    ['ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ'],
    ['⇧','ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ','⌫'],
    ['123','space','return']
  ];

  const numRows = [
    ['1','2','3','4','5','6','7','8','9','0'],
    ['-','/',';',':','(',')','$','&','"','@'],
    ['#+=','.','\u3000',',','?','!','\'','⌫'],
    ['ABC','space','return']
  ];

  // simpler symbol layout (fallback) if needed
  const symRows = [
    ['~','`','!','@','#','$','%','^','&','*'],
    ['(',')','-','_','=','+','[',']','{','}'],
    ['\'','"',':',';','<','>','/','?','⌫'],
    ['ABC','space','return']
  ];

  const engRows = [
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l'],
    ['⇧','z','x','c','v','b','n','m','⌫'],
    ['123','space','한']
  ];

  // sanitize rows depending on mode
  const rows = mode === 'k' ? jamoRows : (mode === 'n' ? numRows : (mode === 'e' ? engRows : symRows));

  function handleKey(k){
    const nowLocal = Date.now();
    console.log('[VK] handleKey', k, nowLocal);
    if(lastLocalRef.current.ch === k && (nowLocal - lastLocalRef.current.t) < 200) {
      console.log('[VK] dedupe local', k);
      return;
    }
    lastLocalRef.current = {ch: k, t: nowLocal};
    if(k === '⌫') return onBackspace && onBackspace();
  if(k === 'return') return onEnter && onEnter();
    if(k === 'space') return onKey && onKey(' ');
  if(k === '123') { setMode('n'); return; }
  if(k === 'ABC') { setMode(allowEnglish ? 'e' : 'k'); return; }
  if(k === '#+=') { setMode('s'); return; }
  if(k === '한') { setMode('k'); return; }
    if(k === '⇧') { setShift(s => !s); return; }

    // apply shift mapping for double consonants (one-shot)
    let out = k;
    if(shift && SHIFT_MAP[k]){
      out = SHIFT_MAP[k];
    }
    // if shift was active, reset (one-shot behavior)
    if(shift) setShift(false);
    return onKey && onKey(out);
  }

  return (
    <div className={`${styles.keyboard} ${className}`.trim()} role="application" aria-label="가상 키보드">
      {rows.map((row, ri)=> (
        <div key={ri} className={styles.row}>
          {row.map((k, ki)=> (
            <button
              key={ki}
              className={`${styles.key} ${k==='space'?styles.space:''} ${k==='return'?styles.returnKey:''} ${k==='⌫'?styles.deleteKey:''} ${k==='⇧' && shift? styles.shiftActive : ''}`}
              onPointerDown={(e)=>{ e.preventDefault(); handleKey(k); }}
              onContextMenu={(e)=>e.preventDefault()}
              aria-label={k === 'space' ? 'space' : k}
            >
              {k === 'space' ? ' ' : k}
            </button>
          ))}
        </div>
      ))}
      <div style={{height:6}} />
    </div>
  );
}
