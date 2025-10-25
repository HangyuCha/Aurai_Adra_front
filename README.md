# Aurai_Adra_front
ADRA front 협업

## Kakao 로그인 설정

카카오 로그인을 사용하려면 아래 단계를 순서대로 진행하세요.

### 1) .env.local 설정

프로젝트 루트에 있는 `.env.example`를 참고해 `.env.local`에 카카오 자바스크립트 키를 추가하고 개발 서버를 재시작하세요.

```
VITE_KAKAO_APP_KEY=여기_카카오_자바스크립트_키
```

선택: Kakao SDK 무결성(SRI)을 사용하는 경우 아래도 설정합니다. 값은 카카오 SDK 버전에 맞는 정확한 해시여야 합니다.

```
# VITE_KAKAO_SDK_INTEGRITY=sha384-...
```

메모: Vite 환경 변수 변경 후에는 반드시 개발 서버를 재시작해야 적용됩니다.

### 2) Kakao Developers 콘솔 설정

카카오 개발자 콘솔에서 다음을 등록합니다.

- 플랫폼 > Web 플랫폼 추가: `http://localhost:5173` (개발 환경)
- JavaScript 키 확인: (해당 키를 `.env.local`에 설정)
- Redirect URI 등록: `/login/kakao/callback`
	- 예: `http://localhost:5173/login/kakao/callback`
	- 운영 환경 도메인도 동일 경로로 추가

### 3) 빠른 로컬 테스트(선택)

만약 `.env.local` 설정 없이 빠르게 테스트하고 싶다면 브라우저 콘솔(F12)에서 아래 중 하나를 실행하고 새로고침하세요.

```js
// localStorage 이용
localStorage.setItem('DEV_KAKAO_APP_KEY', '여기_카카오_자바스크립트_키');

// 또는 전역 주입 (페이지 새로고침 전까지 유효)
window._KAKAO_APP_KEY = '여기_카카오_자바스크립트_키';
```

앱은 순서대로 키를 찾습니다: `.env.local` → `window._KAKAO_APP_KEY` → `localStorage("DEV_KAKAO_APP_KEY")`.

### 4) 동작 흐름

- 로그인 화면에서 "카카오톡으로 로그인" 버튼 클릭 → Kakao.Auth.authorize → 카카오 동의 화면 → Redirect to `/login/kakao/callback`
- 콜백 페이지에서 서버에 코드 교환 요청(`POST /auth/kakao` 등) → 앱 토큰 저장 → `/intro`로 이동

백엔드 교환 엔드포인트는 `src/lib/auth.js`의 `exchangeKakaoCode()`에서 후보들을 순차 시도합니다. 서버 확정 후 한 경로로 고정해도 됩니다.

### 5) 문제 해결 팁

- SDK 로드 실패: 네트워크, 애드블록, 무결성(SRI) 값 불일치 여부 확인
- "앱 키 미설정" 경고: `.env.local` 또는 콘솔 주입/로컬스토리지 값 확인 후 새로고침
- Kakao 콘솔 401/403: 등록된 도메인/리다이렉트 URI가 정확한지 확인
- 코드 교환 실패(404): 백엔드 라우팅 경로 확인 (`/auth/kakao`, `/auth/kakao/callback`, `/users/kakao` 중 실제 사용 경로)

