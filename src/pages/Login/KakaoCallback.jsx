import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeKakaoCode } from '../../lib/auth';

export default function KakaoCallback(){
  const navigate = useNavigate();
  const [msg, setMsg] = useState('카카오 인증 처리 중...');
  const ranRef = useRef(false);

  useEffect(()=>{
    if (ranRef.current) return; // StrictMode double-invoke guard
    ranRef.current = true;
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    const redirectUri = `${window.location.origin}/login/kakao/callback`;
    const codeKey = code ? `kakao_code_${code}` : undefined;
    (async ()=>{
      try {
        if (error) throw new Error(`${error}: ${errorDescription||''}`);
        if (!code) throw new Error('인가 코드가 없습니다. 로그인 화면에서 다시 시도하세요.');
        // Ensure single processing per code (page reload or StrictMode)
        if (codeKey && sessionStorage.getItem(codeKey)) {
          setMsg('이미 처리된 인증 코드입니다. 홈으로 이동합니다...');
          navigate('/home', { replace:true });
          return;
        }
        setMsg('서버에 로그인 요청 중...');
        const data = await exchangeKakaoCode(code, redirectUri);
        const { accessToken, token, nickname, ageRange, gender, oauthProvider, oauthAccessToken, profile } = data || {};
        const final = accessToken || token;
        if (final) {
          localStorage.setItem('accessToken', final);
          if (nickname) localStorage.setItem('nickname', nickname);
          if (ageRange) localStorage.setItem('ageRange', ageRange);
          if (gender) localStorage.setItem('gender', gender);
          if (codeKey) sessionStorage.setItem(codeKey, '1');
          navigate('/intro', { replace:true });
          return;
        }
        // No app token: treat as first-time OAuth → go to signup with prefill
        if (oauthProvider === 'kakao' && oauthAccessToken) {
          const pf = profile || {};
          const pending = { provider: 'kakao', accessToken: oauthAccessToken, profile: pf };
          sessionStorage.setItem('oauth_pending', JSON.stringify(pending));
          setMsg('처음 방문 사용자로 확인되어 회원가입으로 이동합니다...');
          if (codeKey) sessionStorage.setItem(codeKey, '1');
          // Prefill name/gender if available
          const prefill = {
            name: pf.nickname || '',
            gender: pf.gender || '',
          };
          navigate('/signup', { replace:true, state: { ...prefill, oauth: true } });
          return;
        }
        throw new Error('서버에서 토큰이 반환되지 않았습니다. (최초 로그인일 수 있습니다)');
      } catch(e){
        console.error('[KAKAO CALLBACK ERROR]', e?.response || e);
        const status = e?.response?.status;
        let detail = e?.response?.data?.message || e?.response?.data?.error || e.message;
        if (status === 403) {
          detail = '서버가 코드 교환 엔드포인트 접근을 차단했습니다(403). 백엔드 보안 설정 또는 경로 허용(permitAll) 확인 필요';
        }
        setMsg(`카카오 로그인 실패: ${detail}`);
        setTimeout(()=> navigate('/login', { replace:true }), 2200);
      }
    })();
  },[navigate]);

  return (
    <div style={{minHeight:'60vh',display:'grid',placeItems:'center',padding:'24px'}}>
      <p style={{fontFamily:'Jua, system-ui, sans-serif',fontSize:'20px',textAlign:'center'}}>{msg}</p>
    </div>
  );
}
