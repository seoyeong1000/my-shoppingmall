/**
 * @file app/cart/page.tsx
 * @description 장바구니 페이지
 *
 * 현재 사용자의 장바구니 아이템을 표시하고 관리합니다.
 * Server Component로 구현하여 서버 사이드에서 데이터를 조회합니다.
 *
 * 주요 기능:
 * 1. 장바구니 아이템 목록 표시
 * 2. 장바구니 요약 정보 표시
 * 3. 빈 장바구니 상태 표시
 * 4. 주문하기 버튼 (Phase 4에서 기능 구현)
 *
 * @dependencies
 * - @/actions/cart: getCartItems, getCartSummary Server Actions
 * - @/components/cart-item: CartItem 컴포넌트
 * - @/components/cart-summary: CartSummary 컴포넌트
 * - @/components/ui/button: Button 컴포넌트
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCartItems, getCartSummary } from "@/actions/cart";
import CartItem from "@/components/cart-item";
import CartSummary from "@/components/cart-summary";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default async function CartPage() {
  // Clerk 인증 확인
  const { userId } = await auth();

  if (!userId) {
    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
    redirect("/sign-in");
  }

  // 서버 로깅
  console.group("CartPage:Load");
  console.info("userId", userId);

  // 장바구니 데이터 조회
  const cartItems = await getCartItems();
  const summary = await getCartSummary();

  console.info("cartItems count", cartItems.length);
  console.info("summary", summary);
  console.groupEnd();

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 sm:px-8 py-8 sm:py-16 lg:py-24">
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
          장바구니
        </h1>

        {cartItems.length === 0 ? (
          // 빈 장바구니 상태
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-12 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              장바구니가 비어있습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              상품을 추가하여 장바구니를 채워보세요.
            </p>
            <Link href="/products">
              <Button>상품 둘러보기</Button>
            </Link>
          </div>
        ) : (
          // 장바구니 아이템 목록
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 왼쪽: 장바구니 아이템 목록 */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* 오른쪽: 장바구니 요약 */}
            <div className="lg:col-span-1">
              <CartSummary summary={summary} />

              {/* 주문하기 버튼 */}
              <div className="mt-4">
                <Link href="/checkout" className="block">
                  <Button className="w-full" size="lg">
                    주문하기
                  </Button>
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                  * 주문 기능은 Phase 4에서 구현 예정입니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

