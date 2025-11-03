/**
 * @file product-sort.tsx
 * @description 상품 정렬 드롭다운 컴포넌트
 *
 * 상품 목록을 정렬하는 드롭다운 메뉴입니다.
 * URL 쿼리 파라미터로 정렬 상태를 관리하며, 정렬 변경 시 페이지를 1로 리셋합니다.
 *
 * 주요 기능:
 * - 최신순 정렬 (created_at 내림차순)
 * - 이름순 정렬 (name 오름차순)
 * - 정렬 변경 시 페이지 자동 리셋
 *
 * @dependencies
 * - next/navigation: URL 쿼리 파라미터 관리
 * - @/components/ui/select: shadcn/ui Select 컴포넌트
 */

"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortOption = "latest" | "name";

interface ProductSortProps {
  selected?: SortOption;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "name", label: "이름순" },
];

export default function ProductSort({ selected }: ProductSortProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setSort = useCallback(
    (sort: string) => {
      console.group("ProductSort");
      console.info("select sort", { sort });
      const params = new URLSearchParams(searchParams.toString());
      
      // "latest"는 기본값이므로 파라미터에서 제거
      if (sort === "latest") {
        params.delete("sort");
      } else {
        params.set("sort", sort);
      }
      
      // 정렬 변경 시 페이지를 1로 리셋
      params.delete("page");
      const url = `${pathname}?${params.toString()}`;
      console.info("navigate", { url });
      router.replace(url, { scroll: false });
      console.groupEnd();
    },
    [pathname, router, searchParams]
  );

  // Select 컴포넌트의 value는 string이어야 하므로, undefined일 때 "latest" 사용
  const selectValue = selected ?? "latest";

  return (
    <div className="w-full sm:w-auto sm:min-w-[150px]">
      <Select value={selectValue} onValueChange={setSort}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="정렬 기준" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

