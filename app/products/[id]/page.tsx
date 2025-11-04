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
 * 3. 상품 상세 정보 표시 (이미지, 이름, 설명, 가격, 카테고리, 재고)
 * 4. 상품이 없을 경우 404 처리
 * 5. 장바구니 추가 버튼 UI (기능은 Phase 3에서 구현)
 * 6. 목록으로 돌아가기 링크
 *
 * 레이아웃 구조:
 * - 왼쪽 열 (2/3): 제품 이미지, 이름, 가격, 재고, 카테고리, 설명, 등록일/수정일
 * - 오른쪽 열 (1/3): 장바구니 UI (sticky positioning, 데스크톱만)
 * - 반응형: 모바일은 1열 (이미지 위, 정보 아래, 장바구니 UI 하단), 데스크톱은 3열
 *
 * @dependencies
 * - @/lib/supabase/server: Supabase 클라이언트
 * - @/components/ui/button: 버튼 컴포넌트
 * - @/components/product-image: 상품 이미지 컴포넌트
 * - @/lib/constants/categories: 카테고리 상수
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductImage from "@/components/product-image";
import { CATEGORIES } from "@/lib/constants/categories";
import type { CategoryValue } from "@/lib/constants/categories";
import AddToCartButton from "@/components/add-to-cart-button";

/**
 * 날짜를 한국어 형식으로 포맷팅합니다.
 * @param dateString ISO 날짜 문자열
 * @returns 한국어 형식 날짜 문자열 (예: "2024년 11월 3일")
 */
function formatDateKorean(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

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
  image_url?: string | null;
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

  console.info("product", {
    id: product.id,
    name: product.name,
    imageUrl: product.image_url || "없음 (placeholder 사용)",
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  });

  // 중단 섹션 정보 로깅
  console.group("ProductDetailPage:MiddleSection");
  console.info("category", {
    value: product.category,
    label: categoryLabel,
  });
  console.info("description", {
    exists: !!product.description,
    length: product.description?.length || 0,
    preview: product.description
      ? product.description.substring(0, 50) + "..."
      : "없음",
  });
  console.groupEnd();

  console.groupEnd();

  // 등록일과 수정일 비교
  const createdDate = new Date(product.created_at);
  const updatedDate = new Date(product.updated_at);
  const isUpdated = updatedDate.getTime() > createdDate.getTime();

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 sm:px-8 py-8 sm:py-16 lg:py-24">
      <div className="w-full max-w-6xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <Link href="/products">
          <Button variant="outline" className="mb-6 sm:mb-8">
            ← 목록으로 돌아가기
          </Button>
        </Link>

        {/* 상품 상세 정보 - 3열 그리드 레이아웃 (데스크톱), 1열 (모바일) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* 왼쪽 열: 제품 이미지 + 정보 (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* 제품 이미지 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 sm:p-8 shadow-sm">
              <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                <ProductImage
                  imageUrl={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              </div>
            </div>

            {/* 제품 이름 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 sm:p-8 shadow-sm">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
                {product.name}
              </h1>
            </div>

            {/* 가격 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 sm:p-8 shadow-sm">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {product.price.toLocaleString()}
                </span>
                <span className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 font-medium">
                  원
                </span>
              </div>
            </div>

            {/* 재고 표시 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
              <div className="flex items-center gap-3 flex-wrap">
                {product.stock_quantity === 0 ? (
                  <Badge variant="destructive" className="text-sm px-3 py-1.5">
                    품절
                  </Badge>
                ) : (
                  <Badge
                    variant="default"
                    className="text-sm px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white border-green-700"
                  >
                    구매 가능
                  </Badge>
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  재고:{" "}
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {product.stock_quantity}개
                  </span>
                </span>
              </div>
            </div>

            {/* 카테고리 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  카테고리:
                </span>
                <Badge variant="outline" className="text-sm px-3 py-1.5">
                  {categoryLabel}
                </Badge>
              </div>
            </div>

            {/* 상품 설명 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 sm:p-8 shadow-sm">
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  상품 설명
                </h2>
                {product.description ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    상품 설명이 없습니다.
                  </p>
                )}
              </div>
            </div>

            {/* 등록일/수정일 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <div>등록일: {formatDateKorean(product.created_at)}</div>
                {isUpdated && (
                  <div>수정일: {formatDateKorean(product.updated_at)}</div>
                )}
              </div>
            </div>
          </div>

          {/* 오른쪽 열: 장바구니 UI (1/3, sticky positioning) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  구매하기
                </h3>

                <div className="space-y-4">
                  {/* 재고 상태 표시 */}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between items-center mb-2">
                      <span>재고 상태:</span>
                      <span
                        className={`font-semibold ${
                          product.stock_quantity === 0
                            ? "text-red-500"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {product.stock_quantity === 0 ? "품절" : "구매 가능"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>남은 수량:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {product.stock_quantity}개
                      </span>
                    </div>
                  </div>

                  {/* 장바구니 추가 버튼 */}
                  <AddToCartButton
                    productId={product.id}
                    productName={product.name}
                    stockQuantity={product.stock_quantity}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
