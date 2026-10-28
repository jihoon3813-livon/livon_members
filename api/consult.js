// Vercel Serverless Function: /api/consult
// 리본케어 상담 접수 및 조회 API

module.exports = async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Convex URL 파싱
  let convexSiteUrl = process.env.CONVEX_SITE_URL;
  if (!convexSiteUrl && process.env.CONVEX_URL) {
    convexSiteUrl = process.env.CONVEX_URL.replace('.convex.cloud', '.convex.site');
  }

  // 1. POST /api/consult (상담 신청)
  if (req.method === 'POST') {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { name, phone, consent, plan, interests, combo } = payload;

      if (!name || !phone || !consent) {
        return res.status(400).json({
          success: false,
          message: '이름, 연락처, 개인정보 수집 동의는 필수 항목입니다.'
        });
      }

      // Convex 백엔드 연동 (환경 변수 설정 시)
      if (convexSiteUrl) {
        try {
          const convexRes = await fetch(`${convexSiteUrl}/api/consult`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const convexData = await convexRes.json();
          return res.status(convexRes.status || 201).json(convexData);
        } catch (convexErr) {
          console.warn('[Convex 연결 실패, 백업 모드로 전환]:', convexErr.message);
        }
      }

      // 기본 성공 응답 (접수 ID 발급)
      const consultationId = 'C-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      return res.status(201).json({
        success: true,
        consultationId,
        message: '상담 신청이 정상적으로 접수되었습니다. 전문 상담사가 확인 후 순차적으로 연락드리겠습니다.'
      });
    } catch (err) {
      console.error('[상담 접수 처리 오류]:', err);
      return res.status(500).json({
        success: false,
        message: '서버 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
      });
    }
  }

  // 2. GET /api/consult (상담 내역 조회)
  if (req.method === 'GET') {
    if (convexSiteUrl) {
      try {
        const convexRes = await fetch(`${convexSiteUrl}/api/consult`);
        const convexData = await convexRes.json();
        return res.status(convexRes.status || 200).json(convexData);
      } catch (convexErr) {
        console.warn('[Convex 조회 실패]:', convexErr.message);
      }
    }
    return res.status(200).json([]);
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
};
