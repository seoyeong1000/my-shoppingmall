"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

/**
 * 현재 사용자의 장바구니 총 수량 조회
 * 
 * Navbar에서 빠르게 장바구니 총 수량을 표시하기 위해 사용됩니다.
 * 모든 장바구니 아이템의 quantity 합계를 반환합니다.
 * 
 * @returns 장바구니 총 수량 (예: 상품 A 2개 + 상품 B 3개 = 5개)
 */
export async function getCartCount(): Promise<number> {
  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      console.log("[getCartCount] 로그인되지 않은 사용자");
      return 0;
    }

    const supabase = createClerkSupabaseClient();

    // 장바구니 아이템의 quantity 값들 조회
    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("clerk_id", userId);

    if (error) {
      console.error("[getCartCount] 에러 발생:", {
        userId,
        error: error.message,
      });
      return 0;
    }

    // quantity 합계 계산
    const totalQuantity =
      cartItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) ?? 0;

    console.log("[getCartCount] 조회 완료:", {
      userId,
      itemCount: cartItems?.length ?? 0,
      totalQuantity,
    });

    return totalQuantity;
  } catch (error) {
    console.error("[getCartCount] 예기치 않은 에러:", error);
    return 0;
  }
}

