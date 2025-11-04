"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

/**
 * 현재 사용자의 장바구니 아이템 개수 조회
 * 
 * Navbar에서 빠르게 장바구니 개수를 표시하기 위해 사용됩니다.
 * 
 * @returns 장바구니 아이템 개수
 */
export async function getCartCount(): Promise<number> {
  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return 0;
    }

    const supabase = createClerkSupabaseClient();

    // 장바구니 아이템 개수 조회
    const { count, error } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("clerk_id", userId);

    if (error) {
      console.error("getCartCount: error", error);
      return 0;
    }

    return count ?? 0;
  } catch (error) {
    console.error("getCartCount: unexpected error", error);
    return 0;
  }
}

