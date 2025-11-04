"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { ShippingAddress } from "./create-order";

/**
 * 주문 아이템 타입
 */
export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
  image_url?: string | null;
}

/**
 * 주문 정보 타입
 */
export interface Order {
  id: string;
  clerk_id: string;
  total_amount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shipping_address: ShippingAddress;
  order_note: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

/**
 * 주문 조회 결과 타입
 */
export interface GetOrderResult {
  success: boolean;
  data: Order | null;
  message?: string;
}

/**
 * 주문 정보 조회
 *
 * 주문 ID로 주문 정보를 조회합니다. 본인의 주문만 조회 가능합니다.
 *
 * @param orderId 주문 ID
 * @returns 주문 정보 (주문 아이템 포함)
 */
export async function getOrder(orderId: string): Promise<GetOrderResult> {
  try {
    console.group("getOrder: 시작");
    console.info("orderId", orderId);

    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      console.error("getOrder: 인증 실패");
      console.groupEnd();
      return {
        success: false,
        data: null,
        message: "로그인이 필요합니다.",
      };
    }

    console.info("getOrder: userId", userId);

    const supabase = createClerkSupabaseClient();

    // 주문 정보 조회
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("getOrder: 주문 조회 실패", orderError);
      console.groupEnd();
      return {
        success: false,
        data: null,
        message: "주문을 찾을 수 없습니다.",
      };
    }

    // 본인 주문인지 확인
    if (order.clerk_id !== userId) {
      console.error("getOrder: 권한 없음", {
        orderClerkId: order.clerk_id,
        userId,
      });
      console.groupEnd();
      return {
        success: false,
        data: null,
        message: "권한이 없습니다.",
      };
    }

    // 주문 아이템 조회
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (itemsError) {
      console.error("getOrder: 주문 아이템 조회 실패", itemsError);
      console.groupEnd();
      return {
        success: false,
        data: null,
        message: "주문 아이템을 불러오는 중 오류가 발생했습니다.",
      };
    }

    console.info("getOrder: 주문 조회 성공", {
      orderId,
      itemCount: orderItems?.length || 0,
    });
    console.groupEnd();

    // 주문 아이템별 상품 이미지 조회
    const itemsWithImages = await Promise.all(
      (orderItems || []).map(async (item: any) => {
        // 상품 이미지 조회
        const { data: product } = await supabase
          .from("products")
          .select("image_url")
          .eq("id", item.product_id)
          .single();

        return {
          id: item.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: Number(item.price),
          created_at: item.created_at,
          image_url: product?.image_url || null,
        };
      })
    );

    // 타입 변환
    const orderData: Order = {
      id: order.id,
      clerk_id: order.clerk_id,
      total_amount: Number(order.total_amount),
      status: order.status as Order["status"],
      shipping_address: order.shipping_address as ShippingAddress,
      order_note: order.order_note,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: itemsWithImages,
    };

    return {
      success: true,
      data: orderData,
    };
  } catch (error) {
    console.error("getOrder: 예기치 않은 오류", error);
    return {
      success: false,
      data: null,
      message: "예기치 않은 오류가 발생했습니다.",
    };
  }
}

