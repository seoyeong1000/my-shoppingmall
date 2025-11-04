"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getCartItems } from "@/actions/cart/get-items";
import type { CartItemWithProduct } from "@/actions/cart/get-items";

/**
 * 배송 정보 타입
 */
export interface ShippingAddress {
  recipientName: string;
  phone: string;
  postalCode: string;
  address: string;
  detailAddress?: string;
}

/**
 * 주문 생성 요청 타입
 */
export interface CreateOrderRequest {
  shippingAddress: ShippingAddress;
  orderNote?: string;
}

/**
 * 주문 생성 결과 타입
 */
export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  message?: string;
}

/**
 * 주문 생성
 *
 * 장바구니의 모든 아이템을 주문으로 전환합니다.
 * 1. 장바구니 아이템 조회
 * 2. 재고 검증
 * 3. 트랜잭션 처리:
 *    - 주문 생성 (orders 테이블)
 *    - 주문 아이템 생성 (order_items 테이블)
 *    - 재고 차감 (products 테이블)
 *    - 장바구니 비우기 (cart_items 테이블)
 *
 * @param request 주문 생성 요청 (배송 정보, 주문 메모)
 * @returns 주문 생성 결과 (성공 시 orderId 포함)
 */
export async function createOrder(
  request: CreateOrderRequest
): Promise<CreateOrderResult> {
  try {
    console.group("createOrder: 시작");
    console.info("request", request);

    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      console.error("createOrder: 인증 실패");
      console.groupEnd();
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    console.info("createOrder: userId", userId);

    const supabase = createClerkSupabaseClient();

    // 1. 장바구니 아이템 조회
    console.group("createOrder: 장바구니 조회");
    const cartResult = await getCartItems();

    if (!cartResult.success || !cartResult.data) {
      console.error("createOrder: 장바구니 조회 실패", cartResult.message);
      console.groupEnd();
      console.groupEnd();
      return {
        success: false,
        message: cartResult.message || "장바구니를 불러오는 중 오류가 발생했습니다.",
      };
    }

    const cartItems: CartItemWithProduct[] = cartResult.data;

    if (cartItems.length === 0) {
      console.error("createOrder: 장바구니가 비어있음");
      console.groupEnd();
      console.groupEnd();
      return {
        success: false,
        message: "장바구니가 비어있습니다.",
      };
    }

    console.info("createOrder: 장바구니 아이템 개수", cartItems.length);
    console.groupEnd();

    // 2. 재고 검증
    console.group("createOrder: 재고 검증");
    for (const item of cartItems) {
      const product = item.product;

      // 상품 활성화 확인
      if (!product || !product.id) {
        console.error("createOrder: 상품 정보 없음", item);
        console.groupEnd();
        console.groupEnd();
        return {
          success: false,
          message: "상품 정보를 찾을 수 없습니다.",
        };
      }

      // 재고 확인
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("id, name, stock_quantity, is_active, price")
        .eq("id", product.id)
        .single();

      if (productError || !productData) {
        console.error("createOrder: 상품 조회 실패", productError);
        console.groupEnd();
        console.groupEnd();
        return {
          success: false,
          message: `상품 "${product.name}"을(를) 찾을 수 없습니다.`,
        };
      }

      if (!productData.is_active) {
        console.error("createOrder: 비활성화된 상품", productData.name);
        console.groupEnd();
        console.groupEnd();
        return {
          success: false,
          message: `"${productData.name}"은(는) 현재 판매 중이지 않은 상품입니다.`,
        };
      }

      if (productData.stock_quantity < item.quantity) {
        console.error("createOrder: 재고 부족", {
          productName: productData.name,
          requested: item.quantity,
          available: productData.stock_quantity,
        });
        console.groupEnd();
        console.groupEnd();
        return {
          success: false,
          message: `"${productData.name}"의 재고가 부족합니다. (요청: ${item.quantity}개, 재고: ${productData.stock_quantity}개)`,
        };
      }

      console.info("createOrder: 재고 확인 완료", {
        productName: productData.name,
        quantity: item.quantity,
        stock: productData.stock_quantity,
      });
    }
    console.groupEnd();

    // 3. 총 주문 금액 계산
    console.group("createOrder: 총 금액 계산");
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    console.info("createOrder: 총 주문 금액", totalAmount);
    console.groupEnd();

    // 4. 트랜잭션 처리 (순차 실행, 에러 시 중단)
    console.group("createOrder: 트랜잭션 처리");

    // 4-1. 주문 생성
    console.info("createOrder: 주문 생성 시작");
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        clerk_id: userId,
        total_amount: totalAmount,
        status: "pending",
        shipping_address: request.shippingAddress as any,
        order_note: request.orderNote || null,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("createOrder: 주문 생성 실패", orderError);
      console.groupEnd();
      console.groupEnd();
      return {
        success: false,
        message: "주문을 생성하는 중 오류가 발생했습니다.",
      };
    }

    const orderId = order.id;
    console.info("createOrder: 주문 생성 완료", { orderId });

    // 4-2. 주문 아이템 생성 및 재고 차감
    console.info("createOrder: 주문 아이템 생성 시작");
    for (const item of cartItems) {
      const product = item.product;

      // 주문 아이템 생성
      const { error: orderItemError } = await supabase
        .from("order_items")
        .insert({
          order_id: orderId,
          product_id: product.id,
          product_name: product.name,
          quantity: item.quantity,
          price: product.price,
        });

      if (orderItemError) {
        console.error("createOrder: 주문 아이템 생성 실패", {
          productName: product.name,
          error: orderItemError,
        });
        console.groupEnd();
        console.groupEnd();

        // 주문 삭제 (롤백)
        await supabase.from("orders").delete().eq("id", orderId);

        return {
          success: false,
          message: `"${product.name}" 주문 아이템 생성 중 오류가 발생했습니다.`,
        };
      }

      // 재고 차감
      const { error: stockError } = await supabase
        .from("products")
        .update({
          stock_quantity: product.stock_quantity - item.quantity,
        })
        .eq("id", product.id);

      if (stockError) {
        console.error("createOrder: 재고 차감 실패", {
          productName: product.name,
          error: stockError,
        });
        console.groupEnd();
        console.groupEnd();

        // 주문 및 주문 아이템 삭제 (롤백)
        await supabase.from("order_items").delete().eq("order_id", orderId);
        await supabase.from("orders").delete().eq("id", orderId);

        return {
          success: false,
          message: `"${product.name}" 재고 차감 중 오류가 발생했습니다.`,
        };
      }

      console.info("createOrder: 주문 아이템 생성 및 재고 차감 완료", {
        productName: product.name,
        quantity: item.quantity,
      });
    }

    // 4-3. 장바구니 비우기
    console.info("createOrder: 장바구니 비우기 시작");
    const { error: cartDeleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("clerk_id", userId);

    if (cartDeleteError) {
      console.error("createOrder: 장바구니 비우기 실패", cartDeleteError);
      // 주문은 이미 생성되었으므로 경고만 출력 (주문은 유지)
      console.warn("createOrder: 주문은 생성되었으나 장바구니 비우기 실패");
    } else {
      console.info("createOrder: 장바구니 비우기 완료");
    }

    console.groupEnd();

    // 5. 캐시 무효화
    revalidatePath("/cart");
    revalidatePath("/products");
    revalidatePath("/order");

    console.info("createOrder: 주문 생성 완료", {
      orderId,
      totalAmount,
      itemCount: cartItems.length,
    });
    console.groupEnd();

    return {
      success: true,
      orderId,
      message: "주문이 완료되었습니다.",
    };
  } catch (error) {
    console.error("createOrder: 예기치 않은 오류", error);
    return {
      success: false,
      message: "예기치 않은 오류가 발생했습니다.",
    };
  }
}

