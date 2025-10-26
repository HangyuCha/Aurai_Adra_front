/* eslint-env node */
import { defineConfig, loadEnv } from 'vite'
import { Buffer } from 'node:buffer'
import process from 'node:process'
import react from '@vitejs/plugin-react'

function kakaoDevExchangePlugin(env) {
  const REST_KEY = env.KAKAO_REST_KEY;
  const CLIENT_SECRET = env.KAKAO_CLIENT_SECRET;
  const ENABLED = env.DEV_KAKAO_EXCHANGE === '1';
  if (!ENABLED || !REST_KEY) {
    // Disabled unless explicitly enabled and REST key provided
    return { name: 'kakao-dev-exchange-disabled' };
  }
  return {
    name: 'kakao-dev-exchange',
    configureServer(server) {
      server.middlewares.use('/api/auth/kakao', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405; res.end('Method Not Allowed'); return;
        }
        try {
          const chunks = [];
          for await (const ch of req) chunks.push(ch);
          const bodyStr = Buffer.concat(chunks).toString('utf8') || '{}';
          let payload;
          try { payload = JSON.parse(bodyStr); } catch { payload = {}; }
          const { code, redirectUri } = payload || {};
          if (!code || !redirectUri) { res.statusCode = 400; res.end('Missing code/redirectUri'); return; }

          const form = new URLSearchParams();
          form.set('grant_type', 'authorization_code');
          form.set('client_id', REST_KEY);
          form.set('redirect_uri', redirectUri);
          form.set('code', code);
          if (CLIENT_SECRET) form.set('client_secret', CLIENT_SECRET);

          const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
            body: form.toString(),
          });
          if (!tokenRes.ok) {
            const errTxt = await tokenRes.text();
            res.statusCode = tokenRes.status; res.end(errTxt); return;
          }
          const tokenJson = await tokenRes.json();
          const accessToken = tokenJson.access_token;

          // Fetch user info to shape response for the app
          let nickname, ageRange, gender;
          try {
            const meRes = await fetch('https://kapi.kakao.com/v2/user/me', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (meRes.ok) {
              const me = await meRes.json();
              nickname = me?.kakao_account?.profile?.nickname || me?.properties?.nickname;
              ageRange = me?.kakao_account?.age_range;
              gender = me?.kakao_account?.gender;
            }
          } catch { /* ignore user info fetch errors */ }

          res.setHeader('Content-Type', 'application/json');
          // Dev-only response: return oauth token/profile; not an app token
          res.end(JSON.stringify({ oauthProvider: 'kakao', oauthAccessToken: accessToken, profile: { nickname, ageRange, gender } }));
        } catch (e) {
          res.statusCode = 500; res.end(`Kakao dev exchange error: ${e?.message || e}`);
        }
      });

      // Dev mock: user registration to bypass backend CORS during local testing
      if (env.DEV_MOCK_REGISTER === '1') {
        server.middlewares.use('/api/users/register', async (req, res) => {
          if (req.method === 'OPTIONS') {
            res.statusCode = 204; res.end(); return;
          }
          if (req.method !== 'POST') {
            res.statusCode = 405; res.end('Method Not Allowed'); return;
          }
          try {
            const chunks = [];
            for await (const ch of req) chunks.push(ch);
            const bodyStr = Buffer.concat(chunks).toString('utf8') || '{}';
            let payload;
            try { payload = JSON.parse(bodyStr); } catch { payload = {}; }
            const { nickname, password, gender, ageRange } = payload || {};
            if (!nickname || !password) { res.statusCode = 400; res.end('Missing fields'); return; }
            const user = { id: Date.now(), nickname, gender, ageRange };
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 201;
            res.end(JSON.stringify(user));
          } catch (e) {
            res.statusCode = 500; res.end(`Dev register error: ${e?.message || e}`);
          }
        });
      }
    }
  }
}

// Dev-only in-memory progress store for local testing (Do NOT use in production)
function progressDevMockPlugin(env) {
  const ENABLED = env.DEV_PROGRESS_MOCK === '1';
  if (!ENABLED) return { name: 'progress-dev-mock-disabled' };

  // In-memory store: userId -> Set(chapterId)
  /** @type {Map<string, Set<number>>} */
  const store = new Map();
  const TOTAL_CHAPTERS = Number.isFinite(Number(env.PROGRESS_TOTAL_CHAPTERS)) ? Number(env.PROGRESS_TOTAL_CHAPTERS) : 20;

  return {
    name: 'progress-dev-mock',
    configureServer(server) {
      server.middlewares.use('/api/progress/chapters', async (req, res) => {
        try {
          if (req.method === 'GET') {
            const m = req.url.match(/^\/api\/progress\/chapters\/(.+)$/);
            if (m) {
              const userId = decodeURIComponent(m[1]);
              const set = store.get(userId) || new Set();
              const successes = [...set].sort((a,b)=>a-b);
              const successCount = successes.length;
              res.setHeader('Content-Type','application/json');
              res.end(JSON.stringify({ userId, totalChapters: TOTAL_CHAPTERS, successes, successCount }));
              return;
            }
            res.statusCode = 404; res.end('Not Found'); return;
          }

          // parse body helper
          async function readJsonBody() {
            const chunks = [];
            for await (const ch of req) chunks.push(ch);
            const txt = Buffer.concat(chunks).toString('utf8') || '{}';
            try { return JSON.parse(txt); } catch { return {}; }
          }

          if (req.method === 'POST') {
            const body = await readJsonBody();
            const userId = String(body.userId || '');
            const chapterId = Number(body.chapterId);
            const success = Boolean(body.success);
            if (!userId || !Number.isFinite(chapterId)) { res.statusCode = 400; res.end('Missing userId/chapterId'); return; }
            const set = store.get(userId) || new Set();
            if (success) set.add(chapterId);
            store.set(userId, set);
            const successes = [...set].sort((a,b)=>a-b);
            const successCount = successes.length;
            res.setHeader('Content-Type','application/json');
            res.end(JSON.stringify({ userId, totalChapters: TOTAL_CHAPTERS, successes, successCount }));
            return;
          }

          if (req.method === 'DELETE') {
            const body = await readJsonBody();
            const userId = String(body.userId || '');
            const chapterId = Number(body.chapterId);
            if (!userId || !Number.isFinite(chapterId)) { res.statusCode = 400; res.end('Missing userId/chapterId'); return; }
            const set = store.get(userId) || new Set();
            set.delete(chapterId);
            store.set(userId, set);
            const successes = [...set].sort((a,b)=>a-b);
            const successCount = successes.length;
            res.setHeader('Content-Type','application/json');
            res.end(JSON.stringify({ userId, totalChapters: TOTAL_CHAPTERS, successes, successCount }));
            return;
          }

          res.statusCode = 405; res.end('Method Not Allowed');
        } catch (e) {
          res.statusCode = 500; res.end(`Progress mock error: ${e?.message || e}`);
        }
      });
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), kakaoDevExchangePlugin(env), progressDevMockPlugin(env)],
    server: {
      port: 5174,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port: 5174,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
