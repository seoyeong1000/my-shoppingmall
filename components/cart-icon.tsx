/**
 * @file components/cart-icon.tsx
 * @description 장바구니 아이콘 컴포넌트 (Server Component)
 *
 * Navbar에서 사용하는 장바구니 아이콘과 개수 배지를 표시합니다.
 * Server Component로 구현하여 서버 사이드에서 장바구니 개수를 조회합니다.
 *
 * @dependencies
 * - @/actions/cart: getCartSummary Server Action
 * - @clerk/nextjs: SignedIn 컴포넌트
 */

import { SignedIn } from "@clerk/nextjs";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { getCartSummary } from "@/actions/cart";
import { Badge } from "@/components/ui/badge";

export default async function CartIcon() {
  // 장바구니 요약 정보 조회
  const summary = await getCartSummary();

  return (
    <SignedIn>
      <Link href="/cart" className="relative">
        <ShoppingCart className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        {summary.totalItems > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {summary.totalItems > 99 ? "99+" : summary.totalItems}
          </Badge>
        )}
      </Link>
    </SignedIn>
  );
}

