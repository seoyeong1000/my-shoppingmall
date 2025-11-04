import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  completeCheckout,
  type CompleteCheckoutResult,
} from "@/actions/order/complete-checkout";

interface PaymentSuccessPageProps {
  searchParams: Promise<{
    paymentKey?: string;
    orderId?: string;
    amount?: string;
  }>;
}

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  console.group("payment-success-page: 렌더링");
  const resolvedSearchParams = await searchParams;
  console.info("searchParams", resolvedSearchParams);

  const result: CompleteCheckoutResult = await completeCheckout({
    paymentKey: resolvedSearchParams.paymentKey,
    orderId: resolvedSearchParams.orderId,
    amount: resolvedSearchParams.amount,
  });

  console.groupEnd();

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 sm:px-8 py-12 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 border rounded-xl shadow-lg p-8 space-y-6 text-center">
        {result.success ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              결제가 완료되었습니다.
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              주문이 정상적으로 접수되었습니다. 주문 내역에서 자세한 정보를 확인할 수 있습니다.
            </p>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>주문 번호</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {result.orderId}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              {result.orderId && (
                <Button asChild>
                  <Link href={`/order/${result.orderId}`}>주문 상세 보기</Link>
                </Button>
              )}
              <Button asChild variant="outline">
                <Link href="/products">계속 쇼핑하기</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-red-500">결제 완료 처리에 실패했습니다.</h1>
            <p className="text-gray-600 dark:text-gray-300">
              {result.message ?? "결제 승인 결과를 확인하지 못했습니다. 다시 시도하시거나 고객센터에 문의해주세요."}
            </p>
            {result.failureCode && (
              <p className="text-sm text-gray-500">오류 코드: {result.failureCode}</p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/checkout">다시 시도하기</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/products">상품 목록으로 이동</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

