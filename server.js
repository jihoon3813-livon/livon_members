const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 1. .env 및 환경별 설정 파싱
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

// 환경 판별 (NODE_ENV=production 또는 APP_ENV=production 또는 --prod 플래그)
const isProduction = process.env.NODE_ENV === 'production' || 
                     process.env.APP_ENV === 'production' || 
                     process.argv.includes('--prod') || 
                     process.argv.includes('--production');
if (isProduction) {
  loadEnvFile(path.join(__dirname, '.env.production'));
} else {
  loadEnvFile(path.join(__dirname, '.env.development'));
}
loadEnvFile(path.join(__dirname, '.env.local'));
loadEnvFile(path.join(__dirname, '.env'));

let PORT = parseInt(process.env.PORT || '8080', 10);
const DIST_DIR = path.join(__dirname, 'dist');
const DATA_DIR = path.join(__dirname, 'data');
const CONSULT_FILE = path.join(DATA_DIR, 'consultations.json');
const ADMIN_CONFIG_FILE = path.join(DATA_DIR, 'admin_config.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics_logs.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'site_settings.json');

// Convex Site URL 설정 및 환경별 기본값 보장
let CONVEX_SITE_URL = process.env.CONVEX_SITE_URL;
if (!CONVEX_SITE_URL && process.env.CONVEX_URL) {
  CONVEX_SITE_URL = process.env.CONVEX_URL.replace('.convex.cloud', '.convex.site');
}
if (!CONVEX_SITE_URL) {
  CONVEX_SITE_URL = isProduction
    ? 'https://perceptive-pig-703.ap-southeast-2.convex.site'
    : 'https://loyal-peccary-567.ap-southeast-2.convex.site';
}

// 데이터 파일 초기화 헬퍼
function initDataFiles() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CONSULT_FILE)) {
      fs.writeFileSync(CONSULT_FILE, '[]', 'utf-8');
    }
    if (!fs.existsSync(ADMIN_CONFIG_FILE)) {
      const initialHash = crypto.createHash('sha256').update('admin1234').digest('hex');
      fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify({
        passwordHash: initialHash,
        updatedAt: new Date().toISOString(),
        siteTitle: '리본케어 관리자 시스템'
      }, null, 2), 'utf-8');
    }
    if (!fs.existsSync(REVIEWS_FILE)) {
      fs.writeFileSync(REVIEWS_FILE, '[]', 'utf-8');
    }
    if (!fs.existsSync(ANALYTICS_FILE)) {
      fs.writeFileSync(ANALYTICS_FILE, '[]', 'utf-8');
    }
  } catch (e) {
    console.error('데이터 파일 초기화 오류:', e);
  }
}
initDataFiles();

// 안전한 JSON 읽기/쓰기 헬퍼
function readJson(filePath, defaultVal = []) {
  try {
    if (!fs.existsSync(filePath)) return defaultVal;
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content || 'null') ?? defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error(`파일 쓰기 실패 (${filePath}):`, e);
    return false;
  }
}

// 메모리 세션 토큰 저장소 (토큰 -> 만료일시)
const authSessions = new Map();
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24시간

function generateToken() {
  const token = crypto.randomBytes(32).toString('hex');
  authSessions.set(token, Date.now() + SESSION_TTL);
  return token;
}

function isValidToken(token) {
  if (!token) return false;
  const expiresAt = authSessions.get(token);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    authSessions.delete(token);
    return false;
  }
  return true;
}

// IP 및 브라우저 파싱 헬퍼
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  let ip = req.socket.remoteAddress || '127.0.0.1';
  if (ip === '::1' || ip === '::ffff:127.0.0.1') ip = '127.0.0.1';
  return ip.replace(/^::ffff:/, '');
}

function parseUserAgent(ua = '') {
  let device = '데스크톱 (PC)';
  let browser = '기타 브라우저';

  const uaLower = ua.toLowerCase();
  if (/mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/i.test(ua)) {
    if (/iphone|ipod/i.test(ua)) device = '모바일 (iPhone)';
    else if (/android/i.test(ua)) device = '모바일 (Galaxy/Android)';
    else device = '모바일 기기';
  } else if (/ipad|tablet|android(?!.*mobile)/i.test(ua)) {
    device = '태블릿';
  } else if (/macintosh|mac os x/i.test(ua)) {
    device = '데스크톱 (Mac)';
  } else if (/windows/i.test(ua)) {
    device = '데스크톱 (Windows)';
  }

  if (/kakaotalk/i.test(ua)) browser = '카카오톡 인앱';
  else if (/instagram/i.test(ua)) browser = '인스타그램 인앱';
  else if (/samsungbrowser/i.test(ua)) browser = '삼성 인터넷';
  else if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';

  return { device, browser };
}

function categorizeReferrer(ref = '') {
  if (!ref || ref === 'direct' || ref.trim() === '') return '직접 접속/북마크';
  try {
    const url = new URL(ref);
    const host = url.hostname.toLowerCase();
    if (host.includes('naver.com')) {
      if (url.searchParams.get('query') || url.pathname.includes('search')) return '네이버 검색';
      if (host.includes('blog')) return '네이버 블로그';
      if (host.includes('cafe')) return '네이버 카페';
      return '네이버';
    }
    if (host.includes('google.com') || host.includes('google.co.kr')) return '구글 검색';
    if (host.includes('daum.net') || host.includes('kakao.com')) {
      if (host.includes('talk.kakao.com')) return '카카오톡 공유';
      return '다음/카카오';
    }
    if (host.includes('instagram.com')) return '인스타그램';
    if (host.includes('facebook.com')) return '페이스북';
    if (host.includes('youtube.com')) return '유튜브';
    return host;
  } catch (e) {
    return '기타 사이트';
  }
}

// 접속 로깅 헬퍼
function logVisit(ip, ref, ua, pathName = '/') {
  try {
    const { device, browser } = parseUserAgent(ua);
    const source = categorizeReferrer(ref);
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);

    const logs = readJson(ANALYTICS_FILE, []);
    const newLog = {
      id: 'LOG-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: now.toISOString(),
      date: dateStr,
      ip: ip,
      path: pathName,
      referrer: ref || 'direct',
      source: source,
      device: device,
      browser: browser
    };

    // 최대 3000건 유지
    logs.unshift(newLog);
    if (logs.length > 3000) logs.pop();
    writeJson(ANALYTICS_FILE, logs);
  } catch (e) {
    console.error('접속 로깅 중 예외:', e);
  }
}

// 로컬 JSON 파일에 상담 저장 헬퍼
function saveLocalConsultation(payload) {
  const newConsultation = {
    id: 'C-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    plan: payload.plan || 'undecided',
    interests: Array.isArray(payload.interests) ? payload.interests : [],
    combo: payload.combo || null,
    status: '접수',
    adminMemo: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const consultations = readJson(CONSULT_FILE, []);
  consultations.unshift(newConsultation);
  writeJson(CONSULT_FILE, consultations);
  return newConsultation;
}

// MIME 타입 매핑
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

// Request Body 파싱 유틸
function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let len = 0;
    req.on('data', chunk => {
      chunks.push(chunk);
      len += chunk.length;
      if (len > 5 * 1024 * 1024) { // 5MB 제한
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf-8');
        resolve(text ? JSON.parse(text) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

// JSON 응답 유틸
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// 인증 검사 유틸
function requireAuth(req, res) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!isValidToken(token)) {
    sendJson(res, 401, { success: false, message: '관리자 인증이 필요하거나 세션이 만료되었습니다.' });
    return false;
  }
  return true;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // CORS 프리플라이트
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  /* ========================================================
     1. 공개 API 라우트
     ======================================================== */

  // 방문자 통계 트래킹 API (클라이언트가 명시적으로 상세 정보 전송 시)
  if (pathname === '/api/track' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const ip = getClientIp(req);
      const ref = body.referrer || req.headers['referer'] || 'direct';
      const ua = req.headers['user-agent'] || '';
      logVisit(ip, ref, ua, body.path || '/');
      sendJson(res, 200, { success: true });
    } catch (e) {
      sendJson(res, 400, { success: false });
    }
    return;
  }

  // 고객 상담 신청 API: POST /api/consult
  if (pathname === '/api/consult' && req.method === 'POST') {
    try {
      const payload = await parseBody(req);
      const { name, phone, consent } = payload;

      if (!name || !phone || !consent) {
        sendJson(res, 400, {
          success: false,
          message: '이름, 연락처, 개인정보 수집 동의는 필수 항목입니다.'
        });
        return;
      }

      // Convex 백엔드가 설정되어 있는 경우
      if (CONVEX_SITE_URL) {
        try {
          const bodyStr = JSON.stringify(payload);
          const convexUrl = new URL('/api/consult', CONVEX_SITE_URL);
          const convexReq = (convexUrl.protocol === 'https:' ? https : http).request(convexUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Content-Length': Buffer.byteLength(bodyStr)
            }
          }, (convexRes) => {
            let convexData = '';
            convexRes.on('data', c => convexData += c);
            convexRes.on('end', () => {
              // 로컬에도 백업 저장
              saveLocalConsultation(payload);
              res.writeHead(convexRes.statusCode || 200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(convexData);
            });
          });

          convexReq.on('error', (err) => {
            console.warn('[Convex 연결 실패, 로컬로 저장합니다]', err.message);
            const localSaved = saveLocalConsultation(payload);
            sendJson(res, 201, {
              success: true,
              consultationId: localSaved.id,
              message: '상담 신청이 접수되었습니다. (로컬 백업 저장)'
            });
          });

          convexReq.write(bodyStr);
          convexReq.end();
          return;
        } catch (e) {
          console.warn('[Convex 포워딩 예외, 로컬로 폴백합니다]', e.message);
        }
      }

      // 기본 로컬 저장
      const localSaved = saveLocalConsultation(payload);
      console.log(`[신규 상담 접수] ${localSaved.createdAt} | ${localSaved.name} (${localSaved.phone}) | 플랜: ${localSaved.plan}`);
      sendJson(res, 201, {
        success: true,
        consultationId: localSaved.id,
        message: '상담 신청이 정상적으로 접수되었습니다. 전문 상담사가 확인 후 순차적으로 연락드리겠습니다.'
      });
    } catch (err) {
      console.error('상담 접수 처리 중 오류:', err);
      sendJson(res, 500, { success: false, message: '서버 처리 중 오류가 발생했습니다.' });
    }
    return;
  }

  // 공개 후기 목록 조회 API: GET /api/reviews
  if (pathname === '/api/reviews' && req.method === 'GET') {
    const reviews = readJson(REVIEWS_FILE, []);
    // 노출(isVisible !== false) 후기만 필터링하여 순서대로 정렬
    const visibleReviews = reviews
      .filter(r => r.isVisible !== false)
      .sort((a, b) => (a.order || 999) - (b.order || 999));
    sendJson(res, 200, { success: true, reviews: visibleReviews });
    return;
  }

  // 공개 사이트 설정(푸터/개인정보) 조회 API: GET /api/settings
  if (pathname === '/api/settings' && req.method === 'GET') {
    const settings = readJson(SETTINGS_FILE, {});
    sendJson(res, 200, { success: true, settings });
    return;
  }

  /* ========================================================
     2. 관리자 인증 API 라우트
     ======================================================== */

  // 관리자 로그인: POST /api/admin/login
  if (pathname === '/api/admin/login' && req.method === 'POST') {
    try {
      const { password } = await parseBody(req);
      const config = readJson(ADMIN_CONFIG_FILE, {});
      const inputHash = crypto.createHash('sha256').update(password || '').digest('hex');

      if (inputHash === config.passwordHash) {
        const token = generateToken();
        sendJson(res, 200, {
          success: true,
          token,
          expiresIn: SESSION_TTL,
          message: '로그인 성공'
        });
      } else {
        sendJson(res, 401, { success: false, message: '비밀번호가 올바르지 않습니다.' });
      }
    } catch (e) {
      sendJson(res, 500, { success: false, message: '로그인 처리 오류' });
    }
    return;
  }

  // 관리자 인증 세션 검증: GET /api/admin/check-auth
  if (pathname === '/api/admin/check-auth' && req.method === 'GET') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (isValidToken(token)) {
      sendJson(res, 200, { success: true, authenticated: true });
    } else {
      sendJson(res, 401, { success: false, authenticated: false });
    }
    return;
  }

  // 관리자 로그아웃: POST /api/admin/logout
  if (pathname === '/api/admin/logout' && req.method === 'POST') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token) authSessions.delete(token);
    sendJson(res, 200, { success: true, message: '로그아웃되었습니다.' });
    return;
  }

  // 관리자 비밀번호 변경: POST /api/admin/change-password
  if (pathname === '/api/admin/change-password' && req.method === 'POST') {
    if (!requireAuth(req, res)) return;
    try {
      const { currentPassword, newPassword } = await parseBody(req);
      if (!newPassword || newPassword.length < 4) {
        sendJson(res, 400, { success: false, message: '새 비밀번호는 최소 4자 이상이어야 합니다.' });
        return;
      }

      const config = readJson(ADMIN_CONFIG_FILE, {});
      const curHash = crypto.createHash('sha256').update(currentPassword || '').digest('hex');
      if (curHash !== config.passwordHash) {
        sendJson(res, 400, { success: false, message: '현재 비밀번호가 일치하지 않습니다.' });
        return;
      }

      config.passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');
      config.updatedAt = new Date().toISOString();
      writeJson(ADMIN_CONFIG_FILE, config);

      sendJson(res, 200, { success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (e) {
      sendJson(res, 500, { success: false, message: '비밀번호 변경 처리 오류' });
    }
    return;
  }

  /* ========================================================
     3. 관리자 상담 내역 API 라우트
     ======================================================== */

  // 상담 내역 전체 조회: GET /api/admin/consultations
  if (pathname === '/api/admin/consultations' && req.method === 'GET') {
    if (!requireAuth(req, res)) return;
    const consultations = readJson(CONSULT_FILE, []);
    sendJson(res, 200, { success: true, consultations });
    return;
  }

  // 상담 상태 및 메모 수정: PATCH /api/admin/consultations/:id
  const matchConsultId = pathname.match(/^\/api\/admin\/consultations\/([^/]+)$/);
  if (matchConsultId && req.method === 'PATCH') {
    if (!requireAuth(req, res)) return;
    try {
      const consultId = matchConsultId[1];
      const body = await parseBody(req);
      const consultations = readJson(CONSULT_FILE, []);
      const item = consultations.find(c => c.id === consultId);

      if (!item) {
        sendJson(res, 404, { success: false, message: '상담 내역을 찾을 수 없습니다.' });
        return;
      }

      if (body.status !== undefined) item.status = body.status;
      if (body.adminMemo !== undefined) item.adminMemo = body.adminMemo;
      item.updatedAt = new Date().toISOString();

      writeJson(CONSULT_FILE, consultations);
      sendJson(res, 200, { success: true, consultation: item, message: '수정되었습니다.' });
    } catch (e) {
      sendJson(res, 500, { success: false, message: '상담 수정 처리 오류' });
    }
    return;
  }

  // 상담 내역 삭제: DELETE /api/admin/consultations/:id
  if (matchConsultId && req.method === 'DELETE') {
    if (!requireAuth(req, res)) return;
    try {
      const consultId = matchConsultId[1];
      let consultations = readJson(CONSULT_FILE, []);
      const initialLength = consultations.length;
      consultations = consultations.filter(c => c.id !== consultId);

      if (consultations.length === initialLength) {
        sendJson(res, 404, { success: false, message: '삭제할 상담 내역을 찾을 수 없습니다.' });
        return;
      }

      writeJson(CONSULT_FILE, consultations);
      sendJson(res, 200, { success: true, message: '상담 내역이 삭제되었습니다.' });
    } catch (e) {
      sendJson(res, 500, { success: false, message: '상담 삭제 처리 오류' });
    }
    return;
  }

  /* ========================================================
     4. 관리자 실제 후기 관리 API 라우트
     ======================================================== */

  // 전체 후기 목록 조회: GET /api/admin/reviews
  if (pathname === '/api/admin/reviews' && req.method === 'GET') {
    if (!requireAuth(req, res)) return;
    const reviews = readJson(REVIEWS_FILE, []);
    sendJson(res, 200, { success: true, reviews });
    return;
  }

  // 신규 후기 등록: POST /api/admin/reviews
  if (pathname === '/api/admin/reviews' && req.method === 'POST') {
    if (!requireAuth(req, res)) return;
    try {
      const body = await parseBody(req);
      const reviews = readJson(REVIEWS_FILE, []);

      const newReview = {
        id: 'REV-' + Date.now().toString(36).toUpperCase(),
        category: body.category || 'care',
        planBadge: body.planBadge || '라이프케어 160',
        usedBadge: body.usedBadge || '맞춤 케어',
        verified: body.verified !== false,
        rating: Number(body.rating) || 5.0,
        title: (body.title || '').trim(),
        content: (body.content || '').trim(),
        tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(',').map(t => t.trim()).filter(Boolean) : []),
        authorName: (body.authorName || '').trim() || '회원 님',
        authorRole: (body.authorRole || '').trim() || '보호자',
        authorMeta: (body.authorMeta || '').trim() || '서울',
        avatarChar: (body.avatarChar || (body.authorName ? body.authorName.charAt(0) : '리')),
        avatarColor: body.avatarColor || 'rose',
        isVisible: body.isVisible !== false,
        order: Number(body.order) || (reviews.length + 1),
        createdAt: new Date().toISOString()
      };

      if (!newReview.title || !newReview.content) {
        sendJson(res, 400, { success: false, message: '후기 제목과 내용은 필수입니다.' });
        return;
      }

      reviews.unshift(newReview);
      writeJson(REVIEWS_FILE, reviews);
      sendJson(res, 201, { success: true, review: newReview, message: '후기가 등록되었습니다.' });
    } catch (e) {
      sendJson(res, 500, { success: false, message: '후기 등록 처리 오류' });
    }
    return;
  }

  // 후기 노출 여부 토글: PATCH /api/admin/reviews/:id/toggle
  const matchReviewToggle = pathname.match(/^\/api\/admin\/reviews\/([^/]+)\/toggle$/);
  if (matchReviewToggle && req.method === 'PATCH') {
    if (!requireAuth(req, res)) return;
    try {
      const reviewId = matchReviewToggle[1];
      const reviews = readJson(REVIEWS_FILE, []);
      const review = reviews.find(r => r.id === reviewId);
      if (!review) {
        sendJson(res, 404, { success: false, message: '후기를 찾을 수 없습니다.' });
        return;
      }
      review.isVisible = !review.isVisible;
      writeJson(REVIEWS_FILE, reviews);
      sendJson(res, 200, { success: true, isVisible: review.isVisible, message: `후기 노출 상태가 ${review.isVisible ? '활성화' : '숨김'} 처리되었습니다.` });
    } catch (e) {
      sendJson(res, 500, { success: false, message: '후기 노출 상태 변경 오류' });
    }
    return;
  }

  // 후기 상세 수정: PUT /api/admin/reviews/:id
  const matchReviewId = pathname.match(/^\/api\/admin\/reviews\/([^/]+)$/);
  if (matchReviewId && req.method === 'PUT') {
    if (!requireAuth(req, res)) return;
    try {
      const reviewId = matchReviewId[1];
      const body = await parseBody(req);
      const reviews = readJson(REVIEWS_FILE, []);
      const review = reviews.find(r => r.id === reviewId);

      if (!review) {
        sendJson(res, 404, { success: false, message: '후기를 찾을 수 없습니다.' });
        return;
      }

      if (body.category !== undefined) review.category = body.category;
      if (body.planBadge !== undefined) review.planBadge = body.planBadge;
      if (body.usedBadge !== undefined) review.usedBadge = body.usedBadge;
      if (body.verified !== undefined) review.verified = Boolean(body.verified);
      if (body.rating !== undefined) review.rating = Number(body.rating);
      if (body.title !== undefined) review.title = body.title.trim();
      if (body.content !== undefined) review.content = body.content.trim();
      if (body.tags !== undefined) {
        review.tags = Array.isArray(body.tags) ? body.tags : body.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
      if (body.authorName !== undefined) review.authorName = body.authorName.trim();
      if (body.authorRole !== undefined) review.authorRole = body.authorRole.trim();
      if (body.authorMeta !== undefined) review.authorMeta = body.authorMeta.trim();
      if (body.avatarChar !== undefined) review.avatarChar = body.avatarChar.trim();
      if (body.avatarColor !== undefined) review.avatarColor = body.avatarColor;
      if (body.isVisible !== undefined) review.isVisible = Boolean(body.isVisible);
      if (body.order !== undefined) review.order = Number(body.order);
      review.updatedAt = new Date().toISOString();

      writeJson(REVIEWS_FILE, reviews);
      sendJson(res, 200, { success: true, review, message: '후기가 수정되었습니다.' });
    } catch (e) {
      sendJson(res, 500, { success: false, message: '후기 수정 처리 오류' });
    }
    return;
  }

  // 후기 삭제: DELETE /api/admin/reviews/:id
  if (matchReviewId && req.method === 'DELETE') {
    if (!requireAuth(req, res)) return;
    try {
      const reviewId = matchReviewId[1];
      let reviews = readJson(REVIEWS_FILE, []);
      const initialLength = reviews.length;
      reviews = reviews.filter(r => r.id !== reviewId);

      if (reviews.length === initialLength) {
        sendJson(res, 404, { success: false, message: '삭제할 후기를 찾을 수 없습니다.' });
        return;
      }

      writeJson(REVIEWS_FILE, reviews);
      sendJson(res, 200, { success: true, message: '후기가 삭제되었습니다.' });
    } catch (e) {
      sendJson(res, 500, { success: false, message: '후기 삭제 처리 오류' });
    }
    return;
  }

  /* ========================================================
     5. 관리자 종합 통계 API 라우트
     ======================================================== */

  // 통계 종합 조회: GET /api/admin/analytics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
  if (pathname === '/api/admin/analytics' && req.method === 'GET') {
    if (!requireAuth(req, res)) return;
    try {
      const startDate = parsedUrl.searchParams.get('startDate');
      const endDate = parsedUrl.searchParams.get('endDate');

      const allLogs = readJson(ANALYTICS_FILE, []);
      const allConsultations = readJson(CONSULT_FILE, []);

      // 날짜 필터링
      const filteredLogs = allLogs.filter(log => {
        if (!log.date) return false;
        if (startDate && log.date < startDate) return false;
        if (endDate && log.date > endDate) return false;
        return true;
      });

      const filteredConsultations = allConsultations.filter(c => {
        const cDate = (c.createdAt || '').slice(0, 10);
        if (!cDate) return true;
        if (startDate && cDate < startDate) return false;
        if (endDate && cDate > endDate) return false;
        return true;
      });

      // 1. 일자별 PV 및 UV 집계
      const dailyMap = {};
      filteredLogs.forEach(log => {
        const d = log.date;
        if (!dailyMap[d]) {
          dailyMap[d] = { date: d, pv: 0, ipSet: new Set(), consultations: 0 };
        }
        dailyMap[d].pv++;
        if (log.ip) dailyMap[d].ipSet.add(log.ip);
      });

      filteredConsultations.forEach(c => {
        const d = (c.createdAt || '').slice(0, 10);
        if (dailyMap[d]) {
          dailyMap[d].consultations++;
        }
      });

      const dailyStats = Object.values(dailyMap)
        .map(item => ({
          date: item.date,
          pv: item.pv,
          uv: item.ipSet.size,
          consultations: item.consultations
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // 2. 유입 사이트/출처 통계 집계
      const sourceMap = {};
      filteredLogs.forEach(log => {
        const src = log.source || '직접 접속/기타';
        sourceMap[src] = (sourceMap[src] || 0) + 1;
      });
      const topSources = Object.entries(sourceMap)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);

      // 3. 기기 및 브라우저 분포
      const deviceMap = {};
      const browserMap = {};
      filteredLogs.forEach(log => {
        const dev = log.device || '기타';
        const br = log.browser || '기타';
        deviceMap[dev] = (deviceMap[dev] || 0) + 1;
        browserMap[br] = (browserMap[br] || 0) + 1;
      });

      // 4. 접속 IP 순위 집계
      const ipMap = {};
      filteredLogs.forEach(log => {
        const ip = log.ip || '미확인';
        if (!ipMap[ip]) {
          ipMap[ip] = { ip, count: 0, lastVisited: log.timestamp, device: log.device, source: log.source };
        }
        ipMap[ip].count++;
        if (log.timestamp > ipMap[ip].lastVisited) {
          ipMap[ip].lastVisited = log.timestamp;
          ipMap[ip].device = log.device;
          ipMap[ip].source = log.source;
        }
      });
      const topIps = Object.values(ipMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 30);

      // 5. 종합 요약 지표
      const totalPv = filteredLogs.length;
      const uniqueIps = new Set(filteredLogs.map(l => l.ip)).size;
      const totalConsultations = filteredConsultations.length;
      const conversionRate = totalPv > 0 ? ((totalConsultations / totalPv) * 100).toFixed(2) : '0.00';

      sendJson(res, 200, {
        success: true,
        summary: {
          totalPv,
          totalUv: uniqueIps,
          totalConsultations,
          conversionRate,
          activeDateRange: {
            start: startDate || (dailyStats[0]?.date ?? '-'),
            end: endDate || (dailyStats[dailyStats.length - 1]?.date ?? '-')
          }
        },
        dailyStats,
        topSources,
        deviceStats: Object.entries(deviceMap).map(([name, count]) => ({ name, count })),
        browserStats: Object.entries(browserMap).map(([name, count]) => ({ name, count })),
        topIps,
        recentLogs: filteredLogs.slice(0, 50)
      });
    } catch (e) {
      console.error('통계 집계 오류:', e);
      sendJson(res, 500, { success: false, message: '통계 집계 처리 오류' });
    }
    return;
  }

  /* ========================================================
     6. 사이트 설정 (푸터 문구 및 개인정보 동의 관리) API 라우트
     ======================================================== */

  // 사이트 설정 조회: GET /api/admin/settings
  if (pathname === '/api/admin/settings' && req.method === 'GET') {
    if (!requireAuth(req, res)) return;
    const settings = readJson(SETTINGS_FILE, {});
    sendJson(res, 200, { success: true, settings });
    return;
  }

  // 사이트 설정 수정: PUT /api/admin/settings
  if (pathname === '/api/admin/settings' && req.method === 'PUT') {
    if (!requireAuth(req, res)) return;
    try {
      const body = await parseBody(req);
      const settings = readJson(SETTINGS_FILE, {});

      if (body.footer) settings.footer = { ...settings.footer, ...body.footer };
      if (body.privacy) settings.privacy = { ...settings.privacy, ...body.privacy };
      settings.updatedAt = new Date().toISOString();

      writeJson(SETTINGS_FILE, settings);
      sendJson(res, 200, { success: true, settings, message: '푸터 및 개인정보 동의 설정이 저장되었습니다.' });
    } catch (e) {
      sendJson(res, 500, { success: false, message: '설정 저장 처리 오류' });
    }
    return;
  }

  /* ========================================================
     7. 정적 파일 서빙 및 관리자 라우트 서빙
     ======================================================== */

  // /admin 또는 /admin/ -> dist/admin.html
  if (pathname === '/admin' || pathname === '/admin/') {
    const adminHtmlPath = path.join(DIST_DIR, 'admin.html');
    fs.readFile(adminHtmlPath, (err, content) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('관리자 페이지를 찾을 수 없습니다.');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    });
    return;
  }

  // 일반 웹 접속 시 자동 트래킹 (정적 리소스 제외하고 메인 웹 페이지 방문 시)
  if (pathname === '/' || pathname === '/index.html') {
    const clientIp = getClientIp(req);
    const referer = req.headers['referer'] || 'direct';
    const ua = req.headers['user-agent'] || '';
    logVisit(clientIp, referer, ua, '/');
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
    const envLabel = isProduction ? '운영 환경 (Production)' : '개발 환경 (Development)';
    console.log(`====================================================`);
    console.log(`  리본케어 웹 서버 및 관리자 시스템 [${envLabel}]`);
    console.log(`  메인 랜딩 사이트: http://localhost:${port}`);
    console.log(`  관리자 대시보드: http://localhost:${port}/admin`);
    if (CONVEX_SITE_URL) {
      console.log(`  연결된 Convex 백엔드: ${CONVEX_SITE_URL}`);
    } else {
      console.log(`  Convex: 연결 대기 중 (로컬 파일스토어 기반 즉시 사용 가능)`);
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
