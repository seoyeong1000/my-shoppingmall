"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

/**
 * 장바구니에 상품 추가
 * 
 * 같은 상품이 이미 있으면 수량을 증가시킵니다 (UPSERT).
 * 
 * @param productId 추가할 상품 ID
 * @param quantity 추가할 수량 (기본값: 1)
 * @returns 성공 여부와 메시지
 */
export async function addCartItem(
  productId: string,
  quantity: number = 1
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

    // 상품 존재 여부 및 재고 확인
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, stock_quantity, is_active")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      console.error("addCartItem: productError", productError);
      return {
        success: false,
        message: "상품을 찾을 수 없습니다.",
      };
    }

    if (!product.is_active) {
      return {
        success: false,
        message: "현재 판매 중이지 않은 상품입니다.",
      };
    }

    // 기존 장바구니 아이템 조회 (수량 확인용)
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("clerk_id", userId)
      .eq("product_id", productId)
      .single();

    const currentQuantity = existingItem?.quantity ?? 0;
    const newQuantity = currentQuantity + quantity;

    // 재고 확인
    if (newQuantity > product.stock_quantity) {
      return {
        success: false,
        message: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개, 장바구니: ${currentQuantity}개)`,
      };
    }

    // UPSERT: 같은 상품이 있으면 수량 증가, 없으면 새로 추가
    console.group("addCartItem: UPSERT");
    console.info("userId", userId);
    console.info("productId", productId);
    console.info("currentQuantity", currentQuantity);
    console.info("newQuantity", newQuantity);

    const { error: upsertError } = await supabase
      .from("cart_items")
      .upsert(
        {
          clerk_id: userId,
          product_id: productId,
          quantity: newQuantity,
        },
        {
          onConflict: "clerk_id,product_id",
        }
      );

    if (upsertError) {
      console.error("addCartItem: upsertError", upsertError);
      console.groupEnd();
      return {
        success: false,
        message: "장바구니에 추가하는 중 오류가 발생했습니다.",
      };
    }

    console.info("addCartItem: 성공", {
      isNewItem: currentQuantity === 0,
      previousQuantity: currentQuantity,
      newQuantity: newQuantity,
    });
    console.groupEnd();

    // 캐시 무효화
    revalidatePath("/cart");
    revalidatePath("/products");

    return {
      success: true,
      message: "장바구니에 추가되었습니다.",
    };
  } catch (error) {
    console.error("addCartItem: unexpected error", error);
    return {
      success: false,
      message: "예기치 않은 오류가 발생했습니다.",
    };
  }
}

