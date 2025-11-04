/**
 * @file popular-products-section.tsx
 * @description 인기 상품 섹션 컴포넌트 (그리드 레이아웃)
 * 
 * 전체 상품 목록과 동일한 그리드 레이아웃을 사용하여 좌/우 간격을 맞춥니다.
 */

import ProductCard from "@/components/product-card";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  image_url?: string | null;
}

interface PopularProductsSectionProps {
  products: Product[];
}

export default function PopularProductsSection({
  products,
}: PopularProductsSectionProps) {
  // 최대 4개만 표시
  const displayedProducts = products.slice(0, 4);

  return (
    <section className="w-full max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">인기 상품</h2>
      {/* 전체 상품 목록과 동일한 그리드 레이아웃 사용 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

