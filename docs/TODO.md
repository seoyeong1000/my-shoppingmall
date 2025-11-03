# 쇼핑몰 MVP 개발 TODO 리스트

## 📋 프로젝트 개요

- **총 개발 기간**: 4주
- **기술 스택**: Next.js 15, React 19, Supabase, Clerk, Toss Payments, Tailwind CSS
- **현재 상태**: 기본 인프라 및 데이터베이스 스키마 완료

---

## 🚀 Phase 1: 기본 인프라 (1주) - 진행중

### 프로젝트 설정

- [x] Next.js 프로젝트 셋업
- [x] pnpm 패키지 매니저 설정
- [x] TypeScript 설정
- [x] Tailwind CSS v4 설정
- [x] ESLint 설정
- [x] Prettier 설정

### Supabase 설정

- [x] Supabase 프로젝트 생성
- [x] 데이터베이스 테이블 스키마 작성 (users, products, cart_items, orders, order_items)
- [x] RLS 비활성화 (개발 단계)
- [x] 샘플 데이터 삽입 (20개 상품)
- [x] 인덱스 생성 (성능 최적화)
- [x] 트리거 설정 (updated_at 자동 갱신)

### 인증 시스템

- [x] Clerk SDK 설치 및 설정
- [ ] 환경변수 설정 (.env 파일)
- [x] ClerkProvider 컴포넌트 설정
- [x] SyncUserProvider 구현 (Clerk ↔ Supabase 동기화)
- [x] 사용자 동기화 API 라우트 구현 (/api/sync-user)
- [x] 미들웨어 설정 (인증 라우트 보호)

### 기본 레이아웃

- [x] Root Layout 컴포넌트 구현 (app/layout.tsx)
- [x] Navbar 컴포넌트 구현
- [x] 기본 페이지 라우팅 설정
- [x] 반응형 디자인 적용

---

## 🛍️ Phase 2: 상품 기능 (1주)

### 홈페이지

- [x] 메인 페이지 컴포넌트 (app/page.tsx)
- [ ] 상품 카드 컴포넌트
- [ ] 상품 그리드 레이아웃
- [x] 배너/히어로 섹션

### 상품 목록 페이지

- [ ] 상품 목록 API 구현 (Supabase 쿼리)
- [ ] 상품 목록 컴포넌트
- [ ] 페이지네이션 구현
- [ ] 상품 정렬 기능 (가격, 인기순 등)

### 카테고리 필터링

- [ ] 카테고리 목록 조회 API
- [ ] 카테고리 필터 UI 컴포넌트
- [ ] 필터 상태 관리
- [ ] URL 쿼리 파라미터 연동

### 상품 상세 페이지

- [ ] 상품 상세 API 구현
- [ ] 상품 상세 페이지 컴포넌트
- [ ] 상품 이미지 표시
- [ ] 상품 정보 표시 (가격, 재고, 설명)
- [ ] 관련 상품 추천

### 상품 등록 (어드민)

- [ ] Supabase 대시보드에서 직접 상품 등록
- [ ] 상품 데이터 검증
- [ ] 샘플 상품 데이터 추가 확인

---

## 🛒 Phase 3: 장바구니 & 주문 (1주)

### 장바구니 기능

- [ ] 장바구니 추가 API (Server Action)
- [ ] 장바구니 조회 API
- [ ] 장바구니 수정 API (수량 변경)
- [ ] 장바구니 삭제 API
- [ ] 장바구니 UI 컴포넌트
- [ ] 장바구니 아이콘 표시 (Navbar)

### 주문 프로세스

- [ ] 주문 생성 API
- [ ] 주문 검증 (재고 확인)
- [ ] 주문 폼 컴포넌트
- [ ] 배송 정보 입력
- [ ] 주문 확인 페이지

### 주문 테이블 연동

- [ ] 주문 데이터 저장
- [ ] 주문 아이템 저장
- [ ] 트랜잭션 처리 (ACID)
- [ ] 주문 상태 관리

---

## 💳 Phase 4: 결제 통합 (1주)

### Toss Payments 연동

- [ ] Toss Payments MCP 설치 및 설정
- [ ] 결제 위젯 컴포넌트
- [ ] 결제 요청 API
- [ ] 결제 검증 API

### 테스트 결제 구현

- [ ] 테스트 모드 설정
- [ ] 결제 성공/실패 처리
- [ ] 결제 결과 콜백 처리
- [ ] 결제 상태 업데이트

### 결제 완료 후 주문 저장

- [ ] 결제 성공 시 주문 상태 변경
- [ ] 재고 차감
- [ ] 주문 확인 이메일 (선택사항)
- [ ] 결제 실패 처리

---

## 👤 Phase 5: 마이페이지 (0.5주)

### 주문 내역 조회

- [ ] 마이페이지 컴포넌트
- [ ] 사용자 주문 목록 API
- [ ] 주문 목록 UI
- [ ] 주문 상태 표시

### 주문 상세 보기

- [ ] 주문 상세 API
- [ ] 주문 상세 페이지
- [ ] 주문 아이템 표시
- [ ] 배송 정보 표시

---

## 🧪 Phase 6: 테스트 & 배포 (0.5주)

### 테스트

- [ ] 단위 테스트 작성 (상품, 장바구니, 주문)
- [ ] 통합 테스트 (사용자 플로우)
- [ ] E2E 테스트 (Playwright)
- [ ] 결제 플로우 테스트

### 품질 보증

- [ ] 코드 리뷰
- [ ] 성능 최적화
- [ ] 에러 핸들링 검증
- [ ] 반응형 디자인 테스트

### 배포

- [ ] Vercel 설정
- [ ] 환경변수 설정
- [ ] 데이터베이스 마이그레이션
- [ ] 프로덕션 빌드 테스트
- [ ] 도메인 연결

---

## 🔧 추가 설정 파일들

### 개발 환경

- [x] `.cursor/` 디렉토리
- [x] `.cursor/rules/` 커서룰
- [x] `.cursor/mcp.json` MCP 서버 설정
- [x] `.cursor/dir.md` 프로젝트 디렉토리 구조
- [x] `.github/` 디렉토리 (GitHub Actions)
- [x] `.husky/` 디렉토리 (Git hooks)

### Next.js 필수 파일들

- [x] `app/favicon.ico` 파일
- [x] `app/not-found.tsx` 파일
- [x] `app/robots.ts` 파일
- [x] `app/sitemap.ts` 파일
- [x] `app/manifest.ts` 파일

### 정적 파일들

- [x] `public/icons/` 디렉토리
- [x] `public/logo.png` 파일
- [x] `public/og-image.png` 파일

### 설정 파일들

- [x] `tsconfig.json` 파일
- [x] `.cursorignore` 파일
- [x] `.gitignore` 파일
- [x] `.prettierignore` 파일
- [x] `.prettierrc` 파일
- [x] `eslint.config.mjs` 파일
- [x] `AGENTS.md` 파일

---

## 📊 진행 상황 추적

### 완료된 항목

- ✅ Next.js 프로젝트 초기화
- ✅ Supabase 데이터베이스 스키마 설계 및 구현
- ✅ Clerk 인증 시스템 구현
- ✅ 기본 UI 컴포넌트 개발 (Navbar, Layout)
- ✅ 샘플 데이터 추가
- ✅ Supabase Storage 설정 및 테스트 페이지 구현
- ✅ 인증 연동 테스트 페이지 구현

### 현재 진행중

- 🔄 상품 기능 구현 (Phase 2)
- 🔄 장바구니 & 주문 시스템 (Phase 3)

### 남은 작업

- 📋 환경변수 설정 (.env 파일 생성)
- 📋 상품 기능 구현 (Phase 2)
- 📋 장바구니 & 주문 시스템 (Phase 3)
- 📋 결제 통합 (Phase 4)
- 📋 마이페이지 (Phase 5)
- 📋 테스트 및 배포 (Phase 6)
