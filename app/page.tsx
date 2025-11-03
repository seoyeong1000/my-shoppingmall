import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RiSupabaseFill } from "react-icons/ri";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { CATEGORIES, type CategoryValue } from "@/lib/constants/categories";
import CategoryFilter from "@/components/category-filter";
import PopularProductsSection from "@/components/popular-products-section";

type SearchParams = Promise<{ category?: string }>;

interface ProductRow {
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

export default async function Home(props: { searchParams: SearchParams }) {
  const { category } = await props.searchParams;
  const selectedCategory = category ?? undefined;

  // 서버 로깅
  console.group("HomePage:Query");
  console.info("selectedCategory", selectedCategory);

  const supabase = createClerkSupabaseClient();

  // 상품 목록 조회 (활성 상품만)
  let productsQuery = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (selectedCategory) {
    productsQuery = productsQuery.eq("category", selectedCategory);
  }

  const { data: products, error: productsError } = await productsQuery;

  if (productsError) {
    console.error("productsError", productsError.message);
  }

  // 인기 상품 조회 (order_items 기반 판매량 상위 4개)
  console.group("HomePage:PopularProducts");
  const { data: allOrderItems, error: orderItemsError } = await supabase
    .from("order_items")
    .select("product_id, quantity");

  if (orderItemsError) {
    console.error("orderItemsError", orderItemsError.message);
  }

  // product_id별 quantity 합계 계산
  const salesByProduct: Record<string, number> = {};
  if (allOrderItems) {
    for (const item of allOrderItems) {
      const productId = item.product_id;
      salesByProduct[productId] = (salesByProduct[productId] || 0) + item.quantity;
    }
  }

  // 판매량 기준 상위 4개 product_id 선택
  const topProductIds = Object.entries(salesByProduct)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([productId]) => productId);

  console.info("salesByProduct", salesByProduct);
  console.info("topProductIds", topProductIds);

  // 상위 4개 상품 정보 조회
  let popularProducts: ProductRow[] = [];
  if (topProductIds.length > 0) {
    const { data: popularData, error: popularError } = await supabase
      .from("products")
      .select("*")
      .in("id", topProductIds)
      .eq("is_active", true);

    if (popularError) {
      console.error("popularError", popularError.message);
    } else if (popularData) {
      // topProductIds 순서 유지
      popularProducts = topProductIds
        .map((id) => popularData.find((p) => p.id === id))
        .filter((p): p is ProductRow => p !== undefined);
    }
  }

  console.info("popularProducts count", popularProducts.length);
  console.groupEnd();

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
    <main className="min-h-[calc(100vh-80px)] flex flex-col gap-16 px-8 py-16 lg:py-24">
      <section className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start lg:items-center">
        {/* 좌측: 환영 메시지 */}
        <div className="flex flex-col gap-8">
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
            SaaS 앱 템플릿에 오신 것을 환영합니다
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed">
            Next.js, Shadcn, Clerk, Supabase, TailwindCSS로 구동되는 완전한
            기능의 템플릿으로 다음 프로젝트를 시작하세요.
          </p>
        </div>

        {/* 우측: 버튼 두 개 세로 정렬 */}
        <div className="flex flex-col gap-6">
          <Link href="/storage-test" className="w-full">
            <Button className="w-full h-28 flex items-center justify-center gap-4 text-xl shadow-lg hover:shadow-xl transition-shadow">
              <RiSupabaseFill className="w-8 h-8" />
              <span>Storage 파일 업로드 테스트</span>
            </Button>
          </Link>
          <Link href="/auth-test" className="w-full">
            <Button
              className="w-full h-28 flex items-center justify-center gap-4 text-xl shadow-lg hover:shadow-xl transition-shadow"
              variant="outline"
            >
              <RiSupabaseFill className="w-8 h-8" />
              <span>Clerk + Supabase 인증 연동</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* 인기 상품 섹션 */}
      {popularProducts.length > 0 && (
        <PopularProductsSection products={popularProducts} />
      )}

      {/* 상품 섹션 */}
      <section className="w-full max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">전체 상품</h1>

        {/* 카테고리 필터 (버튼 + 배지) */}
        <CategoryFilter
          selected={selectedCategory}
          allCount={allCount}
          categories={CATEGORIES.map((c) => ({
            value: c.value,
            label: c.label,
            count: categoryCounts[c.value] ?? 0,
          }))}
        />

        {/* 상품 그리드 */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {(products as ProductRow[] | null)?.map((p) => (
            <div key={p.id} className="rounded-lg border p-4 hover:shadow-sm transition-shadow">
              <div className="text-sm text-gray-500">{p.category ?? "기타"}</div>
              <div className="mt-1 font-semibold line-clamp-2">{p.name}</div>
              <div className="mt-2 text-lg font-bold">{p.price.toLocaleString()}원</div>
              <div className="mt-1 text-xs text-gray-500">재고 {p.stock_quantity}개</div>
            </div>
          ))}
          {(!products || products.length === 0) && (
            <div className="col-span-full text-center text-gray-500">표시할 상품이 없습니다.</div>
          )}
        </div>
      </section>
    </main>
  );
}
