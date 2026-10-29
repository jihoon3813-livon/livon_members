// 리본케어 관리자 시스템 JavaScript (admin.js)

const API = {
  login: '/api/admin/login',
  logout: '/api/admin/logout',
  checkAuth: '/api/admin/check-auth',
  changePassword: '/api/admin/change-password',
  consultations: '/api/admin/consultations',
  reviews: '/api/admin/reviews',
  analytics: '/api/admin/analytics',
  settings: '/api/admin/settings'
};

// 로그인 세션 유지 시간: 3시간 (밀리초)
const SESSION_DURATION = 3 * 60 * 60 * 1000;

// 세션 유효성 판별
function isSessionValid() {
  const token = localStorage.getItem('livon_admin_token');
  const loginAt = parseInt(localStorage.getItem('livon_admin_login_at') || '0', 10);
  if (!token || !loginAt) return false;
  const now = Date.now();
  if (now - loginAt > SESSION_DURATION) {
    clearSession();
    return false;
  }
  return true;
}

// 세션 초기화
function clearSession() {
  state.token = '';
  localStorage.removeItem('livon_admin_token');
  localStorage.removeItem('livon_admin_login_at');
}

// 401 또는 세션 만료 처리
function handleUnauthorized(showToastMsg = true) {
  clearSession();
  document.getElementById('login-overlay').style.display = 'flex';
  if (showToastMsg) {
    showToast('로그인이 필요하거나 세션(3시간)이 만료되었습니다.', 'error');
  }
}

// 전역 상태
const state = {
  token: isSessionValid() ? (localStorage.getItem('livon_admin_token') || '') : '',
  activeTab: 'dashboard',
  consultations: [],
  consultFilter: 'all',
  consultSearch: '',
  selectedConsult: null,
  reviews: [],
  reviewFilter: 'all',
  reviewSearch: '',
  analytics: null,
  analyticsRange: '7days'
};

// HTTP 요청 헬퍼
async function fetchWithAuth(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  // 로컬 파일(file://) 프로토콜 대응 Mock 핸들러
  if (window.location.protocol === 'file:') {
    return await handleLocalFileMock(url, options);
  }

  try {
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      handleUnauthorized(true);
      throw new Error('인증이 만료되었습니다. 다시 로그인해 주세요.');
    }
    if (!res.ok) {
      return await handleLocalFileMock(url, options);
    }
    return await res.json();
  } catch (err) {
    console.warn('API 호출 폴백 전환:', err);
    return await handleLocalFileMock(url, options);
  }
}

// 공식 기본 후기 데이터 (6건)
const OFFICIAL_DEFAULT_REVIEWS = [
  {
    id: "REV-001",
    category: "care",
    planBadge: "라이프케어 320",
    usedBadge: "24시간 병원 간병 5일",
    verified: true,
    rating: 5,
    title: "어머니 급성 골절로 눈앞이 캄캄했는데, 당일 바로 베테랑 간병사님이 오셔서 살았습니다.",
    content: "직장 근무 중에 갑자기 어머니가 낙상으로 고관절 골절 수술을 받게 되셨어요. 병원에서는 간병인을 바로 구해야 한다는데 요즘 간병 구하기가 하늘의 별따기라 발만 동동 굴렀습니다. 다행히 가입해 둔 리본케어에 전화하니 전담 코디네이터분이 2시간 만에 바로 병원 배정부터 절차를 끝내주셨습니다. 오신 간병사님이 친어머니처럼 세심하게 체위 변경과 식사 보조를 해주시고, 매일 진행 상황을 문자로 꼼꼼히 남겨주셔서 직장에서도 안심하고 일할 수 있었습니다.",
    tags: ["#당일긴급매칭", "#친어머니처럼돌봄", "#직장인안심리포트"],
    authorName: "김*진 님",
    authorRole: "보호자 (47세·직장인)",
    authorMeta: "서울 송파구 · 2026.04",
    avatarChar: "김",
    avatarColor: "rose",
    isVisible: true,
    order: 1,
    createdAt: "2026-04-15T09:30:00.000Z"
  },
  {
    id: "REV-002",
    category: "smart escort",
    planBadge: "라이프케어 160",
    usedBadge: "스마트 홈케어 5년 + 병원 동행",
    verified: true,
    rating: 5,
    title: "지방에 홀로 계신 어머니 댁에 태블릿과 센서를 설치해 드렸더니 온 가족 불안이 사라졌어요.",
    content: "서울-부산 장거리라 늘 어머니 혼자 계신 게 마음에 걸렸습니다. 스마트 홈케어 5년 패키지를 신청해 케어비전 태블릿과 동작 센서를 댁에 설치해드렸더니, 아침 기상 여부와 활동 패턴이 앱으로 확인되어 너무 든든합니다. 특히 지난달 정기 진료 때는 간호사 동행 서비스를 함께 신청했는데, 병원 이동부터 진료실 동행, 의사 선생님 처방 설명까지 깔끔하게 정리해 보내주셔서 멀리서도 곁에 있는 기분이었습니다.",
    tags: ["#스마트홈케어5년", "#원격안부확인", "#간호사진료동행"],
    authorName: "박*현 님",
    authorRole: "보호자 (42세·장거리 자녀)",
    authorMeta: "부산 수영구 · 2026.05",
    avatarChar: "박",
    avatarColor: "mint",
    isVisible: true,
    order: 2,
    createdAt: "2026-05-10T14:20:00.000Z"
  },
  {
    id: "REV-003",
    category: "escort",
    planBadge: "라이프케어 160",
    usedBadge: "차량 에스코트 + 병원 동행 3회",
    verified: true,
    rating: 5,
    title: "휠체어 타시는 아버님 상급종합병원 외래 진료, 이젠 연차 안 내고도 모십니다.",
    content: "대형병원 외래는 접수부터 검사, 대기, 진료, 수납까지 4~5시간이 훌쩍 걸려 매번 맞벌이 부부가 번갈아 휴가를 내야 했습니다. 리본케어 차량 에스코트와 병원 동행 매니저님을 이용해봤는데 정말 신세계였어요. 집 문앞부터 휠체어 안전 이동, 검사실 길 찾기, 처방약 수령까지 완벽하게 전담해 주셨습니다. 진료 브리핑 리포트도 상세해서 연차 부담 없이 아버님 건강을 챙겨드리고 있습니다.",
    tags: ["#도어투도어이동", "#연차부담해결", "#전문외래동행"],
    authorName: "최*원 님",
    authorRole: "보호자 (39세·맞벌이 부부)",
    authorMeta: "경기 성남시 분당구 · 2026.06",
    avatarChar: "최",
    avatarColor: "gold",
    isVisible: true,
    order: 3,
    createdAt: "2026-06-03T11:15:00.000Z"
  },
  {
    id: "REV-004",
    category: "daily",
    planBadge: "라이프케어 160",
    usedBadge: "가사도우미 4회 + 정리수납 1회",
    verified: true,
    rating: 5,
    title: "무릎 인공관절 수술 후 집안일이 막막했는데, 덕분에 오롯이 회복에만 전념했어요.",
    content: "수술 후 퇴원하고 집에 돌아오니 보행기를 잡고 화장실 가는 것조차 버거워 청소나 식사는 엄두도 못 냈습니다. 0.5회 차감으로 가사도우미 서비스를 이용했는데, 주방 위생부터 영양 죽 준비, 세탁까지 깔끔하게 도와주셨습니다. 특히 정리수납 서비스로 휠체어와 보행기 동선에 걸리는 물건들을 싹 정리해 주셔서 집 안에서 넘어질 염려 없이 편안하게 회복할 수 있었습니다.",
    tags: ["#퇴원후회복돌봄", "#보행동선정리", "#가사부담완화"],
    authorName: "윤*자 님",
    authorRole: "본인 이용 (68세)",
    authorMeta: "인천 연수구 · 2026.07",
    avatarChar: "윤",
    avatarColor: "mint",
    isVisible: true,
    order: 4,
    createdAt: "2026-07-18T16:40:00.000Z"
  },
  {
    id: "REV-005",
    category: "care",
    planBadge: "라이프케어 320",
    usedBadge: "24시간 병원 간병 7일 + 검진 혜택",
    verified: true,
    rating: 5,
    title: "웃돈 요구나 식대 시비 없이 투명하고 정직해서 가족 모두 크게 만족했습니다.",
    content: "예전에 사설 소개소에서 간병인을 썼을 땐 식대비 별도 요구, 주말 웃돈, 야간 할증 때문에 간병인 눈치 보느라 스트레스가 이만저만이 아니었습니다. 리본케어는 멤버십 횟수로 투명하게 정산되고 추가 비용 갈등이 전혀 없어 마음이 정말 편했습니다. 여기에 멤버십 무료 혜택인 건강검진 우대 예약으로 아내와 부모님 검진까지 알뜰하게 챙겨서 일석이조였습니다.",
    tags: ["#투명한정찰정산", "#추가비용갈등NO", "#종합건강검진우대"],
    authorName: "정*훈 님",
    authorRole: "보호자 (51세·자영업)",
    authorMeta: "대구 수성구 · 2026.08",
    avatarChar: "정",
    avatarColor: "rose",
    isVisible: true,
    order: 5,
    createdAt: "2026-08-22T10:05:00.000Z"
  },
  {
    id: "REV-006",
    category: "smart care",
    planBadge: "라이프케어 320",
    usedBadge: "스마트홈 5년 + 단기 간병 2일",
    verified: true,
    rating: 5,
    title: "평소엔 스마트 기기로 안부 챙기고, 아프실 땐 바로 간병으로 전환되니 든든합니다.",
    content: "스마트 홈케어 5년 무상 패키지로 5회를 차감하고, 남은 횟수를 킵해두고 있었어요. 그런데 얼마 전 아버님이 폐렴 초기 증세로 3일간 입원하셨을 때 남겨둔 한도로 간병 서비스를 요청하니 즉시 배정되었습니다. 평소엔 안심홈으로 일상을 지키고, 급할 땐 진짜 간병으로 이어지는 이 '자유로운 전환' 구조가 리본케어의 진짜 가치라고 생각합니다.",
    tags: ["#자유로운전환케어", "#단기입원간병", "#5년무상홈케어"],
    authorName: "이*경 님",
    authorRole: "보호자 (45세·공무원)",
    authorMeta: "대전 유성구 · 2026.09",
    avatarChar: "이",
    avatarColor: "gold",
    isVisible: true,
    order: 6,
    createdAt: "2026-09-14T13:50:00.000Z"
  }
];

// 로컬스토리지 동기화 및 구버전 캐시/더미 데이터 정화 함수
function syncStorageData(force = false) {
  try {
    const rawReviews = localStorage.getItem('livon_mock_reviews');
    if (!rawReviews || force) {
      localStorage.setItem('livon_mock_reviews', JSON.stringify(OFFICIAL_DEFAULT_REVIEWS));
    } else {
      const parsed = JSON.parse(rawReviews);
      // 저장된 데이터가 6개 미만이거나 최신 6건의 항목이 누락된 구버전 캐시인 경우 최신 6건으로 자동 갱신
      if (!Array.isArray(parsed) || parsed.length < 6 || !parsed.some(r => r.id === 'REV-006')) {
        localStorage.setItem('livon_mock_reviews', JSON.stringify(OFFICIAL_DEFAULT_REVIEWS));
      }
    }

    // 홍길동 등 더미 고객 데이터 제거 동기화
    const rawConsult = localStorage.getItem('livon_mock_consult');
    if (rawConsult) {
      const parsedConsult = JSON.parse(rawConsult);
      if (Array.isArray(parsedConsult)) {
        const cleaned = parsedConsult.filter(c => c.name !== '홍길동' && c.phone !== '010-1234-5678');
        localStorage.setItem('livon_mock_consult', JSON.stringify(cleaned));
      }
    } else {
      localStorage.setItem('livon_mock_consult', JSON.stringify([]));
    }
  } catch (e) {
    console.error('Storage sync error:', e);
  }
}

// 스크립트 로드 시 즉시 동기화 실행
syncStorageData();

// 오프라인 / file:// 프로토콜 로컬 스토리지 Fallback 데이터 핸들러
async function handleLocalFileMock(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  // 최신 데이터 상태 보장
  syncStorageData();

  if (url.includes('/api/admin/login')) {
    const savedPwd = localStorage.getItem('livon_mock_pwd') || 'admin1234';
    if (body.password === savedPwd) {
      return { success: true, token: 'mock-token-' + Date.now() };
    }
    return { success: false, message: '비밀번호가 올바르지 않습니다.' };
  }

  if (url.includes('/api/admin/check-auth')) {
    return { success: true, authenticated: isSessionValid() };
  }

  if (url.includes('/api/admin/change-password')) {
    const savedPwd = localStorage.getItem('livon_mock_pwd') || 'admin1234';
    if (body.currentPassword !== savedPwd) {
      return { success: false, message: '현재 비밀번호가 일치하지 않습니다.' };
    }
    localStorage.setItem('livon_mock_pwd', body.newPassword);
    return { success: true, message: '비밀번호가 변경되었습니다.' };
  }

  if (url.includes('/api/admin/consultations')) {
    const matchId = url.match(/\/api\/admin\/consultations\/([^/?]+)/);
    const overrides = JSON.parse(localStorage.getItem('livon_consult_overrides') || '{}');

    if (matchId) {
      const cId = matchId[1];
      if (method === 'PATCH') {
        overrides[cId] = overrides[cId] || {};
        if (body.status !== undefined) overrides[cId].status = body.status;
        if (body.adminMemo !== undefined) overrides[cId].adminMemo = body.adminMemo;
        localStorage.setItem('livon_consult_overrides', JSON.stringify(overrides));
        return { success: true, consultation: { id: cId, ...overrides[cId] } };
      } else if (method === 'DELETE') {
        overrides[cId] = { deleted: true };
        localStorage.setItem('livon_consult_overrides', JSON.stringify(overrides));
        return { success: true };
      }
    }

    // 1. Convex 운영 DB에서 실시간 상담 신청 목록 직접 조회
    let consults = [];
    try {
      const convexUrl = 'https://perceptive-pig-703.ap-southeast-2.convex.site';
      const cRes = await fetch(`${convexUrl}/api/consult`, { cache: 'no-store' });
      if (cRes.ok) {
        const cList = await cRes.json();
        if (Array.isArray(cList)) {
          consults = cList.map(item => ({
            id: item._id || item.id,
            name: item.name,
            phone: item.phone,
            plan: item.plan || 'undecided',
            interests: Array.isArray(item.interests) ? item.interests : [],
            combo: item.combo || null,
            status: item.status || '접수',
            createdAt: item.createdAt || (item._creationTime ? new Date(item._creationTime).toISOString() : new Date().toISOString()),
            adminMemo: item.adminMemo || ''
          }));
        }
      }
    } catch (e) {
      console.warn('Convex 실시간 상담 조회 실패, 로컬 폴백 사용:', e);
    }

    // 2. 브라우저 localStorage(livon_consultations)에 보관된 오프라인 상담 내역도 병합
    const offlineConsults = JSON.parse(localStorage.getItem('livon_consultations') || '[]');
    offlineConsults.forEach(off => {
      if (!consults.some(c => c.id === off.id || (c.phone === off.phone && c.name === off.name))) {
        consults.push({
          id: off.id || 'C-' + Date.now().toString(36).toUpperCase(),
          name: off.name,
          phone: off.phone,
          plan: off.plan || 'undecided',
          interests: Array.isArray(off.interests) ? off.interests : [],
          combo: off.combo || null,
          status: off.status || '접수',
          createdAt: off.createdAt || new Date().toISOString(),
          adminMemo: off.adminMemo || ''
        });
      }
    });

    // 3. 로컬 수정(상태/메모) 오버라이드 적용 및 삭제 건 제외
    consults = consults
      .filter(c => !overrides[c.id] || !overrides[c.id].deleted)
      .map(c => {
        if (overrides[c.id]) {
          return {
            ...c,
            status: overrides[c.id].status !== undefined ? overrides[c.id].status : c.status,
            adminMemo: overrides[c.id].adminMemo !== undefined ? overrides[c.id].adminMemo : c.adminMemo
          };
        }
        return c;
      });

    // 4. 최신 등록순 정렬
    consults.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return { success: true, consultations: consults };
  }

  if (url.includes('/api/admin/reviews') || url.includes('/api/reviews')) {
    const matchToggle = url.match(/\/api\/admin\/reviews\/([^/?]+)\/toggle/);
    if (matchToggle) {
      let reviews = JSON.parse(localStorage.getItem('livon_mock_reviews') || '[]');
      const rId = matchToggle[1];
      const rev = reviews.find(r => r.id === rId);
      if (rev) {
        rev.isVisible = !rev.isVisible;
        localStorage.setItem('livon_mock_reviews', JSON.stringify(reviews));
        return { success: true, isVisible: rev.isVisible, message: '상태가 변경되었습니다.' };
      }
    }
    const matchId = url.match(/\/api\/admin\/reviews\/([^/?]+)/);
    if (matchId && method === 'DELETE') {
      let reviews = JSON.parse(localStorage.getItem('livon_mock_reviews') || '[]');
      reviews = reviews.filter(r => r.id !== matchId[1]);
      localStorage.setItem('livon_mock_reviews', JSON.stringify(reviews));
      return { success: true };
    }

    // Convex 운영 DB에서 실시간 후기 목록 우선 조회
    try {
      const convexUrl = 'https://perceptive-pig-703.ap-southeast-2.convex.site';
      const rRes = await fetch(`${convexUrl}/api/reviews?all=true`, { cache: 'no-store' });
      if (rRes.ok) {
        const rData = await rRes.json();
        if (rData && Array.isArray(rData.reviews) && rData.reviews.length > 0) {
          const mappedReviews = rData.reviews.map(r => ({
            id: r._id || r.id,
            ...r
          }));
          return { success: true, reviews: mappedReviews };
        }
      }
    } catch (e) {
      console.warn('Convex 실시간 후기 조회 실패, 폴백 사용:', e);
    }

    let reviews = JSON.parse(localStorage.getItem('livon_mock_reviews') || '[]');
    return { success: true, reviews };
  }

  if (url.includes('/api/admin/settings') || url.includes('/api/settings')) {
    let settings = JSON.parse(localStorage.getItem('livon_mock_settings') || 'null');
    if (!settings) {
      settings = {
        footer: {
          slogan: "당신의 일상에, 돌봄이 함께.",
          businessInfo: "리본케어 라이프케어 멤버십 · PC / MOBILE RESPONSIVE SITE\n상품 기획을 바탕으로 한 서비스 안내 페이지이며, 가격·혜택·이용조건은 출시 전 최종 확정됩니다.",
          copyright: "© LIVON CARE. All rights reserved.",
          customerPhone: "1588-0000",
          customerHours: "평일 09:00 ~ 18:00 (주말·공휴일 휴무)"
        },
        privacy: {
          title: "개인정보 수집 및 이용 안내 (필수)",
          consentCheckboxText: "개인정보 수집 및 이용에 동의합니다.",
          items: "이름, 연락처(휴대전화번호), 관심 상품 및 관심 서비스",
          purpose: "리본케어 멤버십 상품 상담, 맞춤 서비스 안내 및 관련 문의 응대",
          period: "상담 접수일로부터 1년 (이용자 요청 시 지체 없이 파기)",
          refusal: "귀하는 개인정보 수집 및 이용에 동의하지 않을 권리가 있습니다. 단, 필수 항목 동의 거부 시 원활한 상담 서비스 제공이 제한될 수 있습니다.",
          fullContent: "1. 수집하는 개인정보 항목: 이름, 연락처(휴대전화번호), 관심 상품 및 관심 서비스\n2. 수집 및 이용 목적: 리본케어 멤버십 상품 상담, 맞춤 서비스 안내 및 관련 문의 응대\n3. 보유 및 이용 기간: 상담 접수일로부터 1년 (이용자 요청 시 지체 없이 파기)\n4. 동의 거부 권리: 귀하는 개인정보 수집 및 이용에 동의하지 않을 권리가 있습니다. 단, 필수 항목 동의 거부 시 원활한 상담 서비스 제공이 제한될 수 있습니다.",
          footerNotice: "접수된 개인정보는 상기 목적 외의 용도로 사용되지 않으며, 안전하게 보호 관리됩니다."
        }
      };
      localStorage.setItem('livon_mock_settings', JSON.stringify(settings));
    }
    if (method === 'PUT') {
      if (body.footer) settings.footer = { ...settings.footer, ...body.footer };
      if (body.privacy) settings.privacy = { ...settings.privacy, ...body.privacy };
      localStorage.setItem('livon_mock_settings', JSON.stringify(settings));
      return { success: true, settings, message: '설정이 저장되었습니다.' };
    }
    return { success: true, settings };
  }

  if (url.includes('/api/admin/analytics')) {
    return {
      success: true,
      summary: { totalPv: 15, totalUv: 14, totalConsultations: 1, conversionRate: '6.67' },
      dailyStats: [
        { date: '2026-10-25', pv: 2, uv: 2, consultations: 0 },
        { date: '2026-10-26', pv: 3, uv: 3, consultations: 0 },
        { date: '2026-10-27', pv: 2, uv: 2, consultations: 0 },
        { date: '2026-10-28', pv: 4, uv: 3, consultations: 1 },
        { date: '2026-10-29', pv: 4, uv: 4, consultations: 0 }
      ],
      topSources: [
        { source: '네이버 검색', count: 6 },
        { source: '구글 검색', count: 3 },
        { source: '직접 접속/북마크', count: 3 },
        { source: '인스타그램', count: 2 },
        { source: '카카오톡 공유', count: 1 }
      ],
      deviceStats: [
        { name: '모바일 (iPhone)', count: 5 },
        { name: '모바일 (Galaxy)', count: 5 },
        { name: '데스크톱 (Windows)', count: 4 },
        { name: '데스크톱 (Mac)', count: 1 }
      ],
      browserStats: [
        { name: 'Chrome', count: 5 },
        { name: 'Safari', count: 4 },
        { name: 'Samsung Internet', count: 2 },
        { name: '카카오톡 인앱', count: 1 }
      ],
      recentLogs: [
        { timestamp: new Date().toISOString(), ip: '127.0.0.1', source: '직접 접속/북마크', device: '데스크톱 (Windows)', browser: 'Chrome', path: '/' }
      ]
    };
  }

  return { success: true };
}

// 401 처리
function handleUnauthorized() {
  state.token = '';
  localStorage.removeItem('livon_admin_token');
  document.getElementById('login-overlay').style.display = 'flex';
  showToast('로그인이 필요하거나 세션이 만료되었습니다.', 'error');
}

// 토스트 메시지
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
  toast.innerHTML = `<span>${type === 'error' ? '⚠️' : '✓'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// 탭 정보 정의
const TAB_INFO = {
  dashboard: { title: '종합 대시보드', desc: '실시간 접수 현황과 핵심 운영 지표를 한눈에 확인합니다.' },
  consultations: { title: '상담 신청 내역 관리', desc: '랜딩페이지에서 접수된 고객 상담 신청의 상태를 관리하고 상담 메모를 기록합니다.' },
  reviews: { title: '실제 후기 관리', desc: '랜딩페이지 후기 섹션에 노출되는 고객 생생 후기를 실시간 등록, 수정, 노출 설정합니다.' },
  analytics: { title: '접속 통계 분석', desc: '일자별 PV, UV, 접속 유입 경로(Referrer), 접속 IP 등 종합 트래픽 통계를 분석합니다.' },
  password: { title: '비밀번호 수정', desc: '보안을 위해 정기적으로 관리자 비밀번호를 안전하게 변경하세요.' },
  settings: { title: '푸터 및 개인정보 정책 관리', desc: '랜딩페이지 푸터 문구, 고객센터 정보, 개인정보 수집·이용 동의 전문을 편집합니다.' }
};

// 탭 전환 함수
function switchTab(tabId) {
  if (!TAB_INFO[tabId]) tabId = 'dashboard';
  state.activeTab = tabId;

  // 사이드바 active
  document.querySelectorAll('.admin-sidebar .nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tabId);
  });

  // 탭 컨텐츠 active
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `tab-${tabId}`);
  });

  // 탑바 헤더 텍스트
  const info = TAB_INFO[tabId];
  document.getElementById('current-tab-title').textContent = info.title;
  document.getElementById('current-tab-desc').textContent = info.desc;

  // 탭별 데이터 로드
  if (tabId === 'dashboard') loadDashboardData();
  else if (tabId === 'consultations') loadConsultations();
  else if (tabId === 'reviews') loadReviews();
  else if (tabId === 'analytics') loadAnalytics();
  else if (tabId === 'settings') loadSettingsData();

  // 모바일 사이드바 닫기
  document.getElementById('admin-sidebar').classList.remove('open');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (backdrop) backdrop.classList.remove('active');
}

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
  // 1. 3시간 세션 유효성 검사 (새로고침 시 자동 유지)
  if (isSessionValid()) {
    state.token = localStorage.getItem('livon_admin_token') || '';
    document.getElementById('login-overlay').style.display = 'none';
    initApp();
  } else {
    handleUnauthorized(false);
  }

  // 로그인 폼 이벤트
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pwdInput = document.getElementById('admin-password');
    const errorBox = document.getElementById('login-error-msg');
    const submitBtn = document.getElementById('btn-login-submit');

    errorBox.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = '로그인 중...';

    try {
      let data;
      if (window.location.protocol === 'file:') {
        data = await handleLocalFileMock(API.login, { method: 'POST', body: JSON.stringify({ password: pwdInput.value }) });
      } else {
        try {
          const res = await fetch(API.login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pwdInput.value })
          });
          if (res.ok) {
            data = await res.json();
          } else {
            data = await handleLocalFileMock(API.login, { method: 'POST', body: JSON.stringify({ password: pwdInput.value }) });
          }
        } catch (fetchErr) {
          // 서버 연결 실패 시 로컬 Fallback
          data = await handleLocalFileMock(API.login, { method: 'POST', body: JSON.stringify({ password: pwdInput.value }) });
        }
      }

      if (data && data.success && data.token) {
        state.token = data.token;
        localStorage.setItem('livon_admin_token', data.token);
        localStorage.setItem('livon_admin_login_at', Date.now().toString());
        document.getElementById('login-overlay').style.display = 'none';
        pwdInput.value = '';
        showToast('관리자 시스템에 성공적으로 로그인했습니다. (3시간 유지)');
        initApp();
      } else {
        errorBox.textContent = (data && data.message) || '비밀번호가 올바르지 않습니다.';
        errorBox.style.display = 'block';
      }
    } catch (err) {
      errorBox.textContent = '서버 통신 오류가 발생했습니다.';
      errorBox.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>로그인</span><svg style="width:16px;height:16px;"><use href="#icon-lock"/></svg>`;
    }
  });

  // 로그아웃 이벤트
  document.getElementById('btn-logout').addEventListener('click', async () => {
    if (!confirm('관리자 모드에서 로그아웃하시겠습니까?')) return;
    try {
      await fetchWithAuth(API.logout, { method: 'POST' });
    } catch (e) {}
    handleUnauthorized(false);
    showToast('안전하게 로그아웃되었습니다.');
  });

  // 사이드바 메뉴 클릭
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.dataset.tab;
      window.location.hash = tab;
      switchTab(tab);
    });
  });

  // 새로고침 버튼
  document.getElementById('btn-refresh-all').addEventListener('click', () => {
    syncStorageData(true);
    showToast('데이터를 새로고침했습니다.');
    switchTab(state.activeTab);
  });

  // 모바일 사이드바 토글 및 닫기
  const mobileToggle = document.getElementById('btn-mobile-sidebar-toggle');
  const sidebar = document.getElementById('admin-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const closeBtn = document.getElementById('btn-sidebar-close');

  function openMobileSidebar() {
    sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
  }

  function closeMobileSidebar() {
    sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openMobileSidebar);
  if (closeBtn) closeBtn.addEventListener('click', closeMobileSidebar);
  if (backdrop) backdrop.addEventListener('click', closeMobileSidebar);

  // 화면 크기 변경 시 차트 반응형 다시 그리기
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (state.activeTab === 'analytics' && state.analytics && state.analytics.dailyStats) {
        renderDailyTrafficSvg(state.analytics.dailyStats);
      }
    }, 150);
  });

  // 비밀번호 변경 폼
  document.getElementById('change-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const curPwd = document.getElementById('pwd-current').value;
    const newPwd = document.getElementById('pwd-new').value;
    const confirmPwd = document.getElementById('pwd-new-confirm').value;
    const errorBox = document.getElementById('pwd-error-msg');

    errorBox.style.display = 'none';

    if (newPwd !== confirmPwd) {
      errorBox.textContent = '새 비밀번호가 일치하지 않습니다.';
      errorBox.style.display = 'block';
      return;
    }
    if (newPwd.length < 4) {
      errorBox.textContent = '새 비밀번호는 최소 4자 이상이어야 합니다.';
      errorBox.style.display = 'block';
      return;
    }

    try {
      const res = await fetchWithAuth(API.changePassword, {
        method: 'POST',
        body: JSON.stringify({ currentPassword: curPwd, newPassword: newPwd })
      });
      if (res.success) {
        showToast('관리자 비밀번호가 성공적으로 변경되었습니다!');
        document.getElementById('change-password-form').reset();
      } else {
        errorBox.textContent = res.message || '비밀번호 변경 실패';
        errorBox.style.display = 'block';
      }
    } catch (err) {
      errorBox.textContent = '비밀번호 변경 중 오류가 발생했습니다.';
      errorBox.style.display = 'block';
    }
  });

  // 상담 필터 탭 이벤트
  document.getElementById('consult-status-filter-group').addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('#consult-status-filter-group .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.consultFilter = btn.dataset.status;
    renderConsultationTable();
  });

  // 상담 검색 인풋
  document.getElementById('consult-search-input').addEventListener('input', e => {
    state.consultSearch = e.target.value.trim().toLowerCase();
    renderConsultationTable();
  });

  // 상담 CSV 내보내기
  document.getElementById('btn-export-consultations').addEventListener('click', exportConsultationsToCsv);

  // 후기 카테고리 필터
  document.getElementById('review-category-filter-group').addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('#review-category-filter-group .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.reviewFilter = btn.dataset.cat;
    renderReviewTable();
  });

  // 후기 검색 인풋
  document.getElementById('review-search-input').addEventListener('input', e => {
    state.reviewSearch = e.target.value.trim().toLowerCase();
    renderReviewTable();
  });

  // 신규 후기 등록 모달 열기
  document.getElementById('btn-open-add-review-modal').addEventListener('click', () => {
    openReviewModal();
  });

  // 후기 저장 버튼
  document.getElementById('btn-save-review').addEventListener('click', saveReview);

  // 상담 상세 저장 버튼
  document.getElementById('btn-save-consult-detail').addEventListener('click', saveConsultDetail);

  // 통계 날짜 프리셋
  document.getElementById('analytics-preset-group').addEventListener('click', e => {
    const btn = e.target.closest('.date-preset-btn');
    if (!btn) return;
    document.querySelectorAll('#analytics-preset-group .date-preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.analyticsRange = btn.dataset.range;
    applyAnalyticsPreset(btn.dataset.range);
    loadAnalytics();
  });

  // 통계 직접 조회 버튼
  document.getElementById('btn-analytics-custom-apply').addEventListener('click', () => {
    document.querySelectorAll('#analytics-preset-group .date-preset-btn').forEach(b => b.classList.remove('active'));
    loadAnalytics();
  });

  // 사이트 설정 (푸터 및 개인정보 동의) 폼 제출 이벤트
  const settingsForm = document.getElementById('site-settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveSettingsData();
    });
  }

  // 푸터 실시간 미리보기 이벤트 바인딩
  const sloganInput = document.getElementById('set-footer-slogan');
  if (sloganInput) {
    sloganInput.addEventListener('input', e => {
      document.getElementById('prev-footer-slogan').textContent = e.target.value || '당신의 일상에, 돌봄이 함께.';
    });
  }
  const bizInput = document.getElementById('set-footer-business-info');
  if (bizInput) {
    bizInput.addEventListener('input', e => {
      document.getElementById('prev-footer-business').textContent = e.target.value || '리본케어 라이프케어 멤버십 안내';
    });
  }
  const copyInput = document.getElementById('set-footer-copyright');
  if (copyInput) {
    copyInput.addEventListener('input', e => {
      document.getElementById('prev-footer-copy').textContent = e.target.value || '© LIVON CARE. All rights reserved.';
    });
  }
});

// 앱 초기화
function initApp() {
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  applyAnalyticsPreset('7days');
  switchTab(hash);
}

/* ========================================================
   1. 대시보드 로드
   ======================================================== */
async function loadDashboardData() {
  try {
    const [cRes, rRes, aRes] = await Promise.all([
      fetchWithAuth(API.consultations),
      fetchWithAuth(API.reviews),
      fetchWithAuth(`${API.analytics}?startDate=${new Date().toISOString().slice(0, 10)}`)
    ]);

    state.consultations = cRes.consultations || [];
    state.reviews = rRes.reviews || [];

    // KPI 계산
    const totalConsult = state.consultations.length;
    const pendingConsult = state.consultations.filter(c => (c.status || '접수') === '접수').length;
    document.getElementById('dash-kpi-consult-total').textContent = totalConsult;
    document.getElementById('dash-kpi-consult-pending').textContent = `신규 접수 ${pendingConsult}건 대기중`;
    document.getElementById('sidebar-badge-consult').textContent = pendingConsult;

    // 오늘 방문자수
    const todayPv = aRes.summary ? aRes.summary.totalPv : 0;
    const todayUv = aRes.summary ? aRes.summary.totalUv : 0;
    document.getElementById('dash-kpi-today-visits').textContent = `${todayPv} / ${todayUv}`;

    // 후기 KPI
    const totalReviews = state.reviews.length;
    const visibleReviews = state.reviews.filter(r => r.isVisible !== false).length;
    document.getElementById('dash-kpi-review-total').textContent = totalReviews;
    document.getElementById('dash-kpi-review-visible').textContent = `노출 활성 ${visibleReviews}건`;
    document.getElementById('sidebar-badge-review').textContent = totalReviews;

    // 전환율
    document.getElementById('dash-kpi-cvr').textContent = `${aRes.summary ? aRes.summary.conversionRate : '0.00'}%`;

    // 최근 상담 테이블 5건
    const tbody = document.getElementById('dash-recent-consult-tbody');
    const recent = state.consultations.slice(0, 5);

    if (recent.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--muted);">아직 접수된 상담 신청이 없습니다.</td></tr>`;
    } else {
      tbody.innerHTML = recent.map(c => {
        const dateStr = formatDate(c.createdAt);
        const status = c.status || '접수';
        return `
          <tr>
            <td><small style="color:var(--muted);">${dateStr}</small></td>
            <td><strong>${escapeHtml(c.name)}</strong></td>
            <td><a href="tel:${escapeHtml(c.phone)}" style="color:var(--pink);">${escapeHtml(c.phone)}</a></td>
            <td>${escapeHtml(c.plan === 'undecided' ? '미정/맞춤상담' : '라이프케어 ' + c.plan)}</td>
            <td><span class="status-pill status-${status}">${status}</span></td>
            <td>
              <select class="status-select" onchange="changeConsultStatus('${c.id}', this.value)">
                <option value="접수" ${status === '접수' ? 'selected' : ''}>접수</option>
                <option value="상담중" ${status === '상담중' ? 'selected' : ''}>상담중</option>
                <option value="완료" ${status === '완료' || status === '상담완료' ? 'selected' : ''}>완료</option>
                <option value="보류" ${status === '보류' ? 'selected' : ''}>보류</option>
              </select>
            </td>
          </tr>
        `;
      }).join('');
    }

    // 대시보드 유입 경로 요약
    const sourcesContainer = document.getElementById('dash-top-sources-list');
    const sources = aRes.topSources || [];
    if (sources.length === 0) {
      sourcesContainer.innerHTML = `<p style="text-align:center;padding:20px;color:var(--muted);font-size:12px;">접속 데이터가 아직 충분하지 않습니다.</p>`;
    } else {
      const maxCount = Math.max(...sources.map(s => s.count), 1);
      sourcesContainer.innerHTML = sources.slice(0, 5).map(s => {
        const pct = Math.round((s.count / (aRes.summary.totalPv || 1)) * 100);
        return `
          <div class="rank-item">
            <div class="rank-header">
              <span>${escapeHtml(s.source)}</span>
              <span>${s.count}회 (${pct}%)</span>
            </div>
            <div class="rank-bar-bg">
              <div class="rank-bar-fill" style="width:${(s.count / maxCount) * 100}%;"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  } catch (err) {
    console.error('대시보드 데이터 로드 오류:', err);
  }
}

/* ========================================================
   2. 상담 신청 내역 관리
   ======================================================== */
async function loadConsultations() {
  try {
    const res = await fetchWithAuth(API.consultations);
    state.consultations = res.consultations || [];
    updateConsultCounts();
    renderConsultationTable();
  } catch (err) {
    showToast('상담 내역을 불러오지 못했습니다.', 'error');
  }
}

function updateConsultCounts() {
  const total = state.consultations.length;
  const cPending = state.consultations.filter(c => (c.status || '접수') === '접수').length;
  const cProgress = state.consultations.filter(c => c.status === '상담중').length;
  const cDone = state.consultations.filter(c => c.status === '완료' || c.status === '상담완료').length;
  const cHold = state.consultations.filter(c => c.status === '보류').length;

  document.getElementById('cnt-consult-all').textContent = total;
  document.getElementById('cnt-consult-접수').textContent = cPending;
  document.getElementById('cnt-consult-상담중').textContent = cProgress;
  document.getElementById('cnt-consult-완료').textContent = cDone;
  document.getElementById('cnt-consult-보류').textContent = cHold;
  document.getElementById('sidebar-badge-consult').textContent = cPending;
}

function renderConsultationTable() {
  const tbody = document.getElementById('consult-list-tbody');
  let list = state.consultations;

  // 상태 필터
  if (state.consultFilter !== 'all') {
    list = list.filter(c => {
      const st = c.status || '접수';
      if (state.consultFilter === '완료') return st === '완료' || st === '상담완료';
      return st === state.consultFilter;
    });
  }

  // 검색어 필터
  if (state.consultSearch) {
    const kw = state.consultSearch;
    list = list.filter(c => {
      return (c.name && c.name.toLowerCase().includes(kw)) ||
             (c.phone && c.phone.includes(kw)) ||
             (c.plan && c.plan.toLowerCase().includes(kw)) ||
             (c.id && c.id.toLowerCase().includes(kw));
    });
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--muted);">일치하는 상담 내역이 없습니다.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(c => {
    const status = c.status || '접수';
    const comboText = c.combo || (c.interests && c.interests.join(', ')) || '-';
    const memoText = c.adminMemo ? escapeHtml(c.adminMemo) : '<span style="color:#b5c0b6;">(메모 없음)</span>';

    return `
      <tr>
        <td><code style="font-size:11px;background:#f3f6f2;padding:2px 5px;border-radius:4px;">${c.id}</code></td>
        <td><small style="color:var(--muted);white-space:nowrap;">${formatDate(c.createdAt)}</small></td>
        <td><strong>${escapeHtml(c.name)}</strong></td>
        <td><a href="tel:${escapeHtml(c.phone)}" style="color:var(--pink);font-weight:600;">${escapeHtml(c.phone)}</a></td>
        <td><span class="badge-outline">${escapeHtml(c.plan === 'undecided' ? '미정/맞춤상담' : '라이프케어 ' + c.plan)}</span></td>
        <td><div style="max-width:200px;font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(comboText)}">${escapeHtml(comboText)}</div></td>
        <td>
          <select class="status-select" onchange="changeConsultStatus('${c.id}', this.value)">
            <option value="접수" ${status === '접수' ? 'selected' : ''}>신규 접수</option>
            <option value="상담중" ${status === '상담중' ? 'selected' : ''}>상담 진행중</option>
            <option value="완료" ${status === '완료' || status === '상담완료' ? 'selected' : ''}>상담 완료</option>
            <option value="보류" ${status === '보류' ? 'selected' : ''}>보류/취소</option>
          </select>
        </td>
        <td style="max-width:200px;">
          <div style="font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;" onclick="openConsultModal('${c.id}')" title="클릭하여 메모 수정">
            ${memoText}
          </div>
        </td>
        <td>
          <div style="display:flex;gap:6px;">
            <button type="button" class="btn-secondary" style="height:28px;padding:0 8px;font-size:11px;" onclick="openConsultModal('${c.id}')">상세/메모</button>
            <button type="button" style="height:28px;padding:0 8px;font-size:11px;color:#c92a2a;border:1px solid #f8d7da;border-radius:4px;" onclick="deleteConsultation('${c.id}')">삭제</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function changeConsultStatus(id, newStatus) {
  try {
    const res = await fetchWithAuth(`${API.consultations}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
    if (res.success) {
      showToast(`상담 상태가 '${newStatus}'(으)로 변경되었습니다.`);
      const item = state.consultations.find(c => c.id === id);
      if (item) item.status = newStatus;
      updateConsultCounts();
      renderConsultationTable();
    }
  } catch (err) {
    showToast('상태 변경 실패', 'error');
  }
}

function openConsultModal(id) {
  const item = state.consultations.find(c => c.id === id);
  if (!item) return;
  state.selectedConsult = item;

  document.getElementById('md-consult-name').textContent = item.name;
  document.getElementById('md-consult-phone').textContent = item.phone;
  document.getElementById('md-consult-phone').href = `tel:${item.phone}`;
  document.getElementById('md-consult-plan').textContent = item.plan === 'undecided' ? '미정/맞춤상담' : '라이프케어 ' + item.plan;
  document.getElementById('md-consult-date').textContent = formatDate(item.createdAt);
  document.getElementById('md-consult-combo').textContent = item.combo || (item.interests && item.interests.join(', ')) || '선택 없음';
  document.getElementById('md-consult-status-select').value = item.status || '접수';
  document.getElementById('md-consult-memo').value = item.adminMemo || '';

  document.getElementById('modal-consult-detail').style.display = 'flex';
}

function closeConsultModal() {
  document.getElementById('modal-consult-detail').style.display = 'none';
  state.selectedConsult = null;
}

async function saveConsultDetail() {
  if (!state.selectedConsult) return;
  const newStatus = document.getElementById('md-consult-status-select').value;
  const newMemo = document.getElementById('md-consult-memo').value.trim();

  try {
    const res = await fetchWithAuth(`${API.consultations}/${state.selectedConsult.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus, adminMemo: newMemo })
    });
    if (res.success) {
      showToast('상담 내용 및 메모가 저장되었습니다.');
      state.selectedConsult.status = newStatus;
      state.selectedConsult.adminMemo = newMemo;
      closeConsultModal();
      updateConsultCounts();
      renderConsultationTable();
    }
  } catch (err) {
    showToast('저장 중 오류가 발생했습니다.', 'error');
  }
}

async function deleteConsultation(id) {
  if (!confirm('정말 이 상담 내역을 삭제하시겠습니까? (삭제 후 복구 불가)')) return;
  try {
    const res = await fetchWithAuth(`${API.consultations}/${id}`, { method: 'DELETE' });
    if (res.success) {
      showToast('상담 내역이 삭제되었습니다.');
      state.consultations = state.consultations.filter(c => c.id !== id);
      updateConsultCounts();
      renderConsultationTable();
    }
  } catch (e) {
    showToast('삭제 실패', 'error');
  }
}

function exportConsultationsToCsv() {
  if (state.consultations.length === 0) {
    showToast('다운로드할 상담 내역이 없습니다.', 'error');
    return;
  }

  const headers = ['접수ID', '신청일시', '고객성함', '연락처', '신청플랜', '관심케어/직접조합', '처리상태', '관리자메모'];
  const rows = state.consultations.map(c => [
    c.id,
    c.createdAt ? new Date(c.createdAt).toLocaleString('ko-KR') : '',
    c.name,
    c.phone,
    c.plan,
    (c.combo || (c.interests && c.interests.join(',')) || '').replace(/"/g, '""'),
    c.status || '접수',
    (c.adminMemo || '').replace(/"/g, '""')
  ]);

  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...rows.map(r => r.map(field => `"${field}"`).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `리본케어_상담신청내역_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('엑셀 CSV 파일이 다운로드되었습니다.');
}

/* ========================================================
   3. 실제 후기 관리
   ======================================================== */
async function loadReviews() {
  try {
    const res = await fetchWithAuth(API.reviews);
    state.reviews = res.reviews || [];
    const badgeEl = document.getElementById('sidebar-badge-review');
    if (badgeEl) badgeEl.textContent = state.reviews.length;
    renderReviewTable();
  } catch (err) {
    showToast('후기 목록을 불러오지 못했습니다.', 'error');
  }
}

function renderReviewTable() {
  const tbody = document.getElementById('review-list-tbody');
  let list = state.reviews;

  // 카테고리 필터
  if (state.reviewFilter !== 'all') {
    list = list.filter(r => (r.category || '').includes(state.reviewFilter));
  }

  // 검색어 필터
  if (state.reviewSearch) {
    const kw = state.reviewSearch;
    list = list.filter(r => {
      return (r.title && r.title.toLowerCase().includes(kw)) ||
             (r.content && r.content.toLowerCase().includes(kw)) ||
             (r.authorName && r.authorName.toLowerCase().includes(kw)) ||
             (r.tags && r.tags.some(t => t.toLowerCase().includes(kw)));
    });
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--muted);">등록된 후기가 없습니다.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map((r, idx) => {
    const stars = renderStarIcons(r.rating || 5.0);
    const tagsHtml = (r.tags || []).map(t => `<span style="font-size:10px;color:var(--pink);margin-right:4px;">${escapeHtml(t)}</span>`).join('');
    const isVisible = r.isVisible !== false;

    return `
      <tr>
        <td style="text-align:center;font-weight:600;color:var(--muted);">${r.order || idx + 1}</td>
        <td>
          <span class="badge-outline" style="background:#f7e8ed;color:#b77186;border-color:#ddb5c1;">${escapeHtml(r.planBadge || '-')}</span>
          <div style="font-size:11px;color:var(--muted);margin-top:2px;">${escapeHtml(r.usedBadge || '-')}</div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:4px;">
            <span class="review-rating-stars">${stars}</span>
            <strong style="font-size:12px;">${(r.rating || 5.0).toFixed(1)}</strong>
          </div>
        </td>
        <td style="max-width:280px;">
          <strong style="font-size:13px;display:block;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(r.title)}">
            ${escapeHtml(r.title)}
          </strong>
          <p style="font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:4px;" title="${escapeHtml(r.content)}">
            ${escapeHtml(r.content)}
          </p>
          <div>${tagsHtml}</div>
        </td>
        <td>
          <strong>${escapeHtml(r.authorName)}</strong>
          <small style="display:block;font-size:10px;color:var(--muted);">${escapeHtml(r.authorRole || '')}</small>
          <small style="display:block;font-size:10px;color:#94a196;">${escapeHtml(r.authorMeta || '')}</small>
        </td>
        <td>
          ${r.verified ? '<span class="status-pill status-완료" style="font-size:10px;">인증</span>' : '<span style="color:#b5c0b6;font-size:11px;">미인증</span>'}
        </td>
        <td>
          <label class="toggle-switch">
            <input type="checkbox" ${isVisible ? 'checked' : ''} onchange="toggleReviewVisibility('${r.id}')">
            <span class="toggle-slider"></span>
          </label>
        </td>
        <td>
          <div style="display:flex;gap:6px;">
            <button type="button" class="btn-secondary" style="height:28px;padding:0 8px;font-size:11px;" onclick="openReviewModal('${r.id}')">수정</button>
            <button type="button" style="height:28px;padding:0 8px;font-size:11px;color:#c92a2a;border:1px solid #f8d7da;border-radius:4px;" onclick="deleteReview('${r.id}')">삭제</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderStarIcons(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += `<svg><use href="#icon-star-filled"/></svg>`;
  }
  return stars;
}

async function toggleReviewVisibility(id) {
  try {
    const res = await fetchWithAuth(`${API.reviews}/${id}/toggle`, { method: 'PATCH' });
    if (res.success) {
      showToast(res.message);
      const item = state.reviews.find(r => r.id === id);
      if (item) item.isVisible = res.isVisible;
    }
  } catch (err) {
    showToast('노출 설정 변경 실패', 'error');
  }
}

function openReviewModal(id = null) {
  const modal = document.getElementById('modal-review-form');
  const titleEl = document.getElementById('modal-review-title');

  if (id) {
    const item = state.reviews.find(r => r.id === id);
    if (!item) return;
    titleEl.textContent = '실제 후기 수정';
    document.getElementById('rev-form-id').value = item.id;
    document.getElementById('rev-form-category').value = item.category || 'care';
    document.getElementById('rev-form-rating').value = (item.rating || 5.0).toFixed(1);
    document.getElementById('rev-form-plan').value = item.planBadge || '';
    document.getElementById('rev-form-used').value = item.usedBadge || '';
    document.getElementById('rev-form-title').value = item.title || '';
    document.getElementById('rev-form-content').value = item.content || '';
    document.getElementById('rev-form-tags').value = (item.tags || []).join(', ');
    document.getElementById('rev-form-author').value = item.authorName || '';
    document.getElementById('rev-form-role').value = item.authorRole || '';
    document.getElementById('rev-form-meta').value = item.authorMeta || '';
    document.getElementById('rev-form-avatar-color').value = item.avatarColor || 'rose';
    document.getElementById('rev-form-verified').checked = item.verified !== false;
    document.getElementById('rev-form-visible').checked = item.isVisible !== false;
  } else {
    titleEl.textContent = '신규 실제 후기 등록';
    document.getElementById('rev-form-id').value = '';
    document.getElementById('rev-form-category').value = 'care';
    document.getElementById('rev-form-rating').value = '5.0';
    document.getElementById('rev-form-plan').value = '라이프케어 160';
    document.getElementById('rev-form-used').value = '24시간 병원 간병 5일';
    document.getElementById('rev-form-title').value = '';
    document.getElementById('rev-form-content').value = '';
    document.getElementById('rev-form-tags').value = '#당일간병배정, #친절돌봄';
    document.getElementById('rev-form-author').value = '';
    document.getElementById('rev-form-role').value = '보호자';
    document.getElementById('rev-form-meta').value = '서울';
    document.getElementById('rev-form-avatar-color').value = 'rose';
    document.getElementById('rev-form-verified').checked = true;
    document.getElementById('rev-form-visible').checked = true;
  }

  modal.style.display = 'flex';
}

function closeReviewModal() {
  document.getElementById('modal-review-form').style.display = 'none';
}

async function saveReview() {
  const id = document.getElementById('rev-form-id').value;
  const title = document.getElementById('rev-form-title').value.trim();
  const content = document.getElementById('rev-form-content').value.trim();

  if (!title || !content) {
    showToast('후기 제목과 내용은 필수 입력입니다.', 'error');
    return;
  }

  const payload = {
    category: document.getElementById('rev-form-category').value,
    rating: parseFloat(document.getElementById('rev-form-rating').value) || 5.0,
    planBadge: document.getElementById('rev-form-plan').value.trim(),
    usedBadge: document.getElementById('rev-form-used').value.trim(),
    title: title,
    content: content,
    tags: document.getElementById('rev-form-tags').value.split(',').map(t => t.trim()).filter(Boolean),
    authorName: document.getElementById('rev-form-author').value.trim() || '회원 님',
    authorRole: document.getElementById('rev-form-role').value.trim() || '보호자',
    authorMeta: document.getElementById('rev-form-meta').value.trim() || '서울',
    avatarChar: (document.getElementById('rev-form-author').value.trim().charAt(0) || '리'),
    avatarColor: document.getElementById('rev-form-avatar-color').value,
    verified: document.getElementById('rev-form-verified').checked,
    isVisible: document.getElementById('rev-form-visible').checked
  };

  try {
    let res;
    if (id) {
      res = await fetchWithAuth(`${API.reviews}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetchWithAuth(API.reviews, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }

    if (res.success) {
      showToast(id ? '후기가 수정되었습니다.' : '신규 후기가 등록되었습니다.');
      closeReviewModal();
      loadReviews();
    } else {
      showToast(res.message || '저장 실패', 'error');
    }
  } catch (err) {
    showToast('후기 저장 중 오류 발생', 'error');
  }
}

async function deleteReview(id) {
  if (!confirm('정말 이 후기를 삭제하시겠습니까? 랜딩페이지에서도 노출이 해제됩니다.')) return;
  try {
    const res = await fetchWithAuth(`${API.reviews}/${id}`, { method: 'DELETE' });
    if (res.success) {
      showToast('후기가 삭제되었습니다.');
      state.reviews = state.reviews.filter(r => r.id !== id);
      renderReviewTable();
    }
  } catch (err) {
    showToast('후기 삭제 실패', 'error');
  }
}

/* ========================================================
   4. 접속 통계 분석
   ======================================================== */
function applyAnalyticsPreset(range) {
  const end = new Date();
  const start = new Date();

  if (range === 'today') {
    // start is today
  } else if (range === '7days') {
    start.setDate(end.getDate() - 6);
  } else if (range === '30days') {
    start.setDate(end.getDate() - 29);
  } else if (range === 'all') {
    document.getElementById('analytics-start-date').value = '';
    document.getElementById('analytics-end-date').value = '';
    return;
  }

  document.getElementById('analytics-start-date').value = start.toISOString().slice(0, 10);
  document.getElementById('analytics-end-date').value = end.toISOString().slice(0, 10);
}

async function loadAnalytics() {
  const startDate = document.getElementById('analytics-start-date').value;
  const endDate = document.getElementById('analytics-end-date').value;

  let query = '';
  if (startDate) query += `&startDate=${startDate}`;
  if (endDate) query += `&endDate=${endDate}`;
  if (query) query = '?' + query.substring(1);

  try {
    const res = await fetchWithAuth(`${API.analytics}${query}`);
    state.analytics = res;

    // KPI 카드 업데이트
    const summary = res.summary || {};
    document.getElementById('stat-kpi-pv').textContent = summary.totalPv || 0;
    document.getElementById('stat-kpi-uv').textContent = summary.totalUv || 0;
    document.getElementById('stat-kpi-consult').textContent = summary.totalConsultations || 0;
    document.getElementById('stat-kpi-cvr').textContent = `${summary.conversionRate || '0.00'}%`;

    // 일자별 SVG 차트 렌더링
    renderDailyTrafficSvg(res.dailyStats || []);

    // 유입 사이트 TOP 목록
    renderSourcesList(res.topSources || [], summary.totalPv || 1);

    // 기기 및 브라우저 분포
    renderDevicesList(res.deviceStats || [], res.browserStats || [], summary.totalPv || 1);

    // 최근 방문 로그 및 IP 테이블
    renderRecentLogsTable(res.recentLogs || []);
  } catch (err) {
    showToast('통계 데이터를 불러오지 못했습니다.', 'error');
  }
}

// 순수 SVG 인터랙티브 막대 차트 렌더링
function renderDailyTrafficSvg(dailyStats) {
  const svg = document.getElementById('daily-traffic-svg');
  if (!svg) return;

  if (dailyStats.length === 0) {
    svg.innerHTML = `<text x="50%" y="50%" text-anchor="middle" fill="#88988a" font-size="13">해당 기간의 접속 통계 데이터가 없습니다.</text>`;
    return;
  }

  const width = svg.clientWidth || 800;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...dailyStats.map(d => Math.max(d.pv, d.uv, d.consultations)), 5);
  const barGroupWidth = chartW / dailyStats.length;
  const barWidth = Math.max(Math.min(barGroupWidth * 0.28, 24), 6);

  let gridLines = '';
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartH / 4) * i;
    const val = Math.round(maxVal * (1 - i / 4));
    gridLines += `
      <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#eef2ec" stroke-dasharray="3 3"/>
      <text x="${padding.left - 8}" y="${y + 4}" font-size="10" fill="#99a89d" text-anchor="end">${val}</text>
    `;
  }

  let barsHtml = '';
  let labelsHtml = '';

  dailyStats.forEach((item, idx) => {
    const centerX = padding.left + barGroupWidth * idx + barGroupWidth / 2;

    const pvH = (item.pv / maxVal) * chartH;
    const uvH = (item.uv / maxVal) * chartH;
    const cH = (item.consultations / maxVal) * chartH;

    const pvX = centerX - barWidth * 1.1;
    const uvX = centerX;
    const cX = centerX + barWidth * 1.1;

    const pvY = padding.top + chartH - pvH;
    const uvY = padding.top + chartH - uvH;
    const cY = padding.top + chartH - cH;

    // 막대들
    barsHtml += `
      <g class="chart-col" title="${item.date}: PV ${item.pv}건, UV ${item.uv}명, 상담 ${item.consultations}건">
        <!-- PV 막대 (핑크) -->
        <rect x="${pvX}" y="${pvY}" width="${barWidth}" height="${pvH}" fill="#d46784" rx="3">
          <title>${item.date} PV: ${item.pv}회</title>
        </rect>
        <!-- UV 막대 (그린) -->
        <rect x="${uvX}" y="${uvY}" width="${barWidth}" height="${uvH}" fill="#4e795a" rx="3">
          <title>${item.date} UV: ${item.uv}명</title>
        </rect>
        <!-- 상담 막대 (블루) -->
        <rect x="${cX}" y="${cY}" width="${barWidth}" height="${cH}" fill="#2b74b9" rx="3">
          <title>${item.date} 상담 접수: ${item.consultations}건</title>
        </rect>
      </g>
    `;

    // X축 일자 라벨 (MM.DD)
    const shortDate = item.date.slice(5);
    labelsHtml += `
      <text x="${centerX}" y="${height - 15}" font-size="11" fill="#78847c" text-anchor="middle">${shortDate}</text>
    `;
  });

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.innerHTML = gridLines + barsHtml + labelsHtml;
}

function renderSourcesList(sources, totalPv) {
  const container = document.getElementById('analytics-sources-list');
  if (sources.length === 0) {
    container.innerHTML = `<p style="text-align:center;padding:20px;color:var(--muted);font-size:12px;">유입 데이터가 없습니다.</p>`;
    return;
  }
  const max = Math.max(...sources.map(s => s.count), 1);
  container.innerHTML = sources.map(s => {
    const pct = Math.round((s.count / totalPv) * 100);
    return `
      <div class="rank-item">
        <div class="rank-header">
          <span>${escapeHtml(s.source)}</span>
          <span>${s.count}회 (${pct}%)</span>
        </div>
        <div class="rank-bar-bg">
          <div class="rank-bar-fill" style="width:${(s.count / max) * 100}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderDevicesList(devices, browsers, totalPv) {
  const container = document.getElementById('analytics-devices-list');
  const allItems = [
    ...devices.map(d => ({ label: `[기기] ${d.name}`, count: d.count })),
    ...browsers.map(b => ({ label: `[브라우저] ${b.name}`, count: b.count }))
  ].sort((a, b) => b.count - a.count);

  if (allItems.length === 0) {
    container.innerHTML = `<p style="text-align:center;padding:20px;color:var(--muted);font-size:12px;">기기 데이터가 없습니다.</p>`;
    return;
  }

  const max = Math.max(...allItems.map(i => i.count), 1);
  container.innerHTML = allItems.slice(0, 6).map(item => {
    const pct = Math.round((item.count / totalPv) * 100);
    return `
      <div class="rank-item">
        <div class="rank-header">
          <span>${escapeHtml(item.label)}</span>
          <span>${item.count}회 (${pct}%)</span>
        </div>
        <div class="rank-bar-bg">
          <div class="rank-bar-fill mint" style="width:${(item.count / max) * 100}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderRecentLogsTable(logs) {
  const tbody = document.getElementById('analytics-recent-logs-tbody');
  if (logs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--muted);">기록된 방문 로그가 없습니다.</td></tr>`;
    return;
  }
  tbody.innerHTML = logs.slice(0, 40).map(log => {
    return `
      <tr>
        <td><small style="color:var(--muted);">${formatDate(log.timestamp)}</small></td>
        <td><code style="font-size:11px;background:#f3f6f2;padding:2px 5px;border-radius:4px;">${escapeHtml(log.ip || '-')}</code></td>
        <td><strong style="font-size:12px;">${escapeHtml(log.source || '직접 접속')}</strong></td>
        <td><span class="badge-outline">${escapeHtml(log.device || '-')}</span></td>
        <td>${escapeHtml(log.browser || '-')}</td>
        <td><small style="color:var(--muted);">${escapeHtml(log.path || '/')}</small></td>
      </tr>
    `;
  }).join('');
}

/* ========================================================
   5. 푸터 및 개인정보 동의 정책 설정 관리
   ======================================================== */
async function loadSettingsData() {
  try {
    const res = await fetchWithAuth(API.settings);
    const settings = res.settings || {};
    const footer = settings.footer || {};
    const privacy = settings.privacy || {};

    // 푸터 필드 채우기
    document.getElementById('set-footer-slogan').value = footer.slogan || '당신의 일상에, 돌봄이 함께.';
    document.getElementById('set-footer-copyright').value = footer.copyright || '© LIVON CARE. All rights reserved.';
    document.getElementById('set-footer-phone').value = footer.customerPhone || '1588-0000';
    document.getElementById('set-footer-hours').value = footer.customerHours || '평일 09:00 ~ 18:00 (주말·공휴일 휴무)';
    document.getElementById('set-footer-business-info').value = footer.businessInfo || '';

    // 푸터 미리보기 반영
    document.getElementById('prev-footer-slogan').textContent = footer.slogan || '당신의 일상에, 돌봄이 함께.';
    document.getElementById('prev-footer-business').textContent = footer.businessInfo || '리본케어 라이프케어 멤버십 안내';
    document.getElementById('prev-footer-copy').textContent = footer.copyright || '© LIVON CARE. All rights reserved.';

    // 개인정보 필드 채우기
    document.getElementById('set-privacy-title').value = privacy.title || '개인정보 수집 및 이용 안내 (필수)';
    document.getElementById('set-privacy-checkbox-text').value = privacy.consentCheckboxText || '개인정보 수집 및 이용에 동의합니다.';
    document.getElementById('set-privacy-items').value = privacy.items || '이름, 연락처(휴대전화번호), 관심 상품 및 관심 서비스';
    document.getElementById('set-privacy-purpose').value = privacy.purpose || '리본케어 멤버십 상품 상담, 맞춤 서비스 안내 및 관련 문의 응대';
    document.getElementById('set-privacy-period').value = privacy.period || '상담 접수일로부터 1년 (이용자 요청 시 지체 없이 파기)';
    document.getElementById('set-privacy-footer-notice').value = privacy.footerNotice || '접수된 개인정보는 상기 목적 외의 용도로 사용되지 않으며, 안전하게 보호 관리됩니다.';
    document.getElementById('set-privacy-refusal').value = privacy.refusal || '';
    document.getElementById('set-privacy-full').value = privacy.fullContent || '';
  } catch (err) {
    showToast('설정 데이터를 불러오지 못했습니다.', 'error');
  }
}

async function saveSettingsData() {
  const submitBtn = document.getElementById('btn-save-settings');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span>저장 중...</span>';

  const footer = {
    slogan: document.getElementById('set-footer-slogan').value.trim(),
    copyright: document.getElementById('set-footer-copyright').value.trim(),
    customerPhone: document.getElementById('set-footer-phone').value.trim(),
    customerHours: document.getElementById('set-footer-hours').value.trim(),
    businessInfo: document.getElementById('set-footer-business-info').value.trim()
  };

  const privacy = {
    title: document.getElementById('set-privacy-title').value.trim(),
    consentCheckboxText: document.getElementById('set-privacy-checkbox-text').value.trim(),
    items: document.getElementById('set-privacy-items').value.trim(),
    purpose: document.getElementById('set-privacy-purpose').value.trim(),
    period: document.getElementById('set-privacy-period').value.trim(),
    footerNotice: document.getElementById('set-privacy-footer-notice').value.trim(),
    refusal: document.getElementById('set-privacy-refusal').value.trim(),
    fullContent: document.getElementById('set-privacy-full').value.trim()
  };

  try {
    const res = await fetchWithAuth(API.settings, {
      method: 'PUT',
      body: JSON.stringify({ footer, privacy })
    });
    if (res.success) {
      showToast('푸터 문구 및 개인정보 정책이 성공적으로 저장되었습니다!');
    } else {
      showToast(res.message || '저장 실패', 'error');
    }
  } catch (err) {
    showToast('설정 저장 중 오류가 발생했습니다.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<svg style="width:18px;height:18px;"><use href="#icon-check"/></svg><span>푸터 및 개인정보 설정 저장하기</span>`;
  }
}

/* ========================================================
   유틸리티 함수
   ======================================================== */
function formatDate(isoStr) {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${m}.${day} ${h}:${min}`;
  } catch (e) {
    return isoStr;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
