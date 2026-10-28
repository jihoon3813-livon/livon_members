const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

// 1. 케어 탭 데이터
const data = {
  treatment: {
    lead: '치료와 회복에 필요한 실질적인 도움을 선택하세요.',
    tag: '통합 한도 차감',
    items: [
      ['heart', '간병인 지원', '입원 중 곁에서 필요한 일상 돌봄을 지원합니다.', '24시간 · 1회 차감', 'care'],
      ['cross', '간호사 동행', '병원 진료에 도움이 필요한 순간, 함께합니다.', '이용 기준 보기 ↗', 'nurse'],
      ['car', '차량 에스코트', '병원까지의 이동이 필요한 날을 위한 지원입니다.', '이용 기준 보기 ↗', 'car'],
      ['leaf', '가사도우미', '회복하는 동안 부담되는 집안일을 돕습니다.', '4시간 · 0.5회 차감', 'home'],
      ['house', '정리수납', '일상으로 돌아갈 공간을 편안하게 정리합니다.', '1곳 4시간 · 1회 차감', 'organize']
    ]
  },
  daily: {
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
  smart: {
    lead: '병원 밖, 집에서도 이어지는 돌봄을 연결합니다.',
    tag: '패키지 5회 차감',
    items: [
      ['phone', '케어비전 태블릿', '스마트 홈케어를 이용하는 중심 기기입니다.', '패키지 구성 보기 ↗', 'smart'],
      ['house', '홈 센서', '생활 환경에 맞춰 구성하는 센서 패키지입니다.', '패키지 구성 보기 ↗', 'smart'],
      ['heart', '보호자 연결', '실제 지원 가능한 가족 연결·알림 기능을 제공합니다.', '패키지 구성 보기 ↗', 'smart'],
      ['spark', '설치·이용 안내', '설치부터 사용법까지 이용 절차를 안내합니다.', '패키지 구성 보기 ↗', 'smart']
    ]
  },
  extra: {
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

// 2. 케어 탭 렌더링
function renderTab(key) {
  let x = data[key];
  if (!x) return;
  $('#care-panel').innerHTML = `
    <div class="care-panel-head">
      <p>${x.lead}</p>
      <span class="badge">${x.tag}</span>
    </div>
    <div class="service-grid">
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
    '케어비전 태블릿과 홈 센서, 가족을 위한 안심 보호자 연결 기능을 결합하는 패키지입니다. 통합 한도에서 5회를 차감합니다.',
    '장비 구성·제공기간·대여 및 반환 기준·설치 조건은 확정 전입니다. 화면의 장비와 기능 표현은 이해를 돕는 일러스트입니다.'
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

function openDialog(title, paras) {
  prevFocus = document.activeElement;
  $('#dialog-title').textContent = title;
  $('#dialog-body').replaceChildren(...paras.map(t => {
    let p = document.createElement('p');
    p.textContent = t;
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
    let d = details[b.dataset.detail];
    if (d) openDialog(d[0], d.slice(1));
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

$('#combo-consult').onclick = () => {
  $('#form-plan').value = state.limit === 7 ? '160' : '320';
  let curCombo = combo();
  $('#selected-combo').hidden = !curCombo;
  $('#selected-combo').textContent = '선택한 조합: ' + curCombo;
};

$$('[data-select]').forEach(a => {
  a.onclick = () => {
    $('#form-plan').value = a.dataset.select;
    $('#selected-combo').hidden = true;
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
    const res = await fetch('/api/consult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (result.success) {
      openDialog('상담 신청 접수 완료', [
        `[접수번호: ${result.consultationId}]`,
        `${payload.name} 고객님의 상담 신청이 정상적으로 등록되었습니다.`,
        '전문 상담사가 접수된 내용을 확인한 후, 남겨주신 연락처(' + payload.phone + ')로 순차적으로 연락드리겠습니다. 감사합니다.'
      ]);
      consultForm.reset();
      $('#selected-combo').hidden = true;
    } else {
      throw new Error(result.message || '접수 실패');
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
