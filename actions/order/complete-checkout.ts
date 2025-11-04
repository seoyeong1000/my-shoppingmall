"use server";

import { createOrder } from "@/actions/order/create-order";
import {
  clearCheckoutSession,
  getCheckoutSession,
} from "@/actions/order/save-checkout-session";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

interface CompleteCheckoutParams {
  paymentKey?: string;
  orderId?: string;
  amount?: string | number;
}

export interface CompleteCheckoutResult {
  success: boolean;
  orderId?: string;
  message?: string;
  failureCode?: string;
}

interface TossPaymentResponse {
  paymentKey: string;
  orderId: string;
  status: string;
  totalAmount: number;
}

interface TossErrorResponse {
  code?: string;
  message?: string;
}

export async function completeCheckout(
  params: CompleteCheckoutParams
): Promise<CompleteCheckoutResult> {
  console.group("completeCheckout: 시작");
  console.info("params", {
    hasPaymentKey: Boolean(params.paymentKey),
    orderId: params.orderId,
    amount: params.amount,
  });

  const session = await getCheckoutSession();

  if (!session) {
    console.error("completeCheckout: 결제 세션이 존재하지 않습니다.");
    console.groupEnd();
    return {
      success: false,
      message: "결제 정보를 다시 불러오지 못했습니다. 처음부터 다시 시도해주세요.",
    };
  }

  try {
    if (!params.paymentKey || !params.orderId || params.amount === undefined) {
      console.error("completeCheckout: 리다이렉트 파라미터 누락", params);
      return {
        success: false,
        message: "결제 결과 파라미터가 올바르지 않습니다.",
      };
    }

    const amountNumber =
      typeof params.amount === "string"
        ? Number(params.amount)
        : params.amount;

    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      console.error("completeCheckout: 금액 파싱 실패", params.amount);
      return {
        success: false,
        message: "결제 금액 정보가 유효하지 않습니다.",
      };
    }

    if (session.orderId !== params.orderId) {
      console.error("completeCheckout: orderId 불일치", {
        sessionOrderId: session.orderId,
        redirectOrderId: params.orderId,
      });
      return {
        success: false,
        message: "주문 식별자가 일치하지 않습니다.",
      };
    }

    if (session.totalAmount !== amountNumber) {
      console.error("completeCheckout: 금액 불일치", {
        sessionAmount: session.totalAmount,
        redirectAmount: amountNumber,
      });
      return {
        success: false,
        message: "결제 금액이 변경되었습니다. 다시 시도해주세요.",
      };
    }

    const confirmation = await confirmPaymentWithToss({
      paymentKey: params.paymentKey,
      orderId: params.orderId,
      amount: amountNumber,
    });

    console.info("completeCheckout: 결제 승인 성공", {
      paymentKey: confirmation.paymentKey,
      status: confirmation.status,
    });

    const orderResult = await createOrder({
      shippingAddress: session.shippingAddress,
      orderNote: session.orderNote || undefined,
    });

    if (!orderResult.success || !orderResult.orderId) {
      console.error("completeCheckout: 주문 생성 실패", orderResult.message);
      return {
        success: false,
        message:
          "결제는 승인되었지만 주문 생성에 실패했습니다. 고객센터로 문의해주세요.",
      };
    }

    const supabase = createClerkSupabaseClient();
    const { error: statusError } = await supabase
      .from("orders")
      .update({ status: "confirmed" })
      .eq("id", orderResult.orderId);

    if (statusError) {
      console.error("completeCheckout: 주문 상태 업데이트 실패", statusError);
      return {
        success: false,
        message:
          "주문 상태를 갱신하는 중 오류가 발생했습니다. 결제는 승인되었으므로 관리자에게 문의해주세요.",
      };
    }

    await clearCheckoutSession();

    return {
      success: true,
      orderId: orderResult.orderId,
    };
  } catch (error) {
    if (error instanceof TossConfirmError) {
      console.error("completeCheckout: Toss 결제 승인 실패", {
        code: error.code,
        message: error.message,
      });
      return {
        success: false,
        message: error.message,
        failureCode: error.code,
      };
    }

    console.error("completeCheckout: 예기치 않은 오류", error);
    return {
      success: false,
      message: "결제를 완료하는 중 오류가 발생했습니다.",
    };
  } finally {
    console.groupEnd();
  }
}

async function confirmPaymentWithToss(params: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): Promise<TossPaymentResponse> {
  console.group("confirmPaymentWithToss: 시작");
  console.info("request", params);

  const secretKey = process.env.TOSS_SECRET_KEY;

  if (!secretKey) {
    console.error("confirmPaymentWithToss: 시크릿 키 미설정");
    console.groupEnd();
    throw new TossConfirmError({
      code: "MISSING_SECRET_KEY",
      message: "TOSS 시크릿 키가 설정되지 않았습니다.",
    });
  }

  const authKey = Buffer.from(`${secretKey}:`).toString("base64");

  const response = await fetch(
    "https://api.tosspayments.com/v1/payments/confirm",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${authKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
      cache: "no-store",
    }
  );

  const data = (await response.json()) as TossPaymentResponse | TossErrorResponse;

  if (!response.ok) {
    console.error("confirmPaymentWithToss: 실패", data);
    console.groupEnd();
    throw new TossConfirmError({
      code: (data as TossErrorResponse).code ?? "PAYMENT_CONFIRM_FAILED",
      message:
        (data as TossErrorResponse).message ?? "결제 승인에 실패했습니다.",
    });
  }

  console.info("confirmPaymentWithToss: 성공", data);
  console.groupEnd();
  return data as TossPaymentResponse;
}

class TossConfirmError extends Error {
  public code: string;

  constructor(payload: { code: string; message: string }) {
    super(payload.message);
    this.code = payload.code;
  }
}

