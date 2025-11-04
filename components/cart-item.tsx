"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductImage from "@/components/product-image";
import { updateCartQuantity } from "@/actions/cart/update-quantity";
import { removeCartItem } from "@/actions/cart/remove-item";
import type { CartItemWithProduct } from "@/actions/cart/get-items";

interface CartItemProps {
  item: CartItemWithProduct;
}

/**
 * 장바구니 아이템 컴포넌트
 * 
 * 상품 이미지, 이름, 단가, 수량 조절, 삭제 기능을 제공합니다.
 */
export default function CartItem({ item }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.product.stock_quantity) {
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateCartQuantity(item.id, newQuantity);
      if (result.success) {
        setQuantity(newQuantity);
      } else {
        alert(result.message);
        setQuantity(item.quantity); // 원래 값으로 복원
      }
    } catch (error) {
      console.error("CartItem: updateQuantity error", error);
      alert("수량을 변경하는 중 오류가 발생했습니다.");
      setQuantity(item.quantity); // 원래 값으로 복원
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("장바구니에서 이 상품을 제거하시겠습니까?")) {
      return;
    }

    setIsRemoving(true);
    try {
      const result = await removeCartItem(item.id);
      if (!result.success) {
        alert(result.message);
      }
      // 성공 시 페이지가 자동으로 리렌더링됨 (revalidatePath)
    } catch (error) {
      console.error("CartItem: removeItem error", error);
      alert("상품을 제거하는 중 오류가 발생했습니다.");
    } finally {
      setIsRemoving(false);
    }
  };

  const totalPrice = item.product.price * quantity;
  const maxQuantity = item.product.stock_quantity;

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-white dark:bg-gray-800">
      {/* 상품 이미지 */}
      <Link
        href={`/products/${item.product.id}`}
        className="flex-shrink-0 w-full sm:w-24 h-24 relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700"
      >
        <ProductImage
          imageUrl={item.product.image_url}
          alt={item.product.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </Link>

      {/* 상품 정보 및 수량 조절 */}
      <div className="flex-1 flex flex-col sm:flex-row gap-4">
        {/* 상품 이름 및 가격 */}
        <div className="flex-1">
          <Link
            href={`/products/${item.product.id}`}
            className="block mb-2 hover:underline"
          >
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {item.product.name}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            단가: {item.product.price.toLocaleString()}원
          </p>
          {maxQuantity < quantity && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">
              재고 부족: 최대 {maxQuantity}개까지 구매 가능
            </p>
          )}
        </div>

        {/* 수량 조절 및 삭제 */}
        <div className="flex items-center gap-4">
          {/* 수량 조절 */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium">
              {isUpdating ? "..." : quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdating || quantity >= maxQuantity}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* 총액 */}
          <div className="text-right min-w-[100px]">
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {totalPrice.toLocaleString()}원
            </p>
          </div>

          {/* 삭제 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={handleRemove}
            disabled={isRemoving}
            aria-label="장바구니에서 제거"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

