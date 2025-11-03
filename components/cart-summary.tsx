"use client";

/**
 * @file components/cart-summary.tsx
 * @description 장바구니 요약 컴포넌트
 *
 * 장바구니의 총 상품 개수, 총 수량, 총액을 표시하고,
 * 전체 비우기 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 총 상품 개수 표시
 * 2. 총 수량 표시
 * 3. 총액 표시
 * 4. 전체 비우기 버튼
 *
 * @dependencies
 * - @/actions/cart: clearCart Server Action
 * - @/components/ui/button: Button 컴포넌트
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { clearCart } from "@/actions/cart";
import { useRouter } from "next/navigation";
import type { CartSummary } from "@/types/cart";

interface CartSummaryProps {
  summary: CartSummary;
}

export default function CartSummary({ summary }: CartSummaryProps) {
  const [isClearing, setIsClearing] = useState(false);
  const router = useRouter();

  const handleClearCart = async () => {
    if (
      !confirm("장바구니의 모든 상품을 제거하시겠습니까? 이 작업은 되돌릴 수 없습니다.")
    ) {
      return;
    }

    setIsClearing(true);

    try {
      console.group("CartSummary:handleClearCart");

      const result = await clearCart();

      if (result.success) {
        console.info("Cart cleared successfully");
        router.refresh();
      } else {
        console.error("Cart clear failed", result.message);
        alert(result.message);
      }

      console.groupEnd();
    } catch (error) {
      console.error("CartSummary clear error", error);
      alert("장바구니 비우기에 실패했습니다.");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        주문 요약
      </h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>총 상품 개수:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {summary.totalItems}개
          </span>
        </div>
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>총 수량:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {summary.totalQuantity}개
          </span>
        </div>
        <div className="border-t pt-2 flex justify-between text-base font-semibold text-gray-900 dark:text-gray-100">
          <span>총액:</span>
          <span>{summary.totalAmount.toLocaleString()}원</span>
        </div>
      </div>

      <div className="pt-4 border-t space-y-2">
        <Button
          onClick={handleClearCart}
          disabled={isClearing || summary.totalItems === 0}
          variant="outline"
          className="w-full"
        >
          {isClearing ? "비우는 중..." : "장바구니 전체 비우기"}
        </Button>
      </div>
    </div>
  );
}

