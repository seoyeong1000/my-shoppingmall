/**
 * @file popular-products-section.tsx
 * @description 인기 상품 섹션 컴포넌트 (가로 스크롤 카드 형태)
 */

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
}

interface PopularProductsSectionProps {
  products: Product[];
}

export default function PopularProductsSection({
  products,
}: PopularProductsSectionProps) {
  return (
    <section className="w-full max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">인기 상품</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-[280px] rounded-lg border p-4 hover:shadow-md transition-shadow"
          >
            <div className="text-sm text-gray-500">{product.category ?? "기타"}</div>
            <div className="mt-1 font-semibold line-clamp-2">{product.name}</div>
            {product.description && (
              <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                {product.description}
              </div>
            )}
            <div className="mt-3 text-lg font-bold">{product.price.toLocaleString()}원</div>
            <div className="mt-1 text-xs text-gray-500">재고 {product.stock_quantity}개</div>
          </div>
        ))}
      </div>
    </section>
  );
}

