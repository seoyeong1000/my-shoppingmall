"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

/**
 * 장바구니 아이템 수량 변경
 * 
 * @param cartItemId 변경할 장바구니 아이템 ID
 * @param quantity 새로운 수량 (1 이상)
 * @returns 성공 여부와 메시지
 */
export async function updateCartQuantity(
  cartItemId: string,
  quantity: number
): Promise<{ success: boolean; message: string }> {
  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    // 수량 유효성 검사
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return {
        success: false,
        message: "수량은 1개 이상의 정수여야 합니다.",
      };
    }

    const supabase = createClerkSupabaseClient();

    // 장바구니 아이템 조회 (본인 것인지 확인 + 재고 확인)
    const { data: cartItem, error: cartItemError } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        clerk_id,
        product_id,
        quantity,
        products:product_id (
          id,
          stock_quantity
        )
      `
      )
      .eq("id", cartItemId)
      .single();

    if (cartItemError || !cartItem) {
      console.error("updateCartQuantity: cartItemError", cartItemError);
      return {
        success: false,
        message: "장바구니 아이템을 찾을 수 없습니다.",
      };
    }

    // 본인 장바구니인지 확인
    if (cartItem.clerk_id !== userId) {
      return {
        success: false,
        message: "권한이 없습니다.",
      };
    }

    // 상품 정보 추출
    const product = Array.isArray(cartItem.products)
      ? cartItem.products[0]
      : cartItem.products;

    if (!product) {
      return {
        success: false,
        message: "상품 정보를 찾을 수 없습니다.",
      };
    }

    // 재고 확인
    if (quantity > product.stock_quantity) {
      return {
        success: false,
        message: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개)`,
      };
    }

    // 수량 업데이트
    const { error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId)
      .eq("clerk_id", userId);

    if (updateError) {
      console.error("updateCartQuantity: updateError", updateError);
      return {
        success: false,
        message: "수량을 변경하는 중 오류가 발생했습니다.",
      };
    }

    // 캐시 무효화
    revalidatePath("/cart");
    revalidatePath("/products");

    return {
      success: true,
      message: "수량이 변경되었습니다.",
    };
  } catch (error) {
    console.error("updateCartQuantity: unexpected error", error);
    return {
      success: false,
      message: "예기치 않은 오류가 발생했습니다.",
    };
  }
}

