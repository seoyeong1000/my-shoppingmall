"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { clearAllCartItems } from "@/actions/cart/clear-all";

/**
 * 장바구니 전체 삭제 버튼 컴포넌트
 */
export default function ClearCartButton() {
  const [isClearing, setIsClearing] = useState(false);
  const router = useRouter();

  const handleClearAll = async () => {
    if (!confirm("장바구니의 모든 상품을 삭제하시겠습니까?")) {
      return;
    }

    setIsClearing(true);
    try {
      const result = await clearAllCartItems();
      if (result.success) {
        console.group("ClearCartButton");
        console.info("Successfully cleared cart");
        console.groupEnd();
        router.refresh();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("ClearCartButton: error", error);
      alert("장바구니를 비우는 중 오류가 발생했습니다.");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleClearAll}
      disabled={isClearing}
      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {isClearing ? "삭제 중..." : "전체 삭제"}
    </Button>
  );
}

