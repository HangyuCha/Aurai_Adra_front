# Kakao OAuth Integration Contract (Frontend ↔ Backend)

This doc defines the minimal API contract so backend can be developed in a separate repo while the frontend remains unchanged.

## 1) OAuth Code Exchange

- Method/Path: POST `/api/auth/kakao`
- Request (JSON):
  {
    "code": "<kakao_auth_code>",
    "redirectUri": "http://localhost:5174/login/kakao/callback"
  }
- Response (200 JSON):
  {
    "accessToken": "<app_jwt>",
    "nickname": "optional",
    "ageRange": "optional e.g. 20s",
    "gender": "optional e.g. male|female"
  }

Notes:
- `accessToken` is our app token (JWT or similar), not Kakao's.
- Endpoint should be `permitAll` and CSRF-exempt if CSRF is enabled.
- CORS must allow Origin `http://localhost:5174` (dev) and the prod origin.

## 2) First-time Signup (optional enrichment)

- Method/Path: POST `/api/users/register`
- Request (JSON):
  {
    "nickname": "<string>",
    "password": "<string>",
    "gender": "male|female",
    "ageRange": "10s|20s|...",
    // optional when signing up right after Kakao
    "oauthProvider": "kakao",          // optional
    "oauthAccessToken": "<kakao_token>" // optional
  }
- Response:
  - 201 Created (or 200 OK) and optionally return { "accessToken": "<app_jwt>" }

Notes:
- If `oauthAccessToken` is present, backend may use it to fetch Kakao profile and
  link the Kakao user id with our user record.

## 3) Security/CORS recommendations (Spring Boot)

- SecurityFilterChain
  - CSRF: ignore `/api/auth/kakao`, `/api/users/register`
  - Authorize: `permitAll()` for the above paths
  - CORS: enabled
- CORS configuration
  - Allowed origins: `http://localhost:5174` (dev), prod origin
  - Allowed methods: `GET,POST,PUT,DELETE,OPTIONS`
  - Allowed headers: `Content-Type,Authorization`

## 4) Frontend behavior summary

- Frontend calls POST `/api/auth/kakao` with `code` and `redirectUri`.
- If backend returns `accessToken`, the user is logged in and redirected to `/intro`.
- If backend chooses to require extra signup info first, frontend navigates to `/signup` and then POSTs `/api/users/register`.

## 5) Dev-only mocks (frontend)

- Disabled by default. To enable for UI prototyping:
  - `.env.local`: set `DEV_KAKAO_EXCHANGE=1` and `KAKAO_REST_KEY=<rest_key>`
  - Optional: `DEV_MOCK_REGISTER=1` to mock `POST /api/users/register`
- Remove or keep disabled for real backend tests.
