/**
 * @file app/cart/page.tsx
 * @description 장바구니 페이지
 *
 * 현재 사용자의 장바구니 아이템을 표시하고 관리합니다.
 *
 * 주요 기능:
 * 1. 현재 사용자의 장바구니 아이템 조회
 * 2. 빈 장바구니 상태 표시
 * 3. 장바구니 아이템 목록 표시 (CartItem 컴포넌트)
 * 4. 장바구니 요약 표시 (CartSummary 컴포넌트)
 *
 * @dependencies
 * - @/actions/cart/get-items: 장바구니 아이템 조회
 * - @/components/cart-item: 장바구니 아이템 컴포넌트
 * - @/components/cart-summary: 장바구니 요약 컴포넌트
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCartItems } from "@/actions/cart/get-items";
import CartItem from "@/components/cart-item";
import CartSummary from "@/components/cart-summary";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CartPage() {
  // 인증 확인
  const { userId } = await auth();
  if (!userId) {
    redirect("/products");
  }

  // 장바구니 아이템 조회
  const result = await getCartItems();

  if (!result.success || !result.data) {
    return (
      <main className="min-h-[calc(100vh-80px)] px-4 sm:px-8 py-8 sm:py-16 lg:py-24">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">장바구니</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {result.message || "장바구니를 불러오는 중 오류가 발생했습니다."}
            </p>
            <Link href="/products">
              <Button variant="outline">상품 목록으로 돌아가기</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const items = result.data;

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 sm:px-8 py-8 sm:py-16 lg:py-24">
      <div className="w-full max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">장바구니</h1>

        {items.length === 0 ? (
          // 빈 장바구니 상태
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              장바구니가 비어있습니다.
            </p>
            <Link href="/products">
              <Button>상품 둘러보기</Button>
            </Link>
          </div>
        ) : (
          // 장바구니 아이템 목록
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 장바구니 아이템 목록 */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* 장바구니 요약 */}
            <div className="lg:col-span-1">
              <CartSummary items={items} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

