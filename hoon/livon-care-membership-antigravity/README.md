# 리본케어 멤버십 개발용 패키지

2026년 11월 9일 개정한 멤버십 사이트 버전 2를 안티그래비티에서 수정할 수 있도록 만든 프로젝트입니다. 최신 화면의 컴포넌트·문구·스타일·이미지를 유지하면서 표준 React + TypeScript + Vite 프로젝트로 구성했습니다.

현재 사이트: https://livon-care-membership.hoony365.chatgpt.site

## 빠른 시작

1. ZIP 압축을 풀고 `livon-care-membership-antigravity` 폴더를 안티그래비티에서 엽니다.
2. Node.js 22.13 이상이 설치된 환경에서 아래 명령을 실행합니다.

```bash
npm ci
npm run dev
```

터미널에 표시되는 주소로 접속합니다. 기본 개발 주소는 `http://localhost:5173`입니다. 이미 해당 포트를 사용 중이면 실제 터미널 주소를 따릅니다.

3. 안티그래비티에 `ANTIGRAVITY_START.md를 읽고 현재 화면을 실행해줘`라고 요청합니다.

## 빌드 및 배포

```bash
npm run build
npm run preview
```

`npm run build`는 TypeScript 검사와 프로덕션 빌드를 실행합니다. 정적 배포 결과는 `dist/` 폴더에 생성됩니다. 배포 플랫폼의 빌드 명령은 `npm run build`, 출력 폴더는 `dist`입니다. 이 패키지는 홈페이지 루트 경로에 배포하는 구성을 기준으로 합니다.

현재 홈페이지 기능을 실행하는 데 API 키나 환경변수는 필요하지 않습니다. 실제 상담 접수 기능을 추가할 때는 수신 채널과 개인정보 처리 방식을 먼저 정한 뒤 연결합니다.

## 파일 안내

| 파일 | 용도 |
| --- | --- |
| `src/App.tsx` | 전체 화면·상품 데이터·건강관리 상세 내용·FAQ·상담 준비 기능 |
| `src/styles.css` | PC·모바일 반응형 디자인, 색상·폰트·간격 |
| `src/main.tsx` | React 실행 진입점 |
| `index.html` | 제목·검색 설명·기본 HTML 설정 |
| `public/images/logo.webp` | 리본케어 멤버십 로고 |
| `public/images/care-hero.webp` | 메인 돌봄 연출 이미지 |
| `public/fonts/livon-sans.woff` | 전체 한글 글자 범위를 포함한 Noto Sans KR 가변 폰트 |
| `public/fonts/OFL.txt` | 폰트 라이선스 |
| `ANTIGRAVITY_START.md` | 안티그래비티에 전달할 작업 지침 |
| `HANDOFF.md` | 상품 기준, 구현 범위, 다음 개발 사항 |
| `SOURCE_PROVENANCE.json` | 기준 사이트 버전과 원본 커밋 정보 |

## 현재 구현된 기능

- PC·모바일 반응형 화면, 모바일 메뉴와 하단 고정 버튼
- LITE·SPECIAL·PREMIUM 멤버십 비교
- 건강관리 3종, 각 4개 항목의 상세 설명
- 펼침형 FAQ 및 하단 서비스 이용 안내
- 관심 상품·대상 선택, 상담 준비 내용 복사와 TXT 저장

상담 준비 창은 실제 상담 신청을 전송하지 않습니다. 고객 DB 저장, 문자·이메일 발송, 결제, 관리자 화면은 포함되어 있지 않습니다. 복사가 차단된 환경에서는 안내 메시지와 파일 저장 기능을 이용할 수 있습니다.

## 원본과의 관계

현재 페이지는 브라우저에서 동작하는 단일 페이지이며 서버 API를 사용하지 않습니다. 화면 코드와 CSS는 배포된 버전 2에서 가져왔고, 원본의 전용 호스팅·인증·데이터베이스 설정은 이 개발 패키지에 필요하지 않아 포함하지 않았습니다. 폰트는 기존의 문자 일부만 포함한 파일을 전체 글자 범위를 가진 동일 계열 폰트로 확장했습니다.

ZIP에는 `node_modules`, 빌드 캐시, Git 이력, 인증정보가 들어 있지 않습니다. 설치 재현을 위한 `package-lock.json`을 포함합니다.
