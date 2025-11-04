"use server";

import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { getCartItems } from "@/actions/cart/get-items";
import type { CreateOrderRequest, ShippingAddress } from "@/actions/order/create-order";

const CHECKOUT_SESSION_COOKIE = "checkout_session";
const CHECKOUT_SESSION_TTL_SECONDS = 60 * 10; // 10분

export interface CheckoutSessionData {
  orderId: string;
  orderName: string;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  orderNote: string | null;
  cartItemCount: number;
  createdAt: string;
}

export interface SaveCheckoutSessionInput extends Pick<CreateOrderRequest, "shippingAddress" | "orderNote"> {}

export interface SaveCheckoutSessionResult {
  success: boolean;
  orderId?: string;
  orderName?: string;
  amount?: number;
  message?: string;
}

export async function saveCheckoutSession(
  input: SaveCheckoutSessionInput
): Promise<SaveCheckoutSessionResult> {
  console.group("saveCheckoutSession: 시작");
  console.info("payload", {
    hasOrderNote: Boolean(input.orderNote),
  });

  try {
    const { userId } = await auth();

    if (!userId) {
      console.error("saveCheckoutSession: 인증 실패");
      console.groupEnd();
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    const cartResult = await getCartItems();

    if (!cartResult.success || !cartResult.data || cartResult.data.length === 0) {
      console.error("saveCheckoutSession: 장바구니 비어있음");
      console.groupEnd();
      return {
        success: false,
        message: cartResult.message || "장바구니가 비어있습니다.",
      };
    }

    const cartItems = cartResult.data;

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const firstProductName = cartItems[0]?.product.name ?? "상품";
    const orderName =
      cartItems.length > 1
        ? `${firstProductName} 외 ${cartItems.length - 1}건`
        : firstProductName;

    const orderId = `order_${crypto.randomUUID()}`;

    const checkoutSession: CheckoutSessionData = {
      orderId,
      orderName,
      totalAmount,
      shippingAddress: input.shippingAddress,
      orderNote: input.orderNote ?? null,
      cartItemCount: cartItems.length,
      createdAt: new Date().toISOString(),
    };

    const cookieStore = await cookies();
    cookieStore.set(CHECKOUT_SESSION_COOKIE, JSON.stringify(checkoutSession), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: CHECKOUT_SESSION_TTL_SECONDS,
      path: "/",
    });

    console.info("saveCheckoutSession: 세션 저장 완료", {
      orderId,
      totalAmount,
      cartItemCount: cartItems.length,
    });
    console.groupEnd();

    return {
      success: true,
      orderId,
      orderName,
      amount: totalAmount,
    };
  } catch (error) {
    console.error("saveCheckoutSession: 예기치 않은 오류", error);
    console.groupEnd();
    return {
      success: false,
      message: "결제 세션을 생성하는 중 오류가 발생했습니다.",
    };
  }
}

export async function getCheckoutSession(): Promise<CheckoutSessionData | null> {
  const cookieStore = await cookies();
  const rawValue = cookieStore.get(CHECKOUT_SESSION_COOKIE)?.value;

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as CheckoutSessionData;
  } catch (error) {
    console.error("getCheckoutSession: JSON 파싱 실패", error);
    return null;
  }
}

export async function clearCheckoutSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CHECKOUT_SESSION_COOKIE);
}

