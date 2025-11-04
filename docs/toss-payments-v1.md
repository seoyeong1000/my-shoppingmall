# Toss Payments v1 통합 참고 메모

## 환경 변수 정의
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`: 토스페이먼츠 테스트/라이브 클라이언트 키. 브라우저에서 결제창 SDK를 초기화할 때 사용합니다.
- `TOSS_SECRET_KEY`: 토스페이먼츠 테스트/라이브 시크릿 키. 서버에서 결제 승인 API(`/v1/payments/confirm`)를 호출할 때 Basic 인증 헤더로 사용하므로 절대로 클라이언트 번들에 노출하지 않습니다.

> `.env` 파일에 위 두 값을 추가하고, 필요 시 팀원이 참고할 수 있도록 `.env.example`에도 동일한 키 이름을 포함시키세요. 시크릿 키는 버전 관리 저장소에 커밋하지 않습니다.

## 테스트 데이터 & 실패 시뮬레이션
- 테스트 카드/계좌 정보는 토스 공식 문서의 [테스트 환경 가이드](https://docs.tosspayments.com/reference/test-environment#카드)에서 최신 목록을 확인합니다.
- 특정 오류를 재현하고 싶을 때는 요청 헤더에 `TossPayments-Test-Code: <ERROR_CODE>` 를 추가합니다. 예: `INVALID_CARD_EXPIRATION`.

## 핵심 로깅 포인트 (클라이언트 / 서버)
- `components/cart-summary.tsx`
  - 사용자가 "결제하기"를 누르는 시점에 `console.group("checkout:payment-request")` 로 결제 금액, 주문 요약, Clerk 사용자 ID를 구조화된 객체로 남깁니다.
- `app/checkout/payment/success/page.tsx`
  - 리다이렉트 파라미터 검증 직전에 `console.group("checkout:payment-success")` 으로 `paymentKey`, `orderId`, `amount` 값을 기록합니다.
  - `/v1/payments/confirm` 호출 결과(성공/실패, 응답 코드)를 `console.log` 로 남기고, 주문 생성 로직 호출 전후에 상태를 명확히 구분합니다.
- `app/checkout/payment/fail/page.tsx`
  - 쿼리로 전달된 오류 코드/메시지를 `console.error("checkout:payment-fail", { code, message })` 형태로 기록해 추후 분석 시 활용합니다.

위 로그는 기능 안정화 이후에도 최소한으로 유지하여 결제 문제 발생 시 빠르게 원인을 파악할 수 있도록 합니다.

## 수동 테스트 체크리스트
1. **성공 경로**
   - `.env` 파일에 테스트 키(클라이언트/시크릿)를 설정합니다.
   - 장바구니에 상품을 담고 배송 정보를 입력한 뒤 결제를 진행합니다.
   - 테스트 카드 번호를 사용해 승인 완료 후 `/checkout/payment/success` 페이지가 주문 상세 링크와 함께 렌더링 되는지 확인합니다.
   - Supabase `orders` 테이블에서 생성된 주문의 `status` 값이 `confirmed` 인지 검증합니다.
2. **실패 경로**
   - 결제창에서 임의로 창을 닫아 `USER_CANCEL` 케이스를 재현하고, 경고 로그와 실패 안내 페이지가 정상 노출되는지 확인합니다.
   - `TossPayments-Test-Code` 헤더에 `INVALID_CARD_EXPIRATION` 을 설정한 뒤 실패 안내 페이지와 오류 코드 노출을 확인합니다.
3. **데이터 검증**
   - 결제 시도 후 장바구니가 비워졌는지, `order_items` / `orders` 데이터가 정확한 금액과 수량으로 저장되었는지 점검합니다.
   - `orders` 테이블의 `shipping_address` 필드에 입력한 배송 정보가 그대로 반영되었는지 확인합니다.

필요 시 위 체크리스트를 기준으로 QA 문서를 확장하고, 반복 테스트 결과를 문서화하세요.

