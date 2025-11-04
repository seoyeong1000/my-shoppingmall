"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

/**
 * 장바구니 아이템 삭제
 * 
 * @param cartItemId 삭제할 장바구니 아이템 ID
 * @returns 성공 여부와 메시지
 */
export async function removeCartItem(
  cartItemId: string
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

    const supabase = createClerkSupabaseClient();

    // 장바구니 아이템 조회 (본인 것인지 확인)
    const { data: cartItem, error: cartItemError } = await supabase
      .from("cart_items")
      .select("id, clerk_id")
      .eq("id", cartItemId)
      .single();

    if (cartItemError || !cartItem) {
      console.error("removeCartItem: cartItemError", cartItemError);
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

    // 삭제
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId)
      .eq("clerk_id", userId);

    if (deleteError) {
      console.error("removeCartItem: deleteError", deleteError);
      return {
        success: false,
        message: "장바구니 아이템을 삭제하는 중 오류가 발생했습니다.",
      };
    }

    // 캐시 무효화
    revalidatePath("/cart");
    revalidatePath("/products");

    return {
      success: true,
      message: "장바구니에서 제거되었습니다.",
    };
  } catch (error) {
    console.error("removeCartItem: unexpected error", error);
    return {
      success: false,
      message: "예기치 않은 오류가 발생했습니다.",
    };
  }
}

