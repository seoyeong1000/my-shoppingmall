/**
 * @file app/products/page.tsx
 * @description 상품 목록 페이지
 *
 * 활성화된 모든 상품을 Grid 레이아웃으로 표시합니다.
 * 카테고리 필터링과 페이지네이션을 지원하며, URL 쿼리 파라미터로 필터링됩니다.
 *
 * 주요 기능:
 * 1. Supabase에서 활성 상품만 조회 (is_active = true)
 * 2. 카테고리별 필터링
 * 3. 페이지네이션 (페이지당 12개 상품)
 * 4. 반응형 Grid 레이아웃 (모바일 2열, 태블릿 3열, 데스크톱 4열)
 * 5. 카테고리별 상품 개수 표시
 *
 * @dependencies
 * - @/lib/supabase/server: Supabase 클라이언트
 * - @/components/category-filter: 카테고리 필터 컴포넌트
 * - @/components/product-card: 상품 카드 컴포넌트
 * - @/components/product-pagination: 페이지네이션 컴포넌트
 * - @/lib/constants/categories: 카테고리 상수
 */

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { CATEGORIES, type CategoryValue } from "@/lib/constants/categories";
import CategoryFilter from "@/components/category-filter";
import ProductCard from "@/components/product-card";
import ProductPagination from "@/components/product-pagination";

type SearchParams = Promise<{ category?: string; page?: string }>;

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

export default async function ProductsPage(props: { searchParams: SearchParams }) {
  const { category, page } = await props.searchParams;
  const selectedCategory = category ?? undefined;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const itemsPerPage = 12;

  // 서버 로깅
  console.group("ProductsPage:Query");
  console.info("selectedCategory", selectedCategory);
  console.info("currentPage", currentPage);

  const supabase = createClerkSupabaseClient();

  // 전체 상품 개수 조회 (페이지네이션 계산용)
  let countQuery = supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (selectedCategory) {
    countQuery = countQuery.eq("category", selectedCategory);
  }

  const { count: totalCount, error: countError } = await countQuery;

  if (countError) {
    console.error("countError", countError.message);
  }

  const totalCountValue = totalCount ?? 0;
  const totalPages = Math.ceil(totalCountValue / itemsPerPage);

  // 페이지 범위 계산
  const from = (currentPage - 1) * itemsPerPage;
  const to = currentPage * itemsPerPage - 1;

  console.info("pagination", {
    totalCount: totalCountValue,
    totalPages,
    currentPage,
    from,
    to,
    itemsPerPage,
  });

  // 상품 목록 조회 (활성 상품만, 페이지네이션 적용)
  let productsQuery = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (selectedCategory) {
    productsQuery = productsQuery.eq("category", selectedCategory);
  }

  const { data: products, error: productsError } = await productsQuery;

  if (productsError) {
    console.error("productsError", productsError.message);
  }

  console.info("products count", products?.length ?? 0);

  // 카테고리별 개수 계산 (전체 포함)
  const countPromises = [
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    ...CATEGORIES.map((c) =>
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .eq("category", c.value)
    ),
  ];

  const countResults = await Promise.all(countPromises);

  const allCount = countResults[0].count ?? 0;
  const categoryCounts: Record<string, number> = {};
  CATEGORIES.forEach((c, idx) => {
    categoryCounts[c.value] = countResults[idx + 1].count ?? 0;
  });

  console.info("counts", { all: allCount, ...categoryCounts });
  console.groupEnd();

  return (
    <main className="min-h-[calc(100vh-80px)] px-8 py-16 lg:py-24">
      <section className="w-full max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">전체 상품</h1>

        {/* 카테고리 필터 */}
        <CategoryFilter
          selected={selectedCategory}
          allCount={allCount}
          categories={CATEGORIES.map((c) => ({
            value: c.value,
            label: c.label,
            count: categoryCounts[c.value] ?? 0,
          }))}
        />

        {/* 상품 그리드 - 반응형 레이아웃 */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {(products as ProductRow[] | null)?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {(!products || products.length === 0) && (
            <div className="col-span-full text-center text-gray-500 py-12">
              표시할 상품이 없습니다.
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 0 && (
          <ProductPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCountValue}
          />
        )}
      </section>
    </main>
  );
}

