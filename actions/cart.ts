"use server";

/**
 * @file actions/cart.ts
 * @description 장바구니 관련 Server Actions
 *
 * Clerk + Supabase를 사용하여 장바구니 CRUD 기능을 제공합니다.
 * 모든 함수는 인증된 사용자만 접근 가능하며, clerk_id로 사용자를 식별합니다.
 *
 * 주요 기능:
 * 1. addToCart: 장바구니에 상품 추가 (UPSERT)
 * 2. getCartItems: 현재 사용자의 장바구니 조회
 * 3. updateCartItem: 장바구니 아이템 수량 변경
 * 4. removeCartItem: 장바구니 아이템 삭제
 * 5. clearCart: 장바구니 전체 비우기
 *
 * @dependencies
 * - @/lib/supabase/server: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { CartItemWithProduct, CartSummary } from "@/types/cart";

/**
 * 장바구니에 상품을 추가합니다.
 * 이미 존재하는 경우 수량을 증가시킵니다.
 *
 * @param productId 상품 ID
 * @param quantity 추가할 수량
 * @returns 성공 여부와 메시지
 */
export async function addToCart(
  productId: string,
  quantity: number
): Promise<{ success: boolean; message: string }> {
  try {
    console.group("addToCart:Start");
    console.info("productId", productId);
    console.info("quantity", quantity);

    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.error("Unauthorized: No userId");
      console.groupEnd();
      return { success: false, message: "로그인이 필요합니다." };
    }

    console.info("userId", userId);

    const supabase = createClerkSupabaseClient();

    // 상품 정보 조회 (재고 확인용)
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, stock_quantity, is_active")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      console.error("productError", productError?.message);
      console.groupEnd();
      return { success: false, message: "상품을 찾을 수 없습니다." };
    }

    if (!product.is_active) {
      console.error("Product is not active");
      console.groupEnd();
      return { success: false, message: "판매 중인 상품이 아닙니다." };
    }

    // 재고 확인
    if (product.stock_quantity < quantity) {
      console.error("Insufficient stock", {
        requested: quantity,
        available: product.stock_quantity,
      });
      console.groupEnd();
      return {
        success: false,
        message: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개)`,
      };
    }

    // 기존 장바구니 아이템 확인
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("clerk_id", userId)
      .eq("product_id", productId)
      .single();

    if (existingItem) {
      // 이미 존재하는 경우 수량 증가
      const newQuantity = existingItem.quantity + quantity;

      // 재고 확인
      if (product.stock_quantity < newQuantity) {
        console.error("Insufficient stock after adding", {
          requested: newQuantity,
          available: product.stock_quantity,
        });
        console.groupEnd();
        return {
          success: false,
          message: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개, 장바구니 수량: ${existingItem.quantity}개)`,
        };
      }

      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existingItem.id);

      if (updateError) {
        console.error("updateError", updateError.message);
        console.groupEnd();
        return { success: false, message: "장바구니 업데이트에 실패했습니다." };
      }

      console.info("Cart item updated", {
        cartItemId: existingItem.id,
        newQuantity,
      });
      console.groupEnd();

      // 페이지 캐시 무효화
      revalidatePath("/cart");
      revalidatePath("/");

      return { success: true, message: "장바구니에 추가되었습니다." };
    } else {
      // 새로 추가
      const { error: insertError } = await supabase.from("cart_items").insert({
        clerk_id: userId,
        product_id: productId,
        quantity,
      });

      if (insertError) {
        console.error("insertError", insertError.message);
        console.groupEnd();
        return { success: false, message: "장바구니 추가에 실패했습니다." };
      }

      console.info("Cart item added", { productId, quantity });
      console.groupEnd();

      // 페이지 캐시 무효화
      revalidatePath("/cart");
      revalidatePath("/");

      return { success: true, message: "장바구니에 추가되었습니다." };
    }
  } catch (error) {
    console.error("addToCart error", error);
    console.groupEnd();
    return { success: false, message: "오류가 발생했습니다." };
  }
}

/**
 * 현재 사용자의 장바구니 아이템을 조회합니다.
 *
 * @returns 장바구니 아이템 목록 (상품 정보 포함)
 */
export async function getCartItems(): Promise<CartItemWithProduct[]> {
  try {
    console.group("getCartItems:Start");

    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.warn("Unauthorized: No userId");
      console.groupEnd();
      return [];
    }

    console.info("userId", userId);

    const supabase = createClerkSupabaseClient();

    // 장바구니 아이템 조회 (상품 정보 JOIN)
    // 주의: image_url 컬럼이 데이터베이스에 없을 수 있으므로 일단 제외
    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        clerk_id,
        product_id,
        quantity,
        created_at,
        updated_at,
        products (
          id,
          name,
          description,
          price,
          category,
          stock_quantity,
          is_active
        )
      `
      )
      .eq("clerk_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getCartItems error", error.message);
      console.groupEnd();
      return [];
    }

    // 타입 변환 (Supabase JOIN 결과를 타입에 맞게 변환)
    const items: CartItemWithProduct[] = (cartItems || []).map((item: any) => ({
      id: item.id,
      clerk_id: item.clerk_id,
      product_id: item.product_id,
      quantity: item.quantity,
      created_at: item.created_at,
      updated_at: item.updated_at,
      product: item.products,
    }));

    console.info("cartItems count", items.length);
    console.groupEnd();

    return items;
  } catch (error) {
    console.error("getCartItems error", error);
    console.groupEnd();
    return [];
  }
}

/**
 * 장바구니 아이템의 수량을 변경합니다.
 *
 * @param cartItemId 장바구니 아이템 ID
 * @param quantity 새로운 수량
 * @returns 성공 여부와 메시지
 */
export async function updateCartItem(
  cartItemId: string,
  quantity: number
): Promise<{ success: boolean; message: string }> {
  try {
    console.group("updateCartItem:Start");
    console.info("cartItemId", cartItemId);
    console.info("quantity", quantity);

    // 수량 검증
    if (quantity < 1) {
      console.error("Invalid quantity", quantity);
      console.groupEnd();
      return { success: false, message: "수량은 1개 이상이어야 합니다." };
    }

    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.error("Unauthorized: No userId");
      console.groupEnd();
      return { success: false, message: "로그인이 필요합니다." };
    }

    const supabase = createClerkSupabaseClient();

    // 장바구니 아이템 및 상품 정보 조회
    const { data: cartItem, error: cartItemError } = await supabase
      .from("cart_items")
      .select("id, product_id, clerk_id")
      .eq("id", cartItemId)
      .eq("clerk_id", userId)
      .single();

    if (cartItemError || !cartItem) {
      console.error("cartItemError", cartItemError?.message);
      console.groupEnd();
      return { success: false, message: "장바구니 아이템을 찾을 수 없습니다." };
    }

    // 상품 재고 확인
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", cartItem.product_id)
      .single();

    if (productError || !product) {
      console.error("productError", productError?.message);
      console.groupEnd();
      return { success: false, message: "상품을 찾을 수 없습니다." };
    }

    // 재고 확인
    if (product.stock_quantity < quantity) {
      console.error("Insufficient stock", {
        requested: quantity,
        available: product.stock_quantity,
      });
      console.groupEnd();
      return {
        success: false,
        message: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개)`,
      };
    }

    // 수량 업데이트
    const { error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId);

    if (updateError) {
      console.error("updateError", updateError.message);
      console.groupEnd();
      return { success: false, message: "수량 변경에 실패했습니다." };
    }

    console.info("Cart item updated", { cartItemId, quantity });
    console.groupEnd();

    // 페이지 캐시 무효화
    revalidatePath("/cart");

    return { success: true, message: "수량이 변경되었습니다." };
  } catch (error) {
    console.error("updateCartItem error", error);
    console.groupEnd();
    return { success: false, message: "오류가 발생했습니다." };
  }
}

/**
 * 장바구니 아이템을 삭제합니다.
 *
 * @param cartItemId 장바구니 아이템 ID
 * @returns 성공 여부와 메시지
 */
export async function removeCartItem(
  cartItemId: string
): Promise<{ success: boolean; message: string }> {
  try {
    console.group("removeCartItem:Start");
    console.info("cartItemId", cartItemId);

    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.error("Unauthorized: No userId");
      console.groupEnd();
      return { success: false, message: "로그인이 필요합니다." };
    }

    const supabase = createClerkSupabaseClient();

    // 장바구니 아이템 삭제 (본인 것만 삭제 가능)
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId)
      .eq("clerk_id", userId);

    if (error) {
      console.error("removeCartItem error", error.message);
      console.groupEnd();
      return { success: false, message: "장바구니 아이템 삭제에 실패했습니다." };
    }

    console.info("Cart item removed", { cartItemId });
    console.groupEnd();

    // 페이지 캐시 무효화
    revalidatePath("/cart");

    return { success: true, message: "장바구니에서 제거되었습니다." };
  } catch (error) {
    console.error("removeCartItem error", error);
    console.groupEnd();
    return { success: false, message: "오류가 발생했습니다." };
  }
}

/**
 * 현재 사용자의 장바구니를 모두 비웁니다.
 *
 * @returns 성공 여부와 메시지
 */
export async function clearCart(): Promise<{ success: boolean; message: string }> {
  try {
    console.group("clearCart:Start");

    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.error("Unauthorized: No userId");
      console.groupEnd();
      return { success: false, message: "로그인이 필요합니다." };
    }

    console.info("userId", userId);

    const supabase = createClerkSupabaseClient();

    // 모든 장바구니 아이템 삭제
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("clerk_id", userId);

    if (error) {
      console.error("clearCart error", error.message);
      console.groupEnd();
      return { success: false, message: "장바구니 비우기에 실패했습니다." };
    }

    console.info("Cart cleared");
    console.groupEnd();

    // 페이지 캐시 무효화
    revalidatePath("/cart");

    return { success: true, message: "장바구니가 비워졌습니다." };
  } catch (error) {
    console.error("clearCart error", error);
    console.groupEnd();
    return { success: false, message: "오류가 발생했습니다." };
  }
}

/**
 * 장바구니 요약 정보를 계산합니다.
 *
 * @returns 장바구니 요약 정보
 */
export async function getCartSummary(): Promise<CartSummary> {
  try {
    const cartItems = await getCartItems();

    const totalItems = cartItems.length;
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    return {
      totalItems,
      totalQuantity,
      totalAmount,
    };
  } catch (error) {
    console.error("getCartSummary error", error);
    return {
      totalItems: 0,
      totalQuantity: 0,
      totalAmount: 0,
    };
  }
}

