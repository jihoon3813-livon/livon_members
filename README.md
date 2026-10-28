# 리본케어(Livon Care) 라이프케어 멤버십 웹사이트

리본케어 공식 소개 및 상담 신청 반응형 웹사이트 (Convex 백엔드 연동 지원).

* **GitHub Repository**: [https://github.com/jihoon3813-livon/livon_members.git](https://github.com/jihoon3813-livon/livon_members.git)
* **Backend Database**: [Convex](https://www.convex.dev/)

---

## 🚀 빠른 시작

### 1. 웹 개발 서버 실행
터미널에서 언제든지 아래 명령어를 실행하면 웹사이트가 구동됩니다:

```bash
npm run dev
```

브라우저에서 `http://localhost:8080` (또는 콘솔에 출력된 포트)로 접속할 수 있습니다.

---

### 2. Convex 백엔드 연결 & 실행

프로젝트 폴더에서 Convex 개발 환경을 연동하려면 새 터미널 창에서 아래 명령어를 실행하세요:

```bash
npx convex dev
# 또는
npm run convex:dev
```

* 처음 실행 시 브라우저에서 Convex 로그인 및 프로젝트 생성/선택 창이 나타납니다.
* 프로젝트가 연결되면 자동으로 `.env.local`에 `CONVEX_DEPLOYMENT` 및 `NEXT_PUBLIC_CONVEX_URL`이 생성됩니다.
* `server.js`가 이 설정을 자동으로 감지하여 상담 신청(`POST /api/consult`)을 Convex의 실시간 데이터베이스로 즉시 저장합니다.
* Convex가 아직 연결되지 않은 상태에서도 로컬 JSON 파일(`data/consultations.json`)과 브라우저 `localStorage`에 자동 백업되므로 개발이 중단되지 않습니다.

---

### 3. Git 푸시 (GitHub 원격 저장소)

원격 저장소(`origin`)가 이미 설정되어 있습니다. 최초 푸시는 터미널에서 다음 명령을 실행하세요:

```bash
git push -u origin main
```

---

## 📁 디렉토리 구조

```text
├── convex/                        # Convex 서버리스 백엔드
│   ├── schema.ts                  # consultations 테이블 스키마 정의
│   ├── consultations.ts           # create, list, updateStatus 함수
│   └── http.ts                    # HTTP Router (/api/consult 라우팅)
├── dist/                          # 웹 서비스 정적 자산
│   ├── index.html                 # 메인 웹페이지 구조 마크업
│   ├── style.css                  # 반응형 스타일시트
│   ├── app.js                     # 탭, 계산기, 모달, 상담 접수 로직
│   └── assets/                    # 인포그래픽 자산 이미지 (4종)
│       ├── daily-care.png         # 01 평상시 케어 안내장
│       ├── treatment-care.png     # 02 치료지원 케어 안내장
│       ├── smart-home-care.png    # 03 스마트 홈케어 안내장
│       └── membership-benefits.png# 04 멤버십 혜택 안내장
├── hoon/                          # 원본 인계본 보관 디렉토리
├── server.js                      # 정적 서빙 & Convex 프록시/로컬 백업 서버
└── package.json                   # npm run dev 및 의존성 설정
```

---

## 🗄️ Convex 데이터베이스 스키마 (`consultations`)

| 필드명 | 타입 | 설명 |
| :--- | :--- | :--- |
| `name` | string | 고객 성함 |
| `phone` | string | 연락처 (`010-0000-0000`) |
| `plan` | string | 관심 상품 (`160`, `320`, `smart`, `undecided`) |
| `interests` | array\<string\> | 관심 서비스 (간병, 병원 동행, 스마트 홈케어 등) |
| `combo` | string (optional) | 계산기에서 선택한 조합 문자열 |
| `consent` | boolean | 개인정보 수집 및 이용 동의 여부 (`true`) |
| `status` | string | 상담 상태 (`접수대기`, `상담중`, `완료` 등) |
| `createdAt`| string | 접수 일시 (ISO 문자열) |
