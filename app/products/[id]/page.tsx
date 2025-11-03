/**
 * @file app/products/[id]/page.tsx
 * @description 상품 상세 페이지
 *
 * 특정 상품의 상세 정보를 표시합니다.
 * 상품 ID는 URL 파라미터에서 추출됩니다.
 *
 * 주요 기능:
 * 1. URL 파라미터에서 상품 ID 추출
 * 2. Supabase에서 단일 상품 정보 조회
 * 3. 상품 상세 정보 표시 (이름, 설명, 가격, 카테고리, 재고)
 * 4. 상품이 없을 경우 404 처리
 * 5. 장바구니 추가 버튼 UI (기능은 Phase 3에서 구현)
 * 6. 목록으로 돌아가기 링크
 *
 * @dependencies
 * - @/lib/supabase/server: Supabase 클라이언트
 * - @/components/ui/button: 버튼 컴포넌트
 * - @/lib/constants/categories: 카테고리 상수
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/constants/categories";
import type { CategoryValue } from "@/lib/constants/categories";

type Params = Promise<{ id: string }>;

export interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: CategoryValue | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default async function ProductDetailPage(props: { params: Params }) {
  const { id } = await props.params;

  // 서버 로깅
  console.group("ProductDetailPage:Query");
  console.info("productId", id);

  const supabase = createClerkSupabaseClient();

  // 상품 정보 조회
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (productError) {
    console.error("productError", productError.message);
  }

  // 상품이 없거나 비활성화된 경우 404
  if (!product || !product.is_active) {
    console.warn("Product not found or inactive", { productId: id });
    console.groupEnd();
    notFound();
  }

  // 카테고리 라벨 찾기
  const categoryLabel =
    CATEGORIES.find((c) => c.value === product.category)?.label ?? "기타";

  console.info("product", { id: product.id, name: product.name });
  console.groupEnd();

  return (
    <main className="min-h-[calc(100vh-80px)] px-8 py-16 lg:py-24">
      <div className="w-full max-w-4xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <Link href="/products">
          <Button variant="outline" className="mb-8">
            ← 목록으로 돌아가기
          </Button>
        </Link>

        {/* 상품 상세 정보 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-8 shadow-sm">
          {/* 카테고리 */}
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {categoryLabel}
          </div>

          {/* 상품명 */}
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            {product.name}
          </h1>

          {/* 가격 */}
          <div className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            {product.price.toLocaleString()}원
          </div>

          {/* 재고 정보 */}
          <div className="mb-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              재고: <span className="font-semibold">{product.stock_quantity}개</span>
            </div>
            {product.stock_quantity === 0 && (
              <div className="text-sm text-red-500 mt-2">품절된 상품입니다.</div>
            )}
          </div>

          {/* 상품 설명 */}
          {product.description && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                상품 설명
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* 장바구니 추가 버튼 (Phase 3에서 기능 구현) */}
          <div className="mt-8 pt-8 border-t">
            <Button
              className="w-full md:w-auto min-w-[200px]"
              size="lg"
              disabled={product.stock_quantity === 0}
            >
              {product.stock_quantity === 0 ? "품절" : "장바구니에 추가"}
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              * 장바구니 기능은 Phase 3에서 구현 예정입니다.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

