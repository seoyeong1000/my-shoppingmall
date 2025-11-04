import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PaymentFailPageProps {
  searchParams: Promise<{
    code?: string;
    message?: string;
    orderId?: string;
  }>;
}

export default async function PaymentFailPage({ searchParams }: PaymentFailPageProps) {
  console.group("payment-fail-page: 렌더링");
  const resolvedSearchParams = await searchParams;
  console.error("failParams", resolvedSearchParams);
  console.groupEnd();

  const errorCode = resolvedSearchParams.code;
  const errorMessage = resolvedSearchParams.message;

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 sm:px-8 py-12 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 border rounded-xl shadow-lg p-8 space-y-6 text-center">
        <h1 className="text-2xl font-bold text-red-500">결제가 완료되지 않았습니다.</h1>
        <p className="text-gray-600 dark:text-gray-300">
          {errorMessage || "결제 과정에서 오류가 발생했습니다. 다시 시도해주세요."}
        </p>
        {errorCode && (
          <p className="text-sm text-gray-500">오류 코드: {errorCode}</p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/checkout">다시 시도하기</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products">상품 목록으로 이동</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

