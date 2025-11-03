"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

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
    (cat?: string) => {
      console.group("CategoryFilter");
      console.info("click", { cat });
      const params = new URLSearchParams(searchParams.toString());
      if (!cat) params.delete("category");
      else params.set("category", cat);
      const url = `${pathname}?${params.toString()}`;
      console.info("navigate", { url });
      router.replace(url, { scroll: false });
      console.groupEnd();
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selected ? "outline" : "default"}
        onClick={() => setCategory(undefined)}
      >
        <span>전체</span>
        <span className="ml-2 rounded-full bg-gray-200 dark:bg-gray-800 px-2 py-0.5 text-xs">
          {allCount}
        </span>
      </Button>

      {categories.map((c) => {
        const active = selected === c.value;
        return (
          <Button
            key={c.value}
            variant={active ? "default" : "outline"}
            onClick={() => setCategory(c.value)}
          >
            <span>{c.label}</span>
            <span className="ml-2 rounded-full bg-gray-200 dark:bg-gray-800 px-2 py-0.5 text-xs">
              {c.count}
            </span>
          </Button>
        );
      })}
    </div>
  );
}


