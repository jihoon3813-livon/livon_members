const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

// 1. 케어 탭 데이터
const data = {
  daily: {
    bannerImg: 'https://res.cloudinary.com/lyjyvy54/image/upload/f_auto,q_auto,w_1200/v1793240879/%EA%B1%B4%EA%B0%95%ED%95%9C_%EC%9D%BC%EC%83%81%EC%9D%84_%EB%8F%95%EB%8A%94_%EB%A6%AC%EB%B3%B8%EC%BC%80%EC%96%B4-1_ktbsqo.png',
    bannerTitle: '01 평상시 케어 — 건강한 일상을 돕는 리본케어',
    bannerAlt: '01 평상시 케어 안내 배너 - 건강한 일상을 돕는 리본케어',
    bannerFallback: 'assets/daily-care.png',
    lead: '건강할 때부터, 일상 속 건강관리를 함께 준비합니다.',
    tag: '기본 포함',
    items: [
      ['heart', '건강상담', '궁금한 건강정보를 상담을 통해 안내합니다.', '제공 범위 보기 ↗', 'daily'],
      ['cross', '병원·진료과 안내', '필요한 의료기관과 진료과 정보를 확인합니다.', '제공 범위 보기 ↗', 'daily'],
      ['phone', '진료예약 지원', '의료기관 이용에 필요한 예약 절차를 돕습니다.', '제공 범위 보기 ↗', 'daily'],
      ['leaf', '검진 설계·예약', '건강검진 항목과 예약 절차를 안내합니다.', '제공 범위 보기 ↗', 'daily'],
      ['spark', '건강정보', '일상 속 건강관리에 참고할 정보를 제공합니다.', '제공 범위 보기 ↗', 'daily']
    ]
  },
  treatment: {
    bannerImg: 'https://res.cloudinary.com/lyjyvy54/image/upload/f_auto,q_auto,w_1200/v1793240879/%EC%B9%98%EB%A3%8C%EB%B6%80%ED%84%B0_%ED%9A%8C%EB%B3%B5%EA%B9%8C%EC%A7%80_%ED%95%A8%EA%BB%98%ED%95%98%EB%8A%94_%EC%BC%80%EC%96%B4-2_yqqzoo.png',
    bannerTitle: '02 치료지원 케어 — 치료부터 회복까지 함께하는 케어',
    bannerAlt: '02 치료지원 케어 안내 배너 - 치료부터 회복까지 함께하는 케어',
    bannerFallback: 'assets/treatment-care.png',
    lead: '치료와 회복에 필요한 실질적인 도움을 선택하세요.',
    tag: '통합 한도에서 차감',
    items: [
      ['heart', '간병인 지원', '입원 중 곁에서 필요한 일상 돌봄을 지원합니다.', '24시간 · 1회 차감', 'care'],
      ['cross', '간호사 동행', '병원 진료에 도움이 필요한 순간, 함께합니다.', '이용 기준 보기 ↗', 'nurse'],
      ['car', '차량 에스코트', '병원까지의 이동이 필요한 날을 위한 지원입니다.', '이용 기준 보기 ↗', 'car'],
      ['leaf', '가사도우미', '회복하는 동안 부담되는 집안일을 돕습니다.', '4시간 · 0.5회 차감', 'home'],
      ['house', '정리수납', '일상으로 돌아갈 공간을 편안하게 정리합니다.', '1곳 4시간 · 1회 차감', 'organize']
    ]
  },
  smart: {
    bannerImg: 'https://res.cloudinary.com/lyjyvy54/image/upload/f_auto,q_auto,w_1200/v1793240878/%EC%A7%91%EC%97%90%EC%84%9C%EB%8F%84_%EC%9D%B4%EC%96%B4%EC%A7%80%EB%8A%94_%EB%94%B0%EB%9C%BB%ED%95%9C_%EB%8F%8C%EB%B4%84-3_ekpdfx.png',
    bannerTitle: '03 스마트 홈케어 — 집에서도 이어지는 따뜻한 돌봄',
    bannerAlt: '03 스마트 홈케어 안내 배너 - 집에서도 이어지는 따뜻한 돌봄',
    bannerFallback: 'assets/smart-home-care.png',
    lead: '병원 밖, 집에서도 이어지는 돌봄을 5년간 무상으로 연결합니다.',
    tag: '통합 한도에서 차감',
    items: [
      ['phone', '케어비전 태블릿', '스마트 홈케어 5년 무상 이용 중심 기기입니다.', '패키지 구성 보기 ↗', 'smart'],
      ['house', '홈 센서', '생활 환경에 맞춰 구성하는 5년 무상 센서 패키지입니다.', '패키지 구성 보기 ↗', 'smart'],
      ['heart', '보호자 연결', '실제 지원 가능한 가족 연결·알림 기능을 제공합니다.', '패키지 구성 보기 ↗', 'smart'],
      ['spark', '설치·이용 안내', '5년 무상 제공 (이후 월 이용료 발생 가능).', '패키지 구성 보기 ↗', 'smart']
    ]
  },
  extra: {
    bannerImg: 'https://res.cloudinary.com/lyjyvy54/image/upload/f_auto,q_auto,w_1200/v1793240879/%EA%B0%80%EC%A1%B1%EA%B3%BC_%EA%B1%B4%EA%B0%95%EC%9D%84_%EB%8D%94%ED%95%98%EB%8A%94_%EB%A6%AC%EB%B3%B8%EC%BC%80%EC%96%B4_%ED%98%9C%ED%83%9D-4_bqtxpa.png',
    bannerTitle: '04 추가 지원 케어 — 가족과 건강을 더하는 리본케어 혜택',
    bannerAlt: '04 추가 지원 케어 안내 배너 - 가족과 건강을 더하는 리본케어 혜택',
    bannerFallback: 'assets/membership-benefits.png',
    lead: '건강과 가족의 일상에 더하는 멤버십 혜택입니다.',
    tag: '횟수 차감 없음',
    items: [
      ['heart', '가족 스토리 영상', '우리 가족의 사진과 사연을 3분 영상으로 담습니다.', '제작 안내 보기 ↗', 'video'],
      ['leaf', '건강기능식품', '일상의 건강을 챙기는 제품 구성입니다.', '구성 안내 보기 ↗', 'nutrition'],
      ['house', '숙박시설 할인', '함께 쉬어가는 시간을 회원 할인가로 준비합니다.', '이용 안내 보기 ↗', 'stay'],
      ['spark', '선택형 특화 혜택', '우리 가족에게 필요한 혜택 1종을 선택합니다.', '세 가지 혜택 보기 ↗', 'choice']
    ]
  }
};

// 탭 배너 이미지 백그라운드 사전 로딩 (탭 전환 시 깜빡임/지연 없이 즉시 표시)
Object.values(data).forEach(tab => {
  if (tab.bannerImg) {
    const preload = new Image();
    preload.src = tab.bannerImg;
  }
});

// 2. 케어 탭 렌더링
function renderTab(key) {
  let x = data[key];
  if (!x) return;
  const isDeduct = key === 'treatment' || key === 'smart';
  $('#care-panel').innerHTML = `
    <div class="care-panel-banner" data-preview-img="${x.bannerImg}" data-preview-title="${x.bannerTitle}" title="클릭하면 큰 화면으로 볼 수 있습니다">
      <img src="${x.bannerImg}" alt="${x.bannerAlt}" decoding="async" fetchpriority="high" onerror="this.onerror=null;this.src='${x.bannerFallback}';">
    </div>
    <div class="care-panel-head">
      <p>${x.lead}</p>
      <div class="category-badge-group">
        <span class="badge ${isDeduct ? 'badge-red' : ''}">${x.tag}</span>
        ${key === 'smart' ? '<span class="deduct-chip">5회 차감</span>' : ''}
      </div>
    </div>
    <div class="service-grid cols-${x.items.length}" data-cols="${x.items.length}">
      ${x.items.map((a, i) => `
        <article class="service-card">
          <span class="icon-bubble ${i % 2 ? 'rose' : 'mint'}">
            <svg><use href="#i-${a[0]}"/></svg>
          </span>
          <h3>${a[1]}</h3>
          <p>${a[2]}</p>
          <button data-detail="${a[4]}" aria-label="${a[1]} 상세 이용 기준">${a[3]}</button>
        </article>
      `).join('')}
    </div>
  `;
  $('#care-panel').setAttribute('aria-labelledby', 'tab-' + key);
  $$('[data-tab]').forEach(b => {
    let active = b.dataset.tab === key;
    b.setAttribute('aria-selected', String(active));
    b.tabIndex = active ? 0 : -1;
  });
}
renderTab('treatment');

$$('[data-tab]').forEach(b => {
  b.onclick = () => renderTab(b.dataset.tab);
  b.onkeydown = e => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    let all = $$('[data-tab]');
    let i = all.indexOf(b);
    let n = e.key === 'Home' ? 0 : e.key === 'End' ? all.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length;
    all[n].focus();
    renderTab(all[n].dataset.tab);
  };
});

// 3. 서비스 상세 설명 다이얼로그
const details = {
  care: [
    '간병인 지원 이용 기준',
    '일반 간병 24시간 기준 통합 한도 1회를 차감하는 구성입니다.',
    '제공 지역, 배정 일정, 특수 간병 및 추가비용은 최종 상품조건 확인이 필요합니다.'
  ],
  nurse: [
    '간호사 동행 이용 기준',
    '병원 진료 동행을 제공하는 전문 서비스입니다.',
    '통합 한도 1회 차감을 잠정 검토 중입니다. 기본 제공시간·지역·초과시간 기준은 최종 확정 후 안내됩니다.'
  ],
  car: [
    '차량 에스코트 이용 기준',
    '지정 권역 내 병원 이동을 안전하게 지원하는 서비스입니다.',
    '편도 구간, 제공 횟수, 차감 기준과 추가비용은 확정 전입니다. 응급출동 서비스가 아닙니다.'
  ],
  home: [
    '가사도우미 지원 이용 기준',
    '30평형 기준 4시간 방문당 통합 한도 0.5회를 차감하는 구성입니다.',
    '작업 범위·제공 지역·추가시간 등 상세 기준은 출시 전 최종 확정됩니다.'
  ],
  organize: [
    '정리수납 서비스 이용 기준',
    '옷방 또는 주방 1곳을 4시간 동안 전문가가 집중 정리하는 기준으로 통합 한도 1회를 차감합니다.',
    '작업 범위, 제공 가능 지역과 추가비용은 최종 안내를 확인해 주세요.'
  ],
  smart: [
    '리본 스마트 안심홈 이용 안내',
    '케어비전 태블릿과 홈 센서, 가족을 위한 안심 보호자 연결 기능을 결합하는 패키지입니다. 통합 한도에서 5회를 차감하여 5년간 무상으로 기본 제공되며, 5년 이후에는 월 이용료가 발생할 수 있습니다.',
    '🚨 [실제 골든타임 구조 사례] 단순한 스마트 기기가 아닌 어르신의 생명을 살린 검증된 안심 서비스입니다. 화재나 위급 상황 시 119에 자동으로 즉시 신고되어 골든타임 내에 소방대가 출동하여 생명을 구한 실제 구조 사례(KBS 단독 보도)가 입증하듯 24시간 든든한 일상을 지켜드립니다.',
    '장비 구성·대여 및 반환 기준·설치 조건은 최종 확정 시 안내됩니다. 화면의 장비와 기능 표현은 실제 거실 연출 및 이해를 돕는 일러스트입니다.'
  ],
  daily: [
    '평상시 케어 안내',
    '건강상담, 병원·진료과 안내, 진료예약 지원, 검진 설계·예약 지원 등을 포함하는 기본 포함 구성입니다.',
    '가족 이용 범위와 운영시간·기간은 확정 전입니다. 상담과 행정지원은 의료진의 진료·진단을 대신하지 않으며, 진료비와 검진비는 별도입니다.'
  ],
  video: [
    'AI 가족 스토리 영상 제작 안내',
    '① 가족 사진과 사연 접수 → ② 전문 템플릿 선택 → ③ AI 가족 스토리 영상 제작 → ④ 완성본 감상 및 소장',
    '3분 분량 영상 1편을 추가 비용 없이 회원 혜택으로 제공합니다. 수정 범위와 접수 일정은 확정 후 안내됩니다.'
  ],
  nutrition: [
    '건강기능식품 구성 안내',
    '멤버십 회원에게 건강기능식품 실물을 정기 또는 패키지로 제공하는 구성입니다.',
    '제품·수량·공급조건을 확정한 후 상세 안내드립니다. 시중 100만원 상당 제공을 목표로 검토 중이며, 해당 금액은 아직 확정된 혜택이 아닙니다.'
  ],
  stay: [
    '제휴 숙박시설 할인 혜택',
    '제휴 숙박시설을 리본케어 회원 조건에 따라 특별 할인된 가격으로 이용하는 혜택입니다.',
    '시설 목록, 객실, 이용기간과 예약 가능 조건은 확정 후 안내합니다. 숙박비는 별도이며 최저가를 보장하는 혜택은 아닙니다.'
  ],
  choice: [
    '우리 가족을 위한 선택형 특화 혜택',
    '• 안심형 : 생활·돌봄 설문과 안심 확인 전화, 가족용 안심생활 리포트 발송\n• 추억형 : 옛 흑백/손상 사진 복원 및 디지털 가족 앨범 제작\n• 생활형 : 집 사진과 전문 체크리스트를 통한 주거 환경 안전 개선 가이드',
    '세 가지 특화 혜택 중 1종을 선택하여 이용하는 기획입니다. 제공 범위와 신청기간은 출시 전 확정됩니다.'
  ],
  privacy: [
    '개인정보 수집 및 이용 안내 (필수)',
    '1. 수집하는 개인정보 항목: 이름, 연락처(휴대전화번호), 관심 상품 및 관심 서비스\n2. 수집 및 이용 목적: 리본케어 멤버십 상품 상담, 맞춤 서비스 안내 및 관련 문의 응대\n3. 보유 및 이용 기간: 상담 접수일로부터 1년 (이용자 요청 시 지체 없이 파기)\n4. 동의 거부 권리: 귀하는 개인정보 수집 및 이용에 동의하지 않을 권리가 있습니다. 단, 필수 항목 동의 거부 시 원활한 상담 서비스 제공이 제한될 수 있습니다.',
    '접수된 개인정보는 상기 목적 외의 용도로 사용되지 않으며, 안전하게 보호 관리됩니다.'
  ]
};

const detailDialog = $('#detail-dialog');
let prevFocus;

function openDialog(title, paras, detailKey) {
  prevFocus = document.activeElement;
  $('#dialog-title').textContent = title;
  const isDeduct = ['care', 'home', 'organize', 'smart'].includes(detailKey);
  const tagEl = $('#dialog-tag');
  if (tagEl) {
    if (isDeduct) {
      tagEl.textContent = '통합 한도에서 차감';
      tagEl.className = 'eyebrow dialog-tag-deduct';
    } else {
      tagEl.textContent = 'LIVON CARE GUIDE';
      tagEl.className = 'eyebrow';
    }
  }
  if (isDeduct) {
    detailDialog.classList.add('dialog-deduct');
  } else {
    detailDialog.classList.remove('dialog-deduct');
  }
  $('#dialog-body').replaceChildren(...paras.map(t => {
    let p = document.createElement('p');
    if (isDeduct) {
      // 차감 관련 회차 및 문구를 진한 레드 하이라이트로 강조
      p.innerHTML = t.replace(/(통합 한도에서\s*5회를\s*차감|통합 한도\s*[0-9.]*회(?:를)?\s*차감|[0-9.]*회\s*차감)/g, '<strong class="modal-deduct-highlight">$1</strong>');
    } else {
      p.textContent = t;
    }
    p.style.whiteSpace = 'pre-line';
    return p;
  }));
  detailDialog.showModal();
}

function closeDialog() {
  detailDialog.close();
  prevFocus?.focus();
}

document.addEventListener('click', e => {
  let b = e.target.closest('[data-detail]');
  if (b) {
    let k = b.dataset.detail;
    let d = details[k];
    if (d) openDialog(d[0], d.slice(1), k);
  }
});

$('.dialog-close').onclick = closeDialog;
$('.dialog-done').onclick = closeDialog;
detailDialog.addEventListener('click', e => {
  if (e.target === detailDialog) {
    let r = detailDialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
      closeDialog();
    }
  }
});

// 4. 인포그래픽 라이트박스 뷰어
const imageDialog = $('#image-dialog');
const imageDialogImg = $('#image-dialog-img');
const imageDialogTitle = $('#image-dialog-title');

function openImageLightbox(src, title) {
  imageDialogImg.src = src;
  imageDialogImg.alt = title;
  imageDialogTitle.textContent = title;
  imageDialog.showModal();
}

function closeImageLightbox() {
  imageDialog.close();
  imageDialogImg.src = '';
}

document.addEventListener('click', e => {
  let btn = e.target.closest('[data-preview-img]');
  if (btn) {
    let src = btn.dataset.previewImg;
    let title = btn.dataset.previewTitle || '안내 인포그래픽';
    openImageLightbox(src, title);
  }
});

$('.lightbox-close').onclick = closeImageLightbox;
imageDialog.addEventListener('click', e => {
  if (e.target === imageDialog) {
    let r = imageDialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
      closeImageLightbox();
    }
  }
});

// 5. 케어 조합 계산기
let state = { limit: 7, care: 0, home: 0, smart: 0 };
const cost = () => state.care + state.home * 0.5 + state.smart * 5;

function combo() {
  let a = [];
  if (state.care) a.push(`간병 ${state.care}일`);
  if (state.home) a.push(`가사 지원 ${state.home}회 방문`);
  if (state.smart) a.push('스마트 홈케어 1패키지');
  return a.join(' + ');
}

function updateBuilder() {
  let used = cost();
  let remaining = state.limit - used;

  $('#remaining').textContent = remaining;
  $('#total').textContent = state.limit;
  $('#count-care').textContent = state.care;
  $('#count-home').textContent = state.home;

  $('#smart-switch').setAttribute('aria-checked', String(!!state.smart));
  $('#smart-switch').disabled = !state.smart && remaining < 5;

  $('#progress').innerHTML = Array.from({ length: state.limit }, (_, i) =>
    `<span class="${used >= i + 1 ? 'used' : used > i ? 'half' : ''}"></span>`
  ).join('');

  $('#builder-status').textContent =
    used === 0 ? '자유롭게 선택하세요' :
    remaining === 0 ? '케어 한도를 모두 선택했어요' :
    `${used}회 선택했어요`;

  $('#builder-live').textContent = combo() || '필요한 서비스를 더해 나만의 구성을 만들어 보세요.';

  $$('[data-change]').forEach(b => {
    let [k, d] = b.dataset.change.split(':');
    b.disabled = +d < 0 ? state[k] === 0 : remaining < (k === 'care' ? 1 : 0.5);
  });

  $$('[data-plan]').forEach(b => {
    let active = +b.dataset.plan === state.limit;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', String(active));
  });
}

$$('[data-change]').forEach(b => {
  b.onclick = () => {
    let [k, d] = b.dataset.change.split(':');
    state[k] += +d;
    updateBuilder();
  };
});

$('#smart-switch').onclick = () => {
  state.smart = state.smart ? 0 : 1;
  updateBuilder();
};

$$('[data-plan]').forEach(b => {
  b.onclick = () => {
    let n = +b.dataset.plan;
    if (cost() > n) {
      state = { limit: n, care: 0, home: 0, smart: 0 };
      updateBuilder();
      $('#builder-live').textContent = '상품 한도에 맞게 선택을 초기화했어요. 다시 조합해 주세요.';
    } else {
      state.limit = n;
      updateBuilder();
    }
  };
});

$('#apply-example').onclick = () => {
  state = { limit: 7, care: 5, home: 4, smart: 0 };
  updateBuilder();
  if (innerWidth < 761) {
    $('.builder-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

$('#combo-consult').onclick = e => {
  e.preventDefault();
  let plan = state.limit === 7 ? '160' : '320';
  let curCombo = combo();
  $('#form-plan').value = plan;
  $('#selected-combo').hidden = !curCombo;
  $('#selected-combo').textContent = '선택한 조합: ' + curCombo;
  openConsultModal(plan, curCombo);
};

$$('[data-select]').forEach(a => {
  a.onclick = e => {
    e.preventDefault();
    $('#form-plan').value = a.dataset.select;
    $('#selected-combo').hidden = true;
    openConsultModal(a.dataset.select, null);
  };
});

updateBuilder();

// 6. 네비게이션 & 모바일 메뉴 토글
$('.menu-toggle').onclick = () => {
  let open = $('.menu-toggle').getAttribute('aria-expanded') === 'true';
  $('.menu-toggle').setAttribute('aria-expanded', String(!open));
  $('.menu-toggle').setAttribute('aria-label', open ? '메뉴 열기' : '메뉴 닫기');
  $('.mobile-nav').hidden = open;
};

$$('.mobile-nav a').forEach(a => {
  a.onclick = () => {
    $('.mobile-nav').hidden = true;
    $('.menu-toggle').setAttribute('aria-expanded', 'false');
  };
});

// ==========================================
// 운영 / 개발 Convex 엔드포인트 분리 설정
// ==========================================
const CONVEX_PROD_SITE_URL = 'https://perceptive-pig-703.ap-southeast-2.convex.site';
const CONVEX_DEV_SITE_URL = 'https://loyal-peccary-567.ap-southeast-2.convex.site';

// 현재 환경 판별 (로컬/개발 vs 운영)
function isLocalOrDevEnvironment() {
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.includes('dev.');
}

// 환경에 따른 Convex 직접 전송 URL
function getTargetConvexUrl() {
  return isLocalOrDevEnvironment() ? CONVEX_DEV_SITE_URL : CONVEX_PROD_SITE_URL;
}

// 상담 신청 공통 전송 함수 (운영/개발 데이터 완벽 분리 + 정적 호스팅 지원)
async function sendConsultationData(payload) {
  const isLocal = isLocalOrDevEnvironment();
  const directConvexUrl = `${getTargetConvexUrl()}/api/consult`;

  // 1. 로컬 개발 환경인 경우: 자체 서버 우선
  if (isLocal) {
    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[로컬 서버 미응답, 개발 Convex 직접 전송]:', e);
    }
    // 로컬 서버 미응답 시 개발 Convex로 직접 전송
    const devRes = await fetch(directConvexUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await devRes.json();
  }

  // 2. 운영 환경 (GitHub Pages / 실서비스 도메인 등)
  // GitHub Pages 정적 호스팅에서는 즉시 운영 Convex로 직접 전송
  if (window.location.hostname.includes('github.io')) {
    const directRes = await fetch(directConvexUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await directRes.json();
  }

  // Vercel 등 백엔드 API가 있는 경우
  try {
    const res = await fetch('/api/consult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('[상대경로 실패, 운영 Convex 직접 전송]:', e);
  }

  // 폴백: 운영 Convex 직접 전송
  const prodRes = await fetch(directConvexUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await prodRes.json();
}

// 7. 상담 신청 폼: 자동 포맷팅, 유효성 검사 및 서버 전송 (fallback localStorage)
const inputName = $('#input-name');
const inputPhone = $('#input-phone');
const consentCheck = $('#consent-check');
const nameError = $('#name-error');
const phoneError = $('#phone-error');
const consentError = $('#consent-error');
const consultForm = $('#consult-form');
const submitBtn = $('#submit-btn');

// 전화번호 자동 하이픈 포맷팅
inputPhone.addEventListener('input', e => {
  let val = e.target.value.replace(/[^0-9]/g, '');
  if (val.length > 3 && val.length <= 7) {
    val = val.substring(0, 3) + '-' + val.substring(3);
  } else if (val.length > 7) {
    val = val.substring(0, 3) + '-' + val.substring(3, 7) + '-' + val.substring(7, 11);
  }
  e.target.value = val;
  if (phoneError.textContent) validatePhone();
});

inputName.addEventListener('input', () => {
  if (nameError.textContent) validateName();
});

consentCheck.addEventListener('change', () => {
  if (consentError.textContent) validateConsent();
});

function validateName() {
  const val = inputName.value.trim();
  if (!val) {
    nameError.textContent = '성함을 입력해 주세요.';
    inputName.classList.add('has-error');
    return false;
  }
  if (val.length < 2) {
    nameError.textContent = '성함을 2글자 이상 입력해 주세요.';
    inputName.classList.add('has-error');
    return false;
  }
  nameError.textContent = '';
  inputName.classList.remove('has-error');
  return true;
}

function validatePhone() {
  const val = inputPhone.value.trim();
  const phonePattern = /^01[0-9]-[0-9]{3,4}-[0-9]{4}$/;
  if (!val) {
    phoneError.textContent = '연락처를 입력해 주세요.';
    inputPhone.classList.add('has-error');
    return false;
  }
  if (!phonePattern.test(val)) {
    phoneError.textContent = '올바른 휴대전화 번호(010-0000-0000)를 입력해 주세요.';
    inputPhone.classList.add('has-error');
    return false;
  }
  phoneError.textContent = '';
  inputPhone.classList.remove('has-error');
  return true;
}

function validateConsent() {
  if (!consentCheck.checked) {
    consentError.textContent = '개인정보 수집 및 이용에 동의해 주세요.';
    return false;
  }
  consentError.textContent = '';
  return true;
}

consultForm.onsubmit = async e => {
  e.preventDefault();

  const isNameValid = validateName();
  const isPhoneValid = validatePhone();
  const isConsentValid = validateConsent();

  if (!isNameValid || !isPhoneValid || !isConsentValid) {
    return;
  }

  const interests = $$('input[name="interest"]:checked').map(cb => cb.value);
  const curCombo = combo();

  const payload = {
    name: inputName.value.trim(),
    phone: inputPhone.value.trim(),
    plan: $('#form-plan').value,
    interests: interests,
    combo: curCombo || null,
    consent: true
  };

  // 로딩 상태 표시
  const origBtnText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.textContent = '접수 중...';

  try {
    const result = await sendConsultationData(payload);

    if (result && result.success) {
      openDialog('상담 신청 접수 완료', [
        `[접수번호: ${result.consultationId}]`,
        `${payload.name} 고객님의 상담 신청이 정상적으로 등록되었습니다.`,
        '전문 상담사가 접수된 내용을 확인한 후, 남겨주신 연락처(' + payload.phone + ')로 순차적으로 연락드리겠습니다. 감사합니다.'
      ]);
      consultForm.reset();
      $('#selected-combo').hidden = true;
    } else {
      throw new Error((result && result.message) || '접수 실패');
    }
  } catch (err) {
    // API 서버가 동작하지 않는 정적 호스팅 환경일 경우 localStorage에 안전하게 보관 (Fallback)
    try {
      const offlineId = 'LIVON-' + Date.now().toString(36).toUpperCase();
      const stored = JSON.parse(localStorage.getItem('livon_consultations') || '[]');
      stored.unshift({ ...payload, id: offlineId, createdAt: new Date().toISOString() });
      localStorage.setItem('livon_consultations', JSON.stringify(stored));

      openDialog('상담 신청 완료', [
        `[접수번호: ${offlineId}]`,
        `${payload.name} 고객님의 상담 신청이 안전하게 접수되었습니다.`,
        '확인 후 빠른 시일 내에 기재해주신 번호(' + payload.phone + ')로 안내 연락드리겠습니다.'
      ]);
      consultForm.reset();
      $('#selected-combo').hidden = true;
    } catch (saveErr) {
      openDialog('안내', ['상담 접수 처리 중 일시적인 오류가 발생했습니다. 고객센터(1588-0000)로 문의 부탁드립니다.']);
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = origBtnText;
  }
};

// 8. 상담 신청 팝업 모달 다이얼로그 (하단 상담신청 섹션 외 나머지 상담신청 버튼 클릭 시 팝업)
const consultDialog = $('#consult-dialog');
const consultDialogClose = $('.consult-dialog-close');
const modalConsultForm = $('#modal-consult-form');
const modalInputName = $('#modal-input-name');
const modalInputPhone = $('#modal-input-phone');
const modalFormPlan = $('#modal-form-plan');
const modalSelectedCombo = $('#modal-selected-combo');
const modalConsentCheck = $('#modal-consent-check');
const modalNameError = $('#modal-name-error');
const modalPhoneError = $('#modal-phone-error');
const modalConsentError = $('#modal-consent-error');
const modalSubmitBtn = $('#modal-submit-btn');

function openConsultModal(plan = null, comboText = null) {
  if (!consultDialog) return;

  // 상품 선택 동기화 (전달된 플랜이 있으면 우선 적용)
  if (plan && modalFormPlan) {
    modalFormPlan.value = plan;
  }

  // 계산기 선택 조합 동기화
  if (modalSelectedCombo) {
    if (comboText) {
      modalSelectedCombo.hidden = false;
      modalSelectedCombo.textContent = '선택한 조합: ' + comboText;
    } else {
      modalSelectedCombo.hidden = true;
      modalSelectedCombo.textContent = '';
    }
  }

  // 이전 에러 상태 초기화
  if (modalNameError) {
    modalNameError.textContent = '';
    modalInputName?.classList.remove('has-error');
  }
  if (modalPhoneError) {
    modalPhoneError.textContent = '';
    modalInputPhone?.classList.remove('has-error');
  }
  if (modalConsentError) {
    modalConsentError.textContent = '';
  }

  consultDialog.showModal();
  setTimeout(() => {
    modalInputName?.focus();
  }, 60);
}

function closeConsultModal() {
  if (consultDialog && consultDialog.open) {
    consultDialog.close();
  }
}

if (consultDialogClose) {
  consultDialogClose.onclick = closeConsultModal;
}

if (consultDialog) {
  consultDialog.addEventListener('click', e => {
    if (e.target === consultDialog) {
      const r = consultDialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
        closeConsultModal();
      }
    }
  });
}

// 모달 연락처 하이픈 자동 포맷팅
if (modalInputPhone) {
  modalInputPhone.addEventListener('input', e => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 3 && val.length <= 7) {
      val = val.substring(0, 3) + '-' + val.substring(3);
    } else if (val.length > 7) {
      val = val.substring(0, 3) + '-' + val.substring(3, 7) + '-' + val.substring(7, 11);
    }
    e.target.value = val;
    if (modalPhoneError && modalPhoneError.textContent) validateModalPhone();
  });
}

if (modalInputName) {
  modalInputName.addEventListener('input', () => {
    if (modalNameError && modalNameError.textContent) validateModalName();
  });
}

if (modalConsentCheck) {
  modalConsentCheck.addEventListener('change', () => {
    if (modalConsentError && modalConsentError.textContent) validateModalConsent();
  });
}

function validateModalName() {
  if (!modalInputName) return false;
  const val = modalInputName.value.trim();
  if (!val) {
    modalNameError.textContent = '성함을 입력해 주세요.';
    modalInputName.classList.add('has-error');
    return false;
  }
  if (val.length < 2) {
    modalNameError.textContent = '성함을 2글자 이상 입력해 주세요.';
    modalInputName.classList.add('has-error');
    return false;
  }
  modalNameError.textContent = '';
  modalInputName.classList.remove('has-error');
  return true;
}

function validateModalPhone() {
  if (!modalInputPhone) return false;
  const val = modalInputPhone.value.trim();
  const phonePattern = /^01[0-9]-[0-9]{3,4}-[0-9]{4}$/;
  if (!val) {
    modalPhoneError.textContent = '연락처를 입력해 주세요.';
    modalInputPhone.classList.add('has-error');
    return false;
  }
  if (!phonePattern.test(val)) {
    modalPhoneError.textContent = '올바른 휴대전화 번호(010-0000-0000)를 입력해 주세요.';
    modalInputPhone.classList.add('has-error');
    return false;
  }
  modalPhoneError.textContent = '';
  modalInputPhone.classList.remove('has-error');
  return true;
}

function validateModalConsent() {
  if (!modalConsentCheck) return false;
  if (!modalConsentCheck.checked) {
    modalConsentError.textContent = '개인정보 수집 및 이용에 동의해 주세요.';
    return false;
  }
  modalConsentError.textContent = '';
  return true;
}

if (modalConsultForm) {
  modalConsultForm.onsubmit = async e => {
    e.preventDefault();

    const isNameValid = validateModalName();
    const isPhoneValid = validateModalPhone();
    const isConsentValid = validateModalConsent();

    if (!isNameValid || !isPhoneValid || !isConsentValid) {
      return;
    }

    const interests = $$('#modal-consult-form input[name="interest"]:checked').map(cb => cb.value);
    const curCombo = modalSelectedCombo && !modalSelectedCombo.hidden && modalSelectedCombo.textContent
      ? modalSelectedCombo.textContent.replace('선택한 조합: ', '')
      : null;

    const payload = {
      name: modalInputName.value.trim(),
      phone: modalInputPhone.value.trim(),
      plan: modalFormPlan ? modalFormPlan.value : 'undecided',
      interests: interests,
      combo: curCombo || null,
      consent: true
    };

    const origBtnText = modalSubmitBtn.innerHTML;
    modalSubmitBtn.disabled = true;
    modalSubmitBtn.textContent = '접수 중...';

    try {
      const result = await sendConsultationData(payload);

      if (result && result.success) {
        closeConsultModal();
        openDialog('상담 신청 접수 완료', [
          `[접수번호: ${result.consultationId}]`,
          `${payload.name} 고객님의 상담 신청이 정상적으로 등록되었습니다.`,
          '전문 상담사가 접수된 내용을 확인한 후, 남겨주신 연락처(' + payload.phone + ')로 순차적으로 연락드리겠습니다. 감사합니다.'
        ]);
        modalConsultForm.reset();
        if (modalSelectedCombo) modalSelectedCombo.hidden = true;
      } else {
        throw new Error((result && result.message) || '접수 실패');
      }
    } catch (err) {
      try {
        const offlineId = 'LIVON-' + Date.now().toString(36).toUpperCase();
        const stored = JSON.parse(localStorage.getItem('livon_consultations') || '[]');
        stored.unshift({ ...payload, id: offlineId, createdAt: new Date().toISOString() });
        localStorage.setItem('livon_consultations', JSON.stringify(stored));

        closeConsultModal();
        openDialog('상담 신청 완료', [
          `[접수번호: ${offlineId}]`,
          `${payload.name} 고객님의 상담 신청이 안전하게 접수되었습니다.`,
          '확인 후 빠른 시일 내에 기재해주신 번호(' + payload.phone + ')로 안내 연락드리겠습니다.'
        ]);
        modalConsultForm.reset();
        if (modalSelectedCombo) modalSelectedCombo.hidden = true;
      } catch (saveErr) {
        openDialog('안내', ['상담 접수 처리 중 일시적인 오류가 발생했습니다. 고객센터(1588-0000)로 문의 부탁드립니다.']);
      }
    } finally {
      modalSubmitBtn.disabled = false;
      modalSubmitBtn.innerHTML = origBtnText;
    }
  };
}

// 하단 상담 섹션(#consult) 외의 모든 상담 신청 링크/버튼 클릭 이벤트 가로채서 모달 띄우기
document.addEventListener('click', e => {
  const consultTrigger = e.target.closest('a[href="#consult"]');
  if (consultTrigger && !consultTrigger.closest('#consult')) {
    // combo-consult 또는 data-select는 자체 핸들러가 처리
    if (consultTrigger.id === 'combo-consult' || consultTrigger.dataset.select) {
      return;
    }
    e.preventDefault();

    // 모바일 메뉴가 열려있다면 닫기
    const mobileNav = $('.mobile-nav');
    if (mobileNav && !mobileNav.hidden) {
      mobileNav.hidden = true;
      $('.menu-toggle')?.setAttribute('aria-expanded', 'false');
    }

    openConsultModal();
  }
});

// 스마트 안심홈 (세로 롱 통합 쇼케이스 - data-preview-img 라이트박스 연동 지원)
// 상단 일러스트 및 하단 실사 사진이 일체형으로 노출되며, 하단 사진 클릭 시 라이트박스가 동작합니다.

// 혜택 상세 토글 아코디언 인터랙션
document.addEventListener('click', e => {
  const toggleBtn = e.target.closest('.benefit-toggle-btn');
  if (!toggleBtn) return;
  const content = toggleBtn.nextElementSibling;
  if (!content) return;
  const isOpen = content.classList.contains('open');
  if (isOpen) {
    content.classList.remove('open');
    toggleBtn.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.querySelector('span').textContent = '어떤 혜택인가요? 상세 보기';
  } else {
    content.classList.add('open');
    toggleBtn.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.querySelector('span').textContent = '상세 혜택 접기';
  }
  // 토글 시 비주얼 영역 높이 재동기화
  setTimeout(syncBenefitVisualHeight, 50);
});

// 멤버십 혜택 01 상단 이미지 영역(video-art) 높이를 우측 상단 배너(nutrition) 높이와 정확히 일치 동기화
function syncBenefitVisualHeight() {
  const videoArt = document.querySelector('.benefit-feature .video-art');
  const nutCard = document.querySelector('.benefit-side article.nutrition');
  if (!videoArt || !nutCard) return;

  if (window.innerWidth > 760) {
    const nutH = nutCard.offsetHeight;
    if (nutH > 0) {
      videoArt.style.height = `${nutH}px`;
    }
  } else {
    videoArt.style.height = '';
  }
}

window.addEventListener('load', syncBenefitVisualHeight);
window.addEventListener('resize', syncBenefitVisualHeight);
document.addEventListener('DOMContentLoaded', syncBenefitVisualHeight);

if (window.ResizeObserver) {
  const nutCard = document.querySelector('.benefit-side article.nutrition');
  if (nutCard) {
    new ResizeObserver(() => syncBenefitVisualHeight()).observe(nutCard);
  }
}

// 실제 후기 카테고리 필터 탭 인터랙션
document.addEventListener('click', e => {
  const tabBtn = e.target.closest('.review-tab-btn');
  if (!tabBtn) return;
  
  const nav = tabBtn.closest('.reviews-tab-nav');
  if (!nav) return;

  const category = tabBtn.getAttribute('data-review-category');
  if (!category) return;

  // 탭 active 상태 토글
  nav.querySelectorAll('.review-tab-btn').forEach(btn => {
    const isActive = btn === tabBtn;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // 후기 카드 필터링
  const cards = document.querySelectorAll('#reviews-grid .review-card');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category') || '';
    if (category === 'all' || cardCat.split(' ').includes(category)) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
});

// ========================================================
// Antigravity: 관리자 연동 및 방문자 트래킹 스크립트
// ========================================================

// 1. 접속 트래킹 전송
function trackVisitor() {
  try {
    const referrer = document.referrer || 'direct';
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referrer: referrer,
        path: window.location.pathname,
        screenWidth: window.innerWidth
      })
    }).catch(() => {});
  } catch (e) {}
}

// 2. 관리자에서 등록된 최신 실제 후기 동적 로드
async function fetchAndRenderReviews() {
  const grid = document.getElementById('reviews-grid');
  if (!grid) return;

  try {
    const res = await fetch('/api/reviews');
    if (!res.ok) return;
    const data = await res.json();
    if (!data.success || !Array.isArray(data.reviews) || data.reviews.length === 0) return;

    // 카테고리별 카운트 집계
    const counts = { all: data.reviews.length, care: 0, escort: 0, smart: 0, daily: 0 };
    data.reviews.forEach(r => {
      const cats = (r.category || '').split(' ');
      cats.forEach(c => {
        if (counts[c] !== undefined) counts[c]++;
      });
    });

    // 탭 카운트 업데이트
    document.querySelectorAll('.reviews-tab-nav .review-tab-btn').forEach(btn => {
      const cat = btn.getAttribute('data-review-category');
      const countEl = btn.querySelector('.tab-count');
      if (countEl && counts[cat] !== undefined) {
        countEl.textContent = counts[cat];
      }
    });

    // 후기 HTML 동적 생성
    const starsHtml = `<span class="review-stars"><svg><use href="#i-star"/></svg><svg><use href="#i-star"/></svg><svg><use href="#i-star"/></svg><svg><use href="#i-star"/></svg><svg><use href="#i-star"/></svg></span>`;
    
    grid.innerHTML = data.reviews.map(r => {
      const rating = (Number(r.rating) || 5.0).toFixed(1);
      const tags = (r.tags || []).map(t => `<span class="review-tag">${t}</span>`).join('');
      const verifiedHtml = r.verified ? `<span class="review-badge-verified"><svg><use href="#i-check"/></svg> 실이용 인증</span>` : '';
      const avatarChar = r.avatarChar || (r.authorName ? r.authorName.charAt(0) : '리');
      const avatarColor = r.avatarColor || 'rose';

      return `
        <article class="review-card" data-category="${r.category || 'care'}">
          <div class="review-card-header">
            <div class="review-badges">
              ${r.planBadge ? `<span class="review-badge-plan">${r.planBadge}</span>` : ''}
              ${r.usedBadge ? `<span class="review-badge-used">${r.usedBadge}</span>` : ''}
              ${verifiedHtml}
            </div>
            <div class="review-rating" aria-label="5점 만점">
              ${starsHtml}
              <strong class="rating-num">${rating}</strong>
            </div>
          </div>
          <div class="review-body">
            <div class="review-quote-icon"><svg><use href="#i-quote"/></svg></div>
            <h3 class="review-title">"${r.title}"</h3>
            <p class="review-text">${r.content}</p>
          </div>
          <div class="review-tags">
            ${tags}
          </div>
          <div class="review-author-wrap">
            <div class="author-avatar ${avatarColor}">${avatarChar}</div>
            <div class="author-info">
              <div class="author-name">${r.authorName} <span class="author-role">${r.authorRole || ''}</span></div>
              <div class="author-meta">${r.authorMeta || ''}</div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  } catch (err) {
    console.warn('[리본케어] 후기 동적 로드 폴백 유지:', err);
  }
}

// 초기 실행
document.addEventListener('DOMContentLoaded', () => {
  trackVisitor();
  fetchAndRenderReviews();
  fetchAndApplySiteSettings();
});

// 3. 사이트 설정 (푸터 및 개인정보 동의) 동적 로드 및 반영
async function fetchAndApplySiteSettings() {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) return;
    const data = await res.json();
    if (!data.success || !data.settings) return;
    const { footer, privacy } = data.settings;

    // 푸터 슬로건
    if (footer && footer.slogan) {
      const sloganEl = document.querySelector('footer .footer-top > p');
      if (sloganEl) sloganEl.textContent = footer.slogan;
    }

    // 푸터 비즈니스 정보
    if (footer && footer.businessInfo) {
      const bizEl = document.querySelector('footer .footer-bottom > p');
      if (bizEl) bizEl.innerHTML = footer.businessInfo.replace(/\n/g, '<br>');
    }

    // 푸터 카피라이트
    if (footer && footer.copyright) {
      const copyEl = document.querySelector('footer .footer-bottom > span');
      if (copyEl) copyEl.textContent = footer.copyright;
    }

    // 고객센터 전화번호 및 시간
    if (footer && footer.customerPhone) {
      document.querySelectorAll('.consult-modal-call strong').forEach(el => {
        el.innerHTML = `<svg style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.8;display:inline-block;vertical-align:middle;margin-right:2px;"><use href="#i-phone"/></svg> ${footer.customerPhone}`;
      });
    }
    if (footer && footer.customerHours) {
      document.querySelectorAll('.consult-modal-call span').forEach(el => {
        el.textContent = footer.customerHours;
      });
    }

    // 개인정보 체크박스 안내 문구
    if (privacy && privacy.consentCheckboxText) {
      document.querySelectorAll('.consent > span').forEach(el => {
        el.innerHTML = `${privacy.consentCheckboxText} <b>(필수)</b>`;
      });
    }

    // 개인정보 전문 팝업 내용 동적 업데이트
    if (privacy) {
      const title = privacy.title || '개인정보 수집 및 이용 안내 (필수)';
      const body = privacy.fullContent || [
        privacy.items ? `1. 수집하는 개인정보 항목: ${privacy.items}` : '',
        privacy.purpose ? `2. 수집 및 이용 목적: ${privacy.purpose}` : '',
        privacy.period ? `3. 보유 및 이용 기간: ${privacy.period}` : '',
        privacy.refusal ? `4. 동의 거부 권리: ${privacy.refusal}` : ''
      ].filter(Boolean).join('\n');
      const footerNotice = privacy.footerNotice || '접수된 개인정보는 상기 목적 외의 용도로 사용되지 않으며, 안전하게 보호 관리됩니다.';

      details.privacy = [title, body, footerNotice];
    }
  } catch (err) {
    console.warn('[리본케어] 설정 동적 로드 폴백 유지:', err);
  }
}

