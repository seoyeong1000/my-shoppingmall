"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { CartItemWithProduct } from "@/actions/cart/get-items";

interface CartSummaryProps {
  items: CartItemWithProduct[];
}

/**
 * 장바구니 요약 컴포넌트
 * 
 * 총 상품 금액, 총 수량, 주문하기 버튼을 표시합니다.
 */
export default function CartSummary({ items }: CartSummaryProps) {
  // 총 상품 금액 계산
  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // 총 수량 계산
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-4 bg-white dark:bg-gray-800 border rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        주문 요약
      </h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">총 상품 수</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {totalQuantity}개
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">총 상품 금액</span>
          <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            {totalAmount.toLocaleString()}원
          </span>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Link href="/checkout" className="block">
          <Button className="w-full" size="lg">
            주문하기
          </Button>
        </Link>
      </div>
    </div>
  );
}

