"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createOrder, type CreateOrderRequest } from "@/actions/order/create-order";

/**
 * 주문 폼 스키마 (Zod)
 */
const checkoutFormSchema = z.object({
  recipientName: z
    .string()
    .min(1, "수령인 이름을 입력해주세요.")
    .max(50, "수령인 이름은 50자 이하여야 합니다."),
  phone: z
    .string()
    .min(1, "전화번호를 입력해주세요.")
    .regex(
      /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
      "올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)"
    ),
  postalCode: z
    .string()
    .min(1, "우편번호를 입력해주세요.")
    .regex(/^\d{5}$/, "우편번호는 5자리 숫자여야 합니다."),
  address: z
    .string()
    .min(1, "주소를 입력해주세요.")
    .max(200, "주소는 200자 이하여야 합니다."),
  detailAddress: z.string().max(200, "상세 주소는 200자 이하여야 합니다.").optional(),
  orderNote: z.string().max(500, "주문 메모는 500자 이하여야 합니다.").optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

interface CheckoutFormProps {
  onSubmit?: (orderId: string) => void;
}

/**
 * 주문 폼 컴포넌트
 *
 * 배송 정보 입력 및 주문 생성을 담당합니다.
 */
export default function CheckoutForm({ onSubmit }: CheckoutFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      recipientName: "",
      phone: "",
      postalCode: "",
      address: "",
      detailAddress: "",
      orderNote: "",
    },
  });

  const handleSubmit = async (values: CheckoutFormValues) => {
    console.group("CheckoutForm: 주문 제출");
    console.info("formValues", values);

    setIsSubmitting(true);

    try {
      // 전화번호 형식 정리 (하이픈 제거)
      const phoneCleaned = values.phone.replace(/-/g, "");

      // 주문 생성 요청
      const request: CreateOrderRequest = {
        shippingAddress: {
          recipientName: values.recipientName,
          phone: phoneCleaned,
          postalCode: values.postalCode,
          address: values.address,
          detailAddress: values.detailAddress || undefined,
        },
        orderNote: values.orderNote || undefined,
      };

      console.info("CheckoutForm: 주문 생성 요청", request);

      const result = await createOrder(request);

      if (!result.success || !result.orderId) {
        console.error("CheckoutForm: 주문 생성 실패", result.message);
        alert(result.message || "주문 생성 중 오류가 발생했습니다.");
        setIsSubmitting(false);
        console.groupEnd();
        return;
      }

      console.info("CheckoutForm: 주문 생성 성공", { orderId: result.orderId });
      console.groupEnd();

      // 주문 완료 페이지로 리다이렉트
      if (onSubmit) {
        onSubmit(result.orderId);
      } else {
        router.push(`/order/${result.orderId}`);
      }
    } catch (error) {
      console.error("CheckoutForm: 예기치 않은 오류", error);
      alert("주문 처리 중 예기치 않은 오류가 발생했습니다.");
      setIsSubmitting(false);
      console.groupEnd();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* 수령인 이름 */}
        <FormField
          control={form.control}
          name="recipientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>수령인 이름 *</FormLabel>
              <FormControl>
                <Input
                  placeholder="홍길동"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 전화번호 */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>전화번호 *</FormLabel>
              <FormControl>
                <Input
                  placeholder="010-1234-5678"
                  {...field}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    // 전화번호 형식 자동 변환 (숫자만 입력 가능)
                    const value = e.target.value.replace(/[^\d-]/g, "");
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormDescription>
                하이픈(-)은 선택사항입니다. (예: 010-1234-5678 또는 01012345678)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 우편번호 */}
        <FormField
          control={form.control}
          name="postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>우편번호 *</FormLabel>
              <FormControl>
                <Input
                  placeholder="12345"
                  {...field}
                  disabled={isSubmitting}
                  maxLength={5}
                  onChange={(e) => {
                    // 숫자만 입력 가능
                    const value = e.target.value.replace(/\D/g, "");
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 주소 */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>주소 *</FormLabel>
              <FormControl>
                <Input
                  placeholder="서울특별시 강남구 테헤란로 123"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 상세 주소 */}
        <FormField
          control={form.control}
          name="detailAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>상세 주소</FormLabel>
              <FormControl>
                <Input
                  placeholder="아파트/동/호수 등 (선택사항)"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 주문 메모 */}
        <FormField
          control={form.control}
          name="orderNote"
          render={({ field }) => (
            <FormItem>
              <FormLabel>주문 메모</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="배송 시 요청사항을 입력해주세요. (선택사항)"
                  {...field}
                  disabled={isSubmitting}
                  rows={4}
                />
              </FormControl>
              <FormDescription>
                배송 시 요청사항이나 특별한 안내사항을 입력할 수 있습니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 제출 버튼 */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "주문 처리 중..." : "주문하기"}
        </Button>
      </form>
    </Form>
  );
}

