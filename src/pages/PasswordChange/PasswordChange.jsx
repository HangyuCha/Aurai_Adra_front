import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton/BackButton';
import styles from './passwordChange.module.css';

export default function PasswordChangePage(){
  const navigate = useNavigate();
  // 로그인 가드
  useEffect(()=>{
    const token = localStorage.getItem('accessToken');
    if(!token){
      alert('로그인이 필요합니다.');
      navigate('/login', { replace:true });
    }
  },[navigate]);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [msg, setMsg] = useState('');
  const canSubmit = newPw.length >= 4 && newPw === confirmPw && currentPw.length > 0;

  const onSubmit = (e) => {
    e.preventDefault();
    const stored = localStorage.getItem('userPassword');
    if(!stored){ return setMsg('저장된 비밀번호가 없습니다. 먼저 회원가입/로그인을 완료하세요.'); }
    if(currentPw !== stored){ return setMsg('현재 비밀번호가 일치하지 않습니다.'); }
    if(newPw.length < 4){ return setMsg('새 비밀번호는 4자 이상이어야 합니다.'); }
    if(newPw !== confirmPw){ return setMsg('새 비밀번호 확인이 일치하지 않습니다.'); }
    localStorage.setItem('userPassword', newPw);
    setMsg('비밀번호가 변경되었습니다.');
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    // UX: 1.2초 뒤 이전 페이지 혹은 me로
    setTimeout(()=>{ navigate('/me'); }, 1200);
  };

  return (
    <div className={styles.stage}>
      <BackButton to="/me" replace />
      <div className={styles.card}>
        <h1 className={styles.title}>비밀번호 변경</h1>
        <form onSubmit={onSubmit} className={styles.form}>
          <label className={styles.lbl} htmlFor="curPw">현재 비밀번호</label>
          <input id="curPw" type="password" value={currentPw} onChange={e=>{setCurrentPw(e.target.value); setMsg('');}} className={styles.input} placeholder="현재 비밀번호" />
          <label className={styles.lbl} htmlFor="newPw">새 비밀번호</label>
          <input id="newPw" type="password" value={newPw} onChange={e=>{setNewPw(e.target.value); setMsg('');}} className={styles.input} placeholder="4자 이상" minLength={4} />
          <label className={styles.lbl} htmlFor="cfPw">새 비밀번호 확인</label>
            <input id="cfPw" type="password" value={confirmPw} onChange={e=>{setConfirmPw(e.target.value); setMsg('');}} className={styles.input} placeholder="다시 입력" minLength={4} />
          <button type="submit" disabled={!canSubmit} className={styles.primary}>변경</button>
          <p className={styles.msg} role="alert">{msg}</p>
        </form>
      </div>
    </div>
  );
}
