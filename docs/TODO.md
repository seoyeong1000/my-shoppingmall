# 쇼핑몰 MVP 개발 TODO 리스트

## 📋 프로젝트 개요

- **총 개발 기간**: 4주
- **기술 스택**: Next.js 15, React 19, Supabase, Clerk, Toss Payments, Tailwind CSS
- **현재 상태**: Phase 1 완료, Phase 2 완료, Phase 3 완료 (결제 통합 진행 예정)

---

## 🚀 Phase 1: 기본 인프라 (1주) - 완료 ✅

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
- [x] 환경변수 설정 (.env 파일)
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

## 🛍️ Phase 2: 상품 기능 (1주) - 완료 ✅

### 홈페이지

- [x] 메인 페이지 컴포넌트 (app/page.tsx)
- [x] 상품 카드 컴포넌트
  - ✅ 재사용 가능한 ProductCard 컴포넌트 생성 (`components/product-card.tsx`)
  - ✅ 상품 정보 표시 (카테고리, 이름, 가격, 재고)
  - ✅ 클릭 시 상품 상세 페이지로 이동
  - ✅ 호버 효과 및 반응형 스타일 적용
- [x] 상품 그리드 레이아웃
  - ✅ 반응형 Grid 레이아웃 구현 (모바일 2열, 태블릿 3열, 데스크톱 4열)
- [x] 배너/히어로 섹션

### 상품 목록 페이지

- [x] 상품 목록 API 구현 (Supabase 쿼리)
  - ✅ Server Component로 구현 (`app/products/page.tsx`)
  - ✅ Supabase에서 활성 상품만 조회 (`is_active = true`)
  - ✅ 카테고리별 필터링 지원
- [x] 상품 목록 컴포넌트
  - ✅ ProductCard 컴포넌트 재사용
  - ✅ 반응형 그리드 레이아웃 적용
- [x] 페이지네이션 구현
  - ✅ 페이지네이션 컴포넌트 생성 (`components/product-pagination.tsx`)
  - ✅ 번호형 페이지네이션 UI (1, 2, 3... 형태)
  - ✅ 이전/다음 버튼 포함
  - ✅ 페이지당 12개 상품 표시
  - ✅ URL 쿼리 파라미터로 페이지 관리 (`?page=2`)
  - ✅ 카테고리 필터와 병행 가능
  - ✅ 카테고리 변경 시 페이지 자동 리셋 (1페이지로)
  - ✅ 1페이지만 있을 때 페이지 정보 표시 (버튼은 숨김)
  - ✅ 페이지 하단에 배치
- [x] 상품 정렬 기능
  - ✅ ProductSort 컴포넌트 생성 (`components/product-sort.tsx`)
  - ✅ 최신순 정렬 (created_at 내림차순, 기본값)
  - ✅ 이름순 정렬 (name 오름차순)
  - ✅ URL 쿼리 파라미터로 정렬 상태 관리 (`?sort=name`)
  - ✅ 정렬 변경 시 페이지 자동 리셋 (1페이지로)
  - ✅ 카테고리 필터와 정렬 기능 병행 가능
  - ✅ 반응형 디자인 (모바일 전체 너비, 데스크톱 최소 150px)

### 카테고리 필터링

- [x] 카테고리 목록 조회 API
  - ✅ `lib/constants/categories.ts` 사용
  - ✅ 카테고리별 상품 개수 조회
- [x] 카테고리 필터 UI 컴포넌트
  - ✅ `CategoryFilter` 컴포넌트 드롭다운 형식으로 구현
  - ✅ shadcn/ui Select 컴포넌트 사용
  - ✅ "전체" 옵션 포함 (드롭다운 첫 번째 항목)
  - ✅ 각 카테고리별 상품 개수 표시 (예: "전자제품 (150)")
  - ✅ 반응형 디자인 (모바일 전체 너비, 데스크톱 최소 200px)
- [x] 필터 상태 관리
  - ✅ URL 쿼리 파라미터로 상태 관리
- [x] URL 쿼리 파라미터 연동
  - ✅ `?category=electronics` 형식으로 필터링

### 상품 상세 페이지

- [x] 상품 상세 API 구현
  - ✅ Server Component로 구현 (`app/products/[id]/page.tsx`)
  - ✅ URL 파라미터에서 상품 ID 추출
  - ✅ Supabase에서 단일 상품 정보 조회
- [x] 상품 상세 페이지 컴포넌트
  - ✅ 상품 상세 정보 표시 (이름, 설명, 가격, 카테고리, 재고)
  - ✅ 상품이 없거나 비활성화된 경우 404 처리
  - ✅ 목록으로 돌아가기 링크
- [x] 상품 이미지 표시
  - ✅ products 테이블에 image_url 컬럼 추가 (마이그레이션)
  - ✅ ProductImage 컴포넌트 생성 (`components/product-image.tsx`)
  - ✅ ProductCard에 이미지 표시 영역 추가
  - ✅ 상품 상세 페이지에 이미지 표시 추가
  - ✅ 이미지 없거나 로드 실패 시 placeholder 자동 표시
  - ✅ placeholder 이미지 생성 (`public/product-placeholder.svg`)
- [x] 상품 상세 페이지 레이아웃 구조 개선
  - ✅ 3열 그리드 레이아웃 구현 (데스크톱)
  - ✅ 왼쪽 열 (2/3): 제품 이미지, 이름, 가격, 재고, 카테고리, 설명, 등록일/수정일
  - ✅ 오른쪽 열 (1/3): 장바구니 UI (sticky positioning)
  - ✅ 재고/카테고리/등록일 섹션 작은 패딩 적용 (p-4)
  - ✅ 반응형 디자인 (모바일: 1열 레이아웃, 이미지 위 정보 아래, 장바구니 UI 하단)
- [x] 상품 정보 표시 (가격, 재고, 설명)
  - ✅ 재고가 0일 경우 품절 표시
  - ✅ 장바구니 추가 버튼 UI 및 기능 구현 완료
- [ ] 관련 상품 추천 (추후 구현 예정)

### 상품 등록 (어드민)

- [x] Supabase 대시보드에서 직접 상품 등록
- [x] 상품 데이터 검증
  - ✅ 데이터베이스 스키마에서 검증 (CHECK 제약조건)
- [x] 샘플 상품 데이터 추가 확인
  - ✅ 20개 샘플 상품 데이터 추가 완료

---

## 🛒 Phase 3: 장바구니 & 주문 (1주) - 완료 ✅

### 장바구니 기능

- [x] 장바구니 추가 API (Server Action)
  - ✅ `actions/cart/add-item.ts` 구현 완료
  - ✅ UPSERT 로직 (같은 상품이 있으면 수량 증가)
  - ✅ 재고 확인 및 유효성 검사
  - ✅ 상세 로그 추가
- [x] 장바구니 조회 API
  - ✅ `actions/cart/get-items.ts` 구현 완료
  - ✅ 상품 정보 JOIN으로 조회
  - ✅ `actions/cart/get-count.ts` 구현 완료 (Navbar용)
- [x] 장바구니 수정 API (수량 변경)
  - ✅ `actions/cart/update-quantity.ts` 구현 완료
- [x] 장바구니 삭제 API
  - ✅ `actions/cart/remove-item.ts` 구현 완료
- [x] 장바구니 UI 컴포넌트
  - ✅ `components/add-to-cart-button.tsx` 구현 완료 (수량 선택 UI 포함)
  - ✅ `components/add-to-cart-dialog.tsx` 구현 완료 (성공 다이얼로그)
  - ✅ `components/cart-item.tsx` 구현 완료
  - ✅ `components/cart-summary.tsx` 구현 완료
  - ✅ `app/cart/page.tsx` 장바구니 페이지 구현 완료
- [x] 장바구니 아이콘 표시 (Navbar)
  - ✅ `components/cart-icon.tsx` 구현 완료
  - ✅ 실시간 장바구니 개수 표시 (5초마다 갱신)
- [x] 상품 상세 페이지 장바구니 담기 UI 구현
  - ✅ 3열 그리드 레이아웃 (왼쪽 2열: 이미지+정보, 오른쪽 1열: 장바구니 UI)
  - ✅ 데스크톱에서 장바구니 UI sticky positioning 적용 (우측 고정)
  - ✅ 모바일에서 장바구니 UI 하단 배치
  - ✅ 수량 선택 UI (증가/감소 버튼, 직접 입력)
  - ✅ 재고 확인 및 에러 처리

### 주문 프로세스

- [x] 주문 생성 API
  - ✅ `actions/order/create-order.ts` 구현 완료
  - ✅ 장바구니 조회 및 재고 검증
  - ✅ 트랜잭션 처리 (주문 생성, 주문 아이템 생성, 재고 차감, 장바구니 비우기)
  - ✅ 배송 정보 및 주문 메모 저장
  - ✅ 상세 로그 추가
- [x] 주문 검증 (재고 확인)
  - ✅ 각 상품별 재고 확인
  - ✅ 상품 활성화 상태 확인
  - ✅ 에러 발생 시 롤백 처리
- [x] 주문 폼 컴포넌트
  - ✅ `components/checkout-form.tsx` 구현 완료
  - ✅ react-hook-form + zod 유효성 검사
  - ✅ 배송 정보 입력 필드 (수령인 이름, 전화번호, 우편번호, 주소, 상세 주소, 주문 메모)
  - ✅ 에러 메시지 및 로딩 상태 처리
- [x] 배송 정보 입력
  - ✅ 주문 폼 컴포넌트에 배송 정보 입력 필드 구현
  - ✅ 한국 전화번호 형식 유효성 검사
  - ✅ 우편번호 5자리 숫자 검증
- [x] 주문 확인 페이지
  - ✅ `app/checkout/page.tsx` 구현 완료
  - ✅ 장바구니 아이템 조회 및 표시
  - ✅ 주문 폼 컴포넌트 렌더링
  - ✅ 주문 요약 정보 표시 (총 금액, 총 수량)
  - ✅ 반응형 레이아웃 (데스크톱: 2열+1열 그리드)
- [x] 주문 완료 페이지
  - ✅ `app/order/[id]/page.tsx` 구현 완료
  - ✅ 주문 정보 표시 (주문 번호, 주문일, 총 금액, 주문 상태)
  - ✅ 주문 아이템 목록 표시 (이미지 포함)
  - ✅ 배송 정보 표시
  - ✅ 주문 메모 표시 (있는 경우)

### 주문 테이블 연동

- [x] 주문 데이터 저장
  - ✅ orders 테이블에 주문 정보 저장
  - ✅ 배송 정보 JSONB 형식으로 저장
  - ✅ 주문 메모 저장
- [x] 주문 아이템 저장
  - ✅ order_items 테이블에 주문 아이템 저장
  - ✅ 상품 정보 스냅샷 저장 (product_name, price)
- [x] 트랜잭션 처리 (ACID)
  - ✅ 순차 실행 및 에러 발생 시 롤백 로직 구현
  - ✅ 주문 생성 → 주문 아이템 생성 → 재고 차감 → 장바구니 비우기
  - ✅ 에러 발생 시 기존 작업 롤백
- [x] 주문 상태 관리
  - ✅ 주문 상태 필드 구현 (pending, confirmed, shipped, delivered, cancelled)
  - ✅ 주문 생성 시 기본 상태 'pending' 설정
- [x] 주문 조회 API
  - ✅ `actions/order/get-order.ts` 구현 완료
  - ✅ 주문 ID로 주문 정보 조회
  - ✅ 주문 아이템 정보 포함 (상품 이미지 포함)
  - ✅ 본인 주문인지 확인

---

## 💳 Phase 4: 결제 통합 (1주)

### Toss Payments 연동

- [ ] Toss Payments MCP 설치 및 설정
- [x] 결제창 v1 클라이언트 연동 (`checkout-form.tsx`)
- [x] 결제 승인 Server Action (`actions/order/complete-checkout.ts`)
- [x] 결제 성공/실패 페이지 작성 (`/checkout/payment/*`)
- [ ] 테스트/라이브 키 전환 가이드 문서화

### 테스트 결제 구현

- [x] 테스트 모드 설정 (테스트 키, 안내 문서)
- [x] 결제 성공/실패 처리 플로우 (UI + 로그)
- [ ] 테스트 자동화 (API 스텁/단위 테스트)
- [ ] 오류 코드 별 시나리오 정리

### 결제 완료 후 주문 저장

- [x] 결제 성공 시 주문 상태 `confirmed` 갱신
- [x] 재고 차감 / 장바구니 비우기 재검증 (`createOrder` 재사용)
- [ ] 주문 확인 이메일 (선택사항)
- [x] 결제 실패 처리 UX (재시도 안내)

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
- [x] `public/product-placeholder.svg` 파일 (상품 이미지 placeholder)

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
- ✅ **상품 카드 컴포넌트 구현** (`components/product-card.tsx`)
- ✅ **상품 목록 페이지 구현** (`app/products/page.tsx`)
  - 반응형 Grid 레이아웃 (모바일 2열, 태블릿 3열, 데스크톱 4열)
  - 카테고리 필터링 기능
  - Supabase 서버 사이드 데이터 페칭
- ✅ **상품 상세 페이지 구현** (`app/products/[id]/page.tsx`)
  - 단일 상품 정보 조회 및 표시
  - 404 에러 처리
  - 2열 그리드 레이아웃 (왼쪽: 이미지, 오른쪽: 정보)
  - 재고/카테고리/등록일 섹션 작은 패딩 적용
  - 장바구니 추가 버튼 UI (기능은 Phase 3 예정)
- ✅ **페이지네이션 기능 구현** (`components/product-pagination.tsx`)
  - 페이지당 12개 상품 표시
  - 번호형 페이지네이션 UI (최대 5개 페이지 번호 표시)
  - 이전/다음 버튼 (Chevron 아이콘)
  - 현재 페이지 강조 표시
  - 페이지 정보 표시 (전체 N개 상품 중 X-Y개 표시)
  - 카테고리 필터와 병행 가능 (URL 쿼리 파라미터)
  - 카테고리 변경 시 페이지 자동 리셋
  - 1페이지만 있을 때 정보만 표시 (버튼 숨김)
- ✅ **상품 이미지 표시 기능 구현**
  - products 테이블에 image_url 컬럼 추가 마이그레이션 (`supabase/migrations/20251103184955_add_image_url_to_products.sql`)
  - ProductImage 재사용 컴포넌트 생성 (`components/product-image.tsx`)
    - 이미지 로드 실패 시 자동 fallback 처리
    - 개발용 로깅 기능 포함
  - ProductCard 컴포넌트에 이미지 표시 영역 추가 (aspect-square)
  - 상품 상세 페이지에 대형 이미지 표시 추가
  - placeholder 이미지 생성 (연한 회색 배경 + 회색 아이콘 SVG)
- ✅ **카테고리 필터 드롭다운 구현**
  - shadcn/ui Select 컴포넌트 설치 및 적용
  - CategoryFilter 컴포넌트를 버튼 배열에서 드롭다운 형식으로 재구현
  - "전체" 옵션을 드롭다운 첫 번째 항목으로 포함 (value="all" 사용)
  - 각 카테고리 옵션에 상품 개수 표시 유지
  - 기존 기능 유지 (URL 쿼리 파라미터, 페이지 리셋, 필터링 동작)
  - 반응형 스타일 적용
- ✅ **상품 정렬 기능 구현**
  - ProductSort 컴포넌트 생성 (`components/product-sort.tsx`)
  - 최신순 정렬 (created_at 내림차순, 기본값)
  - 이름순 정렬 (name 오름차순)
  - URL 쿼리 파라미터로 정렬 상태 관리 (`?sort=name`)
  - 정렬 변경 시 페이지 자동 리셋 (1페이지로)
  - 카테고리 필터와 정렬 기능 병행 가능
  - 반응형 디자인 (모바일 전체 너비, 데스크톱 최소 150px)
- ✅ **장바구니 기능 구현 (Phase 3)**
  - 장바구니 추가/조회/수정/삭제 API 구현 완료 (`actions/cart/`)
  - 장바구니 UI 컴포넌트 구현 완료 (`components/add-to-cart-button.tsx`, `components/add-to-cart-dialog.tsx`, `components/cart-item.tsx`, `components/cart-summary.tsx`)
  - 장바구니 페이지 구현 완료 (`app/cart/page.tsx`)
  - Navbar 장바구니 아이콘 구현 완료 (`components/cart-icon.tsx`)
  - 상품 상세 페이지 장바구니 담기 UI 구현 완료
    - 3열 그리드 레이아웃 (왼쪽 2열: 이미지+정보, 오른쪽 1열: 장바구니 UI)
    - 데스크톱에서 sticky positioning 적용 (우측 고정)
    - 모바일에서 하단 배치
    - 수량 선택 UI 및 재고 확인 기능
- ✅ **주문 프로세스 구현 (Phase 3)**
  - 주문 생성 Server Action 구현 완료 (`actions/order/create-order.ts`)
    - 장바구니 조회 및 재고 검증
    - 트랜잭션 처리 (주문 생성, 주문 아이템 생성, 재고 차감, 장바구니 비우기)
    - 배송 정보 및 주문 메모 저장
    - 상세 로그 추가
  - 주문 폼 컴포넌트 구현 완료 (`components/checkout-form.tsx`)
    - react-hook-form + zod 유효성 검사
    - 배송 정보 입력 필드 (수령인 이름, 전화번호, 우편번호, 주소, 상세 주소, 주문 메모)
    - 에러 메시지 및 로딩 상태 처리
  - 주문 확인 페이지 구현 완료 (`app/checkout/page.tsx`)
    - 장바구니 아이템 조회 및 표시
    - 주문 폼 컴포넌트 렌더링
    - 주문 요약 정보 표시 (총 금액, 총 수량)
    - 반응형 레이아웃 (데스크톱: 2열+1열 그리드)
  - 주문 완료 페이지 구현 완료 (`app/order/[id]/page.tsx`)
    - 주문 정보 표시 (주문 번호, 주문일, 총 금액, 주문 상태)
    - 주문 아이템 목록 표시 (이미지 포함)
    - 배송 정보 표시
    - 주문 메모 표시 (있는 경우)
  - 주문 조회 Server Action 구현 완료 (`actions/order/get-order.ts`)
    - 주문 ID로 주문 정보 조회
    - 주문 아이템 정보 포함 (상품 이미지 포함)
    - 본인 주문인지 확인
  - CartSummary 컴포넌트 수정 완료
    - 주문하기 버튼 활성화
    - 안내 메시지 제거

### 현재 진행중

- 🔄 결제 통합 (Phase 4) - 진행 예정

### 남은 작업

- 📋 결제 통합 (Phase 4)
- 📋 마이페이지 (Phase 5)
- 📋 테스트 및 배포 (Phase 6)
