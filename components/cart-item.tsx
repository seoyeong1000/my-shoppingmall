"use client";

/**
 * @file components/cart-item.tsx
 * @description 장바구니 아이템 컴포넌트
 *
 * 장바구니 페이지에서 개별 아이템을 표시하고 관리합니다.
 * 수량 조절 및 삭제 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 상품 정보 표시 (이미지, 이름, 가격)
 * 2. 수량 조절 (+/- 버튼)
 * 3. 아이템 삭제
 * 4. 아이템별 소계 계산 및 표시
 *
 * @dependencies
 * - @/actions/cart: updateCartItem, removeCartItem Server Actions
 * - @/components/product-image: ProductImage 컴포넌트
 * - @/components/ui/button: Button 컴포넌트
 * - @/components/ui/input: Input 컴포넌트
 */

import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateCartItem, removeCartItem } from "@/actions/cart";
import ProductImage from "@/components/product-image";
import type { CartItemWithProduct } from "@/types/cart";
import { useRouter } from "next/navigation";

interface CartItemProps {
  item: CartItemWithProduct;
}

export default function CartItem({ item }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const router = useRouter();

  const product = item.product;
  const subtotal = product.price * quantity;
  const maxQuantity = product.stock_quantity;

  // 수량 증가
  const handleIncrease = async () => {
    if (quantity >= maxQuantity) {
      return;
    }

    const newQuantity = quantity + 1;
    await handleQuantityUpdate(newQuantity);
  };

  // 수량 감소
  const handleDecrease = async () => {
    if (quantity <= 1) {
      return;
    }

    const newQuantity = quantity - 1;
    await handleQuantityUpdate(newQuantity);
  };

  // 수량 직접 입력
  const handleQuantityChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value, 10);

    if (isNaN(value) || value < 1) {
      setQuantity(1);
      await handleQuantityUpdate(1);
    } else if (value > maxQuantity) {
      setQuantity(maxQuantity);
      await handleQuantityUpdate(maxQuantity);
    } else {
      setQuantity(value);
      await handleQuantityUpdate(value);
    }
  };

  // 수량 업데이트
  const handleQuantityUpdate = async (newQuantity: number) => {
    setIsUpdating(true);

    try {
      console.group("CartItem:handleQuantityUpdate");
      console.info("cartItemId", item.id);
      console.info("newQuantity", newQuantity);

      const result = await updateCartItem(item.id, newQuantity);

      if (result.success) {
        console.info("Quantity updated successfully");
        setQuantity(newQuantity);
      } else {
        console.error("Quantity update failed", result.message);
        alert(result.message);
        // 실패 시 원래 수량으로 복원
        setQuantity(item.quantity);
        router.refresh();
      }

      console.groupEnd();
    } catch (error) {
      console.error("CartItem update error", error);
      alert("수량 변경에 실패했습니다.");
      setQuantity(item.quantity);
      router.refresh();
    } finally {
      setIsUpdating(false);
    }
  };

  // 아이템 삭제
  const handleRemove = async () => {
    if (!confirm("장바구니에서 이 상품을 제거하시겠습니까?")) {
      return;
    }

    setIsRemoving(true);

    try {
      console.group("CartItem:handleRemove");
      console.info("cartItemId", item.id);

      const result = await removeCartItem(item.id);

      if (result.success) {
        console.info("Cart item removed successfully");
        router.refresh();
      } else {
        console.error("Cart item remove failed", result.message);
        alert(result.message);
      }

      console.groupEnd();
    } catch (error) {
      console.error("CartItem remove error", error);
      alert("삭제에 실패했습니다.");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-white dark:bg-gray-800">
      {/* 상품 이미지 */}
      <div className="w-full sm:w-24 h-24 relative flex-shrink-0">
        <ProductImage
          imageUrl={product.image_url}
          alt={product.name}
          fill
          className="object-cover rounded-lg"
          sizes="96px"
        />
      </div>

      {/* 상품 정보 */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {product.price.toLocaleString()}원
        </p>

        {/* 수량 조절 */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">수량:</span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleDecrease}
              disabled={quantity <= 1 || isUpdating || isRemoving}
              className="h-8 w-8"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              min={1}
              max={maxQuantity}
              value={quantity}
              onChange={handleQuantityChange}
              disabled={isUpdating || isRemoving}
              className="w-16 text-center h-8"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleIncrease}
              disabled={quantity >= maxQuantity || isUpdating || isRemoving}
              className="h-8 w-8"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            (최대 {maxQuantity}개)
          </span>
        </div>

        {/* 소계 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            소계:
          </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {subtotal.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* 삭제 버튼 */}
      <div className="flex items-start">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          disabled={isRemoving || isUpdating}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

