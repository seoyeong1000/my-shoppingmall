import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { CATEGORIES, type CategoryValue } from "@/lib/constants/categories";
import CategoryFilter from "@/components/category-filter";
import PopularProductsSection from "@/components/popular-products-section";
import ProductCard from "@/components/product-card";
import ProductPagination from "@/components/product-pagination";

type SearchParams = Promise<{ category?: string; page?: string }>;

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
  image_url?: string | null;
}

export default async function Home(props: { searchParams: SearchParams }) {
  const { category, page } = await props.searchParams;
  const selectedCategory = category ?? undefined;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const itemsPerPage = 12;

  // 서버 로깅
  console.group("HomePage:Query");
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

  // 인기 상품 조회 (order_items 기반 판매량 상위 4개, 부족하면 최신 상품으로 보완)
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

  // 상위 판매량 상품 정보 조회
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

  // order_items가 없거나 4개 미만이면 최신 상품으로 보완
  // 항상 4개를 채우도록 보장 (활성 상품이 있는 경우)
  const neededCount = 4 - popularProducts.length;
  if (neededCount > 0) {
    console.info("Need to supplement with latest products", { 
      neededCount, 
      currentCount: popularProducts.length 
    });
    
    // 이미 선택된 상품 ID 제외
    const existingIds = popularProducts.map((p) => p.id);
    
    // 최신 상품 조회 (활성 상품만, 이미 선택된 것 제외)
    // 더 많이 조회한 후 클라이언트에서 필터링
    const fetchLimit = existingIds.length > 0 
      ? Math.max(neededCount + existingIds.length, 4)
      : 4;
    
    const { data: allLatestProducts, error: latestError } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(fetchLimit);

    if (latestError) {
      console.error("latestProductsError", latestError.message);
    } else if (allLatestProducts && allLatestProducts.length > 0) {
      // 이미 선택된 상품 제외하고 필요한 개수만큼 선택
      const latestProducts = allLatestProducts
        .filter((p) => !existingIds.includes(p.id))
        .slice(0, neededCount);

      if (latestProducts.length > 0) {
        // 기존 인기상품에 최신 상품 추가
        popularProducts = [...popularProducts, ...latestProducts].slice(0, 4);
        console.info("Supplemented with latest products", {
          originalCount: popularProducts.length - latestProducts.length,
          addedCount: latestProducts.length,
          totalCount: popularProducts.length,
        });
      } else {
        console.warn("HomePage: No additional latest products found to supplement");
      }
    } else {
      console.warn("HomePage: No active products found to display as popular");
    }
  }

  // 항상 정확히 4개로 제한 (혹시 모를 경우 대비)
  popularProducts = popularProducts.slice(0, 4);

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
      {/* 인기 상품 섹션 - 활성 상품이 있으면 항상 표시 */}
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
          {(products as ProductRow[] | null)?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {(!products || products.length === 0) && (
            <div className="col-span-full text-center text-gray-500">표시할 상품이 없습니다.</div>
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
