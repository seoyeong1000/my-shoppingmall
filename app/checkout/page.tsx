/**
 * @file app/checkout/page.tsx
 * @description 주문 확인 페이지
 *
 * 장바구니 아이템을 확인하고 배송 정보를 입력하여 주문을 생성합니다.
 *
 * 주요 기능:
 * 1. 현재 사용자의 장바구니 아이템 조회 및 표시
 * 2. 주문 폼 컴포넌트 렌더링 (배송 정보 입력)
 * 3. 주문 요약 정보 표시 (총 금액, 총 수량)
 * 4. 주문하기 버튼 (주문 폼 제출)
 * 5. 주문 성공 시 주문 완료 페이지로 리다이렉트
 *
 * @dependencies
 * - @/actions/cart/get-items: 장바구니 아이템 조회
 * - @/components/checkout-form: 주문 폼 컴포넌트
 * - @/components/cart-item: 장바구니 아이템 표시
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCartItems } from "@/actions/cart/get-items";
import CartItem from "@/components/cart-item";
import CheckoutForm from "@/components/checkout-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CheckoutPage() {
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
            <h1 className="text-2xl font-bold mb-4">주문하기</h1>
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

  // 장바구니가 비어있으면 장바구니 페이지로 리다이렉트
  if (items.length === 0) {
    redirect("/cart");
  }

  // 총 상품 금액 계산
  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // 총 수량 계산
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 sm:px-8 py-8 sm:py-16 lg:py-24">
      <div className="w-full max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">주문하기</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 주문 폼 (왼쪽 2열) */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
                배송 정보
              </h2>
              <CheckoutForm />
            </div>
          </div>

          {/* 주문 요약 (오른쪽 1열) */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 bg-white dark:bg-gray-800 border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                주문 요약
              </h2>

              {/* 장바구니 아이템 목록 */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>

              {/* 주문 요약 정보 */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    총 상품 수
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {totalQuantity}개
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    총 상품 금액
                  </span>
                  <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    {totalAmount.toLocaleString()}원
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t mt-6">
                <Link href="/cart">
                  <Button variant="outline" className="w-full">
                    장바구니로 돌아가기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

