/**
 * @file product-card.tsx
 * @description 재사용 가능한 상품 카드 컴포넌트
 *
 * 상품 정보를 카드 형태로 표시하고, 클릭 시 상품 상세 페이지로 이동합니다.
 *
 * 주요 기능:
 * - 상품 정보 표시 (카테고리, 이름, 가격, 재고)
 * - 클릭 시 상품 상세 페이지로 이동
 * - 호버 효과 및 반응형 스타일
 *
 * @dependencies
 * - next/link: 클라이언트 사이드 라우팅
 */

import Link from "next/link";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // 서버 로깅 (개발용)
  console.log("ProductCard: Rendering", { productId: product.id, productName: product.name });

  return (
    <Link href={`/products/${product.id}`}>
      <div className="rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
        {/* 카테고리 */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {product.category ?? "기타"}
        </div>

        {/* 상품명 */}
        <div className="mt-1 font-semibold line-clamp-2 text-gray-900 dark:text-gray-100">
          {product.name}
        </div>

        {/* 가격 */}
        <div className="mt-2 text-lg font-bold text-gray-900 dark:text-gray-100">
          {product.price.toLocaleString()}원
        </div>

        {/* 재고 */}
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          재고 {product.stock_quantity}개
        </div>
      </div>
    </Link>
  );
}

