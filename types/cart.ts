/**
 * @file types/cart.ts
 * @description 장바구니 관련 TypeScript 타입 정의
 */

/**
 * cart_items 테이블의 기본 타입
 */
export interface CartItem {
  id: string;
  clerk_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

/**
 * 상품 정보가 JOIN된 장바구니 아이템 타입
 */
export interface CartItemWithProduct extends CartItem {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    category: string | null;
    stock_quantity: number;
    is_active: boolean;
    image_url?: string | null; // 선택적 필드로 변경 (데이터베이스에 없을 수 있음)
  };
}

/**
 * 장바구니 요약 정보
 */
export interface CartSummary {
  totalItems: number; // 총 아이템 개수
  totalQuantity: number; // 총 수량
  totalAmount: number; // 총액
}

