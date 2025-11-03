/**
 * @file product-pagination.tsx
 * @description 상품 목록 페이지네이션 컴포넌트
 *
 * 페이지 번호를 표시하고 이전/다음 버튼을 제공합니다.
 * URL 쿼리 파라미터를 사용하여 페이지를 변경합니다.
 *
 * 주요 기능:
 * - 번호형 페이지네이션 UI (1, 2, 3... 형태)
 * - 이전/다음 버튼
 * - 현재 페이지 강조 표시
 * - 카테고리 필터와 병행 가능
 *
 * @dependencies
 * - next/navigation: URL 쿼리 파라미터 관리
 * - @/components/ui/button: 버튼 UI 컴포넌트
 */

"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export default function ProductPagination({
  currentPage,
  totalPages,
  totalCount,
}: ProductPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setPage = useCallback(
    (page: number) => {
      console.group("ProductPagination");
      console.info("navigate to page", { page });
      const params = new URLSearchParams(searchParams.toString());
      if (page === 1) {
        params.delete("page");
      } else {
        params.set("page", page.toString());
      }
      const url = `${pathname}?${params.toString()}`;
      console.info("navigate", { url });
      router.replace(url, { scroll: false });
      console.groupEnd();
    },
    [pathname, router, searchParams]
  );

  // 페이지 번호 배열 생성 (최대 5개 표시)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // 전체 페이지가 5개 이하인 경우 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 페이지 주변에 최대 5개 표시
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      // 시작/끝 조정하여 항상 5개 표시
      if (end - start < maxVisible - 1) {
        if (start === 1) {
          end = Math.min(totalPages, start + maxVisible - 1);
        } else {
          start = Math.max(1, end - maxVisible + 1);
        }
      }

      // 첫 페이지
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push("...");
        }
      }

      // 중간 페이지들
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // 마지막 페이지
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push("...");
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col items-center gap-4 mt-12">
      {/* 페이지 정보 */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        전체 {totalCount.toLocaleString()}개 상품 중 {((currentPage - 1) * 12 + 1).toLocaleString()}
        -{Math.min(currentPage * 12, totalCount).toLocaleString()}개 표시
      </div>

      {/* 페이지네이션 버튼들 - 2페이지 이상일 때만 표시 */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
        {/* 이전 버튼 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="이전 페이지"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">이전</span>
        </Button>

        {/* 페이지 번호들 */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <Button
                key={pageNum}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(pageNum)}
                className={isActive ? "font-bold" : ""}
                aria-label={`${pageNum}페이지로 이동`}
                aria-current={isActive ? "page" : undefined}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        {/* 다음 버튼 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="다음 페이지"
        >
          <span className="sr-only">다음</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      )}
    </div>
  );
}

