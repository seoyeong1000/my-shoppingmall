"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

/**
 * 장바구니 전체 삭제
 * 
 * 현재 사용자의 모든 장바구니 아이템을 삭제합니다.
 * 
 * @returns 성공 여부와 메시지
 */
export async function clearAllCartItems(): Promise<{
  success: boolean;
  message: string;
}> {
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

    // 현재 사용자의 모든 장바구니 아이템 삭제
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("clerk_id", userId);

    if (deleteError) {
      console.error("clearAllCartItems: deleteError", deleteError);
      return {
        success: false,
        message: "장바구니를 비우는 중 오류가 발생했습니다.",
      };
    }

    // 캐시 무효화
    revalidatePath("/cart");
    revalidatePath("/products");

    console.group("clearAllCartItems");
    console.info("Successfully cleared all cart items for user", userId);
    console.groupEnd();

    return {
      success: true,
      message: "장바구니가 비워졌습니다.",
    };
  } catch (error) {
    console.error("clearAllCartItems: unexpected error", error);
    return {
      success: false,
      message: "예기치 않은 오류가 발생했습니다.",
    };
  }
}

