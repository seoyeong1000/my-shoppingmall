"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCartCount } from "@/actions/cart/get-count";

/**
 * Navbar에 표시되는 장바구니 아이콘 컴포넌트
 * 
 * 현재 사용자의 장바구니 아이템 개수를 표시하고,
 * 클릭 시 장바구니 페이지로 이동합니다.
 */
export default function CartIcon() {
  const { isLoaded, userId } = useAuth();
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!isLoaded || !userId) {
      setCount(0);
      return;
    }

    // 장바구니 개수 조회
    const fetchCount = async () => {
      const cartCount = await getCartCount();
      setCount(cartCount);
    };

    fetchCount();

    // 주기적으로 갱신 (5초마다)
    const interval = setInterval(fetchCount, 5000);

    return () => clearInterval(interval);
  }, [isLoaded, userId]);

  if (!isLoaded || !userId) {
    return null;
  }

  return (
    <Link
      href="/cart"
      className="relative flex items-center justify-center p-2 hover:opacity-70 transition-opacity"
      aria-label="장바구니"
    >
      <ShoppingCart className="w-6 h-6" />
      {count > 0 && (
        <Badge
          className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center px-1.5 text-xs bg-red-500 hover:bg-red-600"
        >
          {count > 99 ? "99+" : count}
        </Badge>
      )}
    </Link>
  );
}

