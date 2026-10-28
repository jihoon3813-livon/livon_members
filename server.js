const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// 1. .env 및 .env.local 파싱 (외부 라이브러리 없이 직접 파싱)
function loadEnvFile(envPath) {
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}
loadEnvFile(path.join(__dirname, '.env.local'));
loadEnvFile(path.join(__dirname, '.env'));

let PORT = parseInt(process.env.PORT || '8080', 10);
const DIST_DIR = path.join(__dirname, 'dist');
const DATA_DIR = path.join(__dirname, 'data');
const CONSULT_FILE = path.join(DATA_DIR, 'consultations.json');

// Convex Site URL 추론 (CONVEX_SITE_URL 또는 CONVEX_URL 기반)
let CONVEX_SITE_URL = process.env.CONVEX_SITE_URL;
if (!CONVEX_SITE_URL && process.env.CONVEX_URL) {
  // https://<project>.convex.cloud -> https://<project>.convex.site
  CONVEX_SITE_URL = process.env.CONVEX_URL.replace('.convex.cloud', '.convex.site');
}

// data 디렉토리 및 상담 저장 파일 준비 (로컬 폴백용)
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CONSULT_FILE)) {
    fs.writeFileSync(CONSULT_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
} catch (e) {
  // 읽기 전용 파일시스템(서버리스 환경) 무시
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

// 로컬 JSON 파일에 상담 저장 헬퍼 함수
function saveLocalConsultation(payload) {
  const newConsultation = {
    id: 'C-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    plan: payload.plan || 'undecided',
    interests: Array.isArray(payload.interests) ? payload.interests : [],
    combo: payload.combo || null,
    createdAt: new Date().toISOString()
  };

  let consultations = [];
  try {
    const fileContent = fs.readFileSync(CONSULT_FILE, 'utf-8');
    consultations = JSON.parse(fileContent || '[]');
  } catch (e) {
    consultations = [];
  }

  consultations.unshift(newConsultation);
  fs.writeFileSync(CONSULT_FILE, JSON.stringify(consultations, null, 2), 'utf-8');
  return newConsultation;
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API 라우팅: POST /api/consult (상담 신청 저장)
  if (pathname === '/api/consult' && req.method === 'POST') {
    const chunks = [];
    let totalLength = 0;

    req.on('data', chunk => {
      chunks.push(chunk);
      totalLength += chunk.length;
      if (totalLength > 1e6) req.destroy();
    });

    req.on('end', async () => {
      try {
        const body = Buffer.concat(chunks).toString('utf-8');
        const payload = JSON.parse(body || '{}');
        const { name, phone, consent } = payload;

        if (!name || !phone || !consent) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({
            success: false,
            message: '이름, 연락처, 개인정보 수집 동의는 필수 항목입니다.'
          }));
          return;
        }

        // 1순위: Convex 백엔드로 전달 (CONVEX_SITE_URL이 설정된 경우)
        if (CONVEX_SITE_URL) {
          try {
            const convexUrl = new URL('/api/consult', CONVEX_SITE_URL);
            const convexReq = (convexUrl.protocol === 'https:' ? https : http).request(convexUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Length': Buffer.byteLength(body)
              }
            }, (convexRes) => {
              let convexData = '';
              convexRes.on('data', c => convexData += c);
              convexRes.on('end', () => {
                res.writeHead(convexRes.statusCode || 200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(convexData);
              });
            });

            convexReq.on('error', (err) => {
              console.warn('[Convex 연결 실패, 로컬 저장소로 저장합니다]', err.message);
              const localSaved = saveLocalConsultation(payload);
              res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({
                success: true,
                consultationId: localSaved.id,
                message: '상담 신청이 접수되었습니다. (로컬 백업 저장)'
              }));
            });

            convexReq.write(body);
            convexReq.end();
            return;
          } catch (e) {
            console.warn('[Convex 포워딩 예외, 로컬로 폴백합니다]', e.message);
          }
        }

        // 2순위 (기본 로컬 저장소)
        const localSaved = saveLocalConsultation(payload);
        console.log(`[신규 상담 접수] ${localSaved.createdAt} | ${localSaved.name} (${localSaved.phone}) | 상품: ${localSaved.plan}`);

        res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: true,
          consultationId: localSaved.id,
          message: '상담 신청이 정상적으로 접수되었습니다. 전문 상담사가 확인 후 순차적으로 연락드리겠습니다.'
        }));
      } catch (err) {
        console.error('상담 접수 처리 중 오류:', err);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: false,
          message: '서버 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
        }));
      }
    });
    return;
  }

  // API 라우팅: GET /api/consult (상담 내역 조회)
  if (pathname === '/api/consult' && req.method === 'GET') {
    try {
      const fileContent = fs.readFileSync(CONSULT_FILE, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(fileContent);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, message: '상담 내역을 읽어오지 못했습니다.' }));
    }
    return;
  }

  // 정적 파일 서빙
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(DIST_DIR, safePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

function startServer(port) {
  server.listen(port, () => {
    console.log(`====================================================`);
    console.log(`  리본케어 웹 서버가 구동되었습니다!`);
    console.log(`  로컬 사이트: http://localhost:${port}`);
    if (CONVEX_SITE_URL) {
      console.log(`  연결된 Convex 백엔드: ${CONVEX_SITE_URL}`);
    } else {
      console.log(`  Convex: 연결 대기 중 (npx convex dev 실행 시 자동 연동)`);
    }
    console.log(`====================================================`);
  });
}

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    PORT++;
    startServer(PORT);
  } else {
    console.error('서버 오류 발생:', e);
  }
});

if (require.main === module) {
  startServer(PORT);
}

module.exports = server;
