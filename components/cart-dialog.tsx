"use client";

/**
 * @file components/cart-dialog.tsx
 * @description 장바구니 추가 성공 후 표시되는 Dialog 컴포넌트
 *
 * 장바구니에 상품을 추가한 후 사용자에게 다음 액션을 선택할 수 있도록 합니다.
 * - 장바구니로 이동: /cart 페이지로 이동
 * - 쇼핑 계속하기: Dialog를 닫고 현재 페이지에 머물기
 */

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartDialog({ open, onOpenChange }: CartDialogProps) {
  const router = useRouter();

  const handleGoToCart = () => {
    onOpenChange(false);
    router.push("/cart");
  };

  const handleContinueShopping = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>장바구니에 추가되었습니다</DialogTitle>
          <DialogDescription>
            상품이 장바구니에 성공적으로 추가되었습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleContinueShopping}>
            쇼핑 계속하기
          </Button>
          <Button onClick={handleGoToCart}>장바구니로 이동</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

