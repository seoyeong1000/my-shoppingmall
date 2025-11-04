/**
 * @file app/order/[id]/page.tsx
 * @description 주문 완료 페이지
 *
 * 주문 완료 후 주문 정보를 표시합니다.
 *
 * 주요 기능:
 * 1. 주문 정보 표시 (주문 번호, 주문일, 총 금액, 주문 상태)
 * 2. 주문 아이템 목록 표시
 * 3. 배송 정보 표시
 * 4. 주문 메모 표시 (있는 경우)
 * 5. 홈으로 돌아가기 버튼
 *
 * @dependencies
 * - @/actions/order/get-order: 주문 정보 조회
 */

import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getOrder } from "@/actions/order/get-order";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductImage from "@/components/product-image";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 주문 상태 한글 표시
 */
function getOrderStatusLabel(
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
): string {
  const statusMap = {
    pending: "주문 대기",
    confirmed: "주문 확인",
    shipped: "배송 중",
    delivered: "배송 완료",
    cancelled: "주문 취소",
  };
  return statusMap[status];
}

/**
 * 날짜 포맷팅 (한국어)
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function OrderPage({ params }: OrderPageProps) {
  // 인증 확인
  const { userId } = await auth();
  if (!userId) {
    redirect("/products");
  }

  // URL 파라미터에서 주문 ID 추출
  const { id: orderId } = await params;

  // 주문 정보 조회
  const result = await getOrder(orderId);

  if (!result.success || !result.data) {
    notFound();
  }

  const order = result.data;

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 sm:px-8 py-8 sm:py-16 lg:py-24">
      <div className="w-full max-w-4xl mx-auto">
        {/* 주문 완료 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            주문이 완료되었습니다
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            주문해주셔서 감사합니다.
          </p>
        </div>

        {/* 주문 정보 카드 */}
        <div className="bg-white dark:bg-gray-800 border rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            주문 정보
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">주문 번호</span>
              <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                {order.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">주문일</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatDate(order.created_at)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">주문 상태</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {getOrderStatusLabel(order.status)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                총 주문 금액
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {order.total_amount.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        {/* 주문 아이템 목록 */}
        <div className="bg-white dark:bg-gray-800 border rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            주문 상품
          </h2>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900"
              >
                <div className="flex-shrink-0 w-20 h-20 relative rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <ProductImage
                    imageUrl={item.image_url}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                <div className="flex-1 flex flex-col sm:flex-row justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {item.product_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      수량: {item.quantity}개
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {(item.price * item.quantity).toLocaleString()}원
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      단가: {item.price.toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 배송 정보 */}
        <div className="bg-white dark:bg-gray-800 border rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            배송 정보
          </h2>

          <div className="space-y-2">
            <div>
              <span className="text-gray-600 dark:text-gray-400">수령인: </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {order.shipping_address.recipientName}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">전화번호: </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {order.shipping_address.phone}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">주소: </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                [{order.shipping_address.postalCode}] {order.shipping_address.address}
                {order.shipping_address.detailAddress &&
                  ` ${order.shipping_address.detailAddress}`}
              </span>
            </div>
          </div>
        </div>

        {/* 주문 메모 (있는 경우) */}
        {order.order_note && (
          <div className="bg-white dark:bg-gray-800 border rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              주문 메모
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {order.order_note}
            </p>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-4 justify-center">
          <Link href="/products">
            <Button variant="outline" size="lg">
              쇼핑 계속하기
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg">홈으로</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

