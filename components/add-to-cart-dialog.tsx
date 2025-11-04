"use client";

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

interface AddToCartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
}

/**
 * 장바구니 추가 성공 후 표시되는 Dialog 컴포넌트
 * 
 * 사용자가 "장바구니로 이동" 또는 "계속 쇼핑하기"를 선택할 수 있습니다.
 */
export default function AddToCartDialog({
  open,
  onOpenChange,
  productName,
}: AddToCartDialogProps) {
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
            {productName}이(가) 장바구니에 추가되었습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleContinueShopping}
            className="w-full sm:w-auto"
          >
            계속 쇼핑하기
          </Button>
          <Button onClick={handleGoToCart} className="w-full sm:w-auto">
            장바구니로 이동
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

