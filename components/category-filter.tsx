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

interface CategoryItem {
  value: string;
  label: string;
  count: number;
}

interface CategoryFilterProps {
  selected?: string;
  allCount: number;
  categories: CategoryItem[];
}

export default function CategoryFilter({ selected, allCount, categories }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setCategory = useCallback(
    (cat: string) => {
      console.group("CategoryFilter");
      console.info("select", { cat });
      const params = new URLSearchParams(searchParams.toString());
      // "all" 값을 받으면 전체 상품을 보여주기 위해 category 파라미터 삭제
      if (cat === "all") {
        params.delete("category");
      } else {
        params.set("category", cat);
      }
      // 카테고리 변경 시 페이지를 1로 리셋
      params.delete("page");
      const url = `${pathname}?${params.toString()}`;
      console.info("navigate", { url });
      router.replace(url, { scroll: false });
      console.groupEnd();
    },
    [pathname, router, searchParams]
  );

  // Select 컴포넌트의 value는 string이어야 하므로, undefined일 때 "all" 사용
  const selectValue = selected ?? "all";

  return (
    <div className="w-full sm:w-auto sm:min-w-[200px]">
      <Select value={selectValue} onValueChange={setCategory}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="카테고리를 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            전체 ({allCount})
          </SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.label} ({c.count})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}


