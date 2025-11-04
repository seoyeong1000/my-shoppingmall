"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

/**
 * 장바구니 아이템 타입 (상품 정보 포함)
 */
export interface CartItemWithProduct {
  id: string;
  quantity: number;
  created_at: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    stock_quantity: number;
  };
}

/**
 * 현재 사용자의 장바구니 아이템 조회 (상품 정보 포함)
 *
 * @returns 장바구니 아이템 배열 (상품 정보 포함)
 */
export async function getCartItems(): Promise<{
  success: boolean;
  data: CartItemWithProduct[] | null;
  message?: string;
}> {
  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        data: null,
        message: "로그인이 필요합니다.",
      };
    }

    const supabase = createClerkSupabaseClient();

    // 장바구니 아이템 조회 (상품 정보 JOIN)
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        quantity,
        created_at,
        products:product_id (
          id,
          name,
          price,
          stock_quantity
        )
      `,
      )
      .eq("clerk_id", userId)
      .order("created_at", { ascending: false });

    if (cartError) {
      console.error("getCartItems: cartError", cartError);
      return {
        success: false,
        data: null,
        message: "장바구니를 불러오는 중 오류가 발생했습니다.",
      };
    }

    // 타입 변환 (Supabase의 JOIN 결과를 우리 타입으로 변환)
    const items: CartItemWithProduct[] =
      cartItems?.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        created_at: item.created_at,
        product: Array.isArray(item.products)
          ? item.products[0]
          : item.products,
      })) ?? [];

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    console.error("getCartItems: unexpected error", error);
    return {
      success: false,
      data: null,
      message: "예기치 않은 오류가 발생했습니다.",
    };
  }
}
