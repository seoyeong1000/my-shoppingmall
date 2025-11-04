"use client";

import { useState } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";
import { addCartItem } from "@/actions/cart/add-item";
import AddToCartDialog from "@/components/add-to-cart-dialog";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  stockQuantity: number;
}

/**
 * 장바구니 추가 버튼 컴포넌트
 *
 * 로그인한 사용자만 장바구니에 추가할 수 있습니다.
 * 수량을 선택할 수 있는 UI가 포함되어 있습니다.
 */
export default function AddToCartButton({
  productId,
  productName,
  stockQuantity,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const value = e.target.value;
    if (value === "") {
      setQuantity(1);
      return;
    }

    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) {
      setQuantity(1);
    } else if (numValue > stockQuantity) {
      setQuantity(stockQuantity);
      setError(`재고가 부족합니다. (최대 ${stockQuantity}개)`);
    } else {
      setQuantity(numValue);
      setError(null);
    }
  };

  const handleAddToCart = async () => {
    if (stockQuantity === 0) {
      return;
    }

    if (quantity < 1 || quantity > stockQuantity) {
      setError(`수량은 1개 이상 ${stockQuantity}개 이하여야 합니다.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.group("AddToCartButton: Add to Cart");
      console.info("productId", productId);
      console.info("quantity", quantity);
      console.info("stockQuantity", stockQuantity);

      const result = await addCartItem(productId, quantity);

      console.info("result", result);
      console.groupEnd();

      if (result.success) {
        setDialogOpen(true);
        setQuantity(1); // 성공 시 수량 초기화
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("AddToCartButton: error", err);
      setError("장바구니에 추가하는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SignedIn>
        <div className="space-y-4">
          {/* 수량 선택 UI */}
          {stockQuantity > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                수량
              </label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={handleDecrease}
                  disabled={quantity <= 1 || isLoading}
                  aria-label="수량 감소"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min={1}
                  max={stockQuantity}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-20 text-center"
                  disabled={isLoading}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={handleIncrease}
                  disabled={quantity >= stockQuantity || isLoading}
                  aria-label="수량 증가"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                  (최대 {stockQuantity}개)
                </span>
              </div>
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            disabled={stockQuantity === 0 || isLoading}
            onClick={handleAddToCart}
          >
            {isLoading
              ? "추가 중..."
              : stockQuantity === 0
              ? "품절"
              : `장바구니에 추가 (${quantity}개)`}
          </Button>

          {error && (
            <p className="text-xs text-red-500 dark:text-red-400 text-center">
              {error}
            </p>
          )}
        </div>
      </SignedIn>

      <SignedOut>
        <SignInButton mode="modal">
          <Button className="w-full" size="lg" disabled={stockQuantity === 0}>
            {stockQuantity === 0 ? "품절" : "로그인 후 장바구니에 추가"}
          </Button>
        </SignInButton>
      </SignedOut>

      <AddToCartDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        productName={productName}
      />
    </>
  );
}

