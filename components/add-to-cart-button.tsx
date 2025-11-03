"use client";

/**
 * @file components/add-to-cart-button.tsx
 * @description 장바구니 추가 버튼 컴포넌트
 *
 * 상품 상세 페이지에서 사용하는 장바구니 추가 기능을 제공합니다.
 * 수량 입력 및 검증, Server Action 호출, Dialog 표시를 담당합니다.
 *
 * 주요 기능:
 * 1. 수량 입력 및 검증 (1 ~ 재고 범위)
 * 2. +, - 버튼으로 수량 조절
 * 3. 장바구니 추가 Server Action 호출
 * 4. 성공 시 Dialog 표시
 * 5. 에러 처리 및 사용자 피드백
 *
 * @dependencies
 * - @/actions/cart: addToCart Server Action
 * - @/components/cart-dialog: CartDialog 컴포넌트
 * - @/components/ui/input: Input 컴포넌트
 * - @/components/ui/button: Button 컴포넌트
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addToCart } from "@/actions/cart";
import CartDialog from "@/components/cart-dialog";
import { Minus, Plus } from "lucide-react";

interface AddToCartButtonProps {
  productId: string;
  stockQuantity: number;
}

export default function AddToCartButton({
  productId,
  stockQuantity,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // 수량 증가
  const handleIncrease = () => {
    if (quantity < stockQuantity) {
      setQuantity(quantity + 1);
      setError(null);
    }
  };

  // 수량 감소
  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
      setError(null);
    }
  };

  // 수량 직접 입력
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);

    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else if (value > stockQuantity) {
      setQuantity(stockQuantity);
      setError(`최대 수량은 ${stockQuantity}개입니다.`);
    } else {
      setQuantity(value);
      setError(null);
    }
  };

  // 장바구니 추가
  const handleAddToCart = async () => {
    if (stockQuantity === 0) {
      setError("품절된 상품입니다.");
      return;
    }

    if (quantity < 1 || quantity > stockQuantity) {
      setError("올바른 수량을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.group("AddToCartButton:handleAddToCart");
      console.info("productId", productId);
      console.info("quantity", quantity);

      const result = await addToCart(productId, quantity);

      if (result.success) {
        console.info("Cart added successfully");
        setDialogOpen(true);
        setQuantity(1); // 수량 초기화
      } else {
        console.error("Cart add failed", result.message);
        setError(result.message);
      }

      console.groupEnd();
    } catch (err) {
      console.error("AddToCartButton error", err);
      setError("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = stockQuantity === 0 || isLoading;

  return (
    <div className="space-y-4">
      {/* 수량 입력 UI */}
      <div className="flex items-center gap-3">
        <label htmlFor="quantity" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          수량:
        </label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleDecrease}
            disabled={quantity <= 1 || isDisabled}
            className="h-9 w-9"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            id="quantity"
            type="number"
            min={1}
            max={stockQuantity}
            value={quantity}
            onChange={handleQuantityChange}
            disabled={isDisabled}
            className="w-20 text-center"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleIncrease}
            disabled={quantity >= stockQuantity || isDisabled}
            className="h-9 w-9"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          (최대 {stockQuantity}개)
        </span>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}

      {/* 장바구니 추가 버튼 */}
      <Button
        onClick={handleAddToCart}
        disabled={isDisabled}
        className="w-full"
        size="lg"
      >
        {isLoading ? "추가 중..." : stockQuantity === 0 ? "품절" : "장바구니에 추가"}
      </Button>

      {/* 장바구니 Dialog */}
      <CartDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}

