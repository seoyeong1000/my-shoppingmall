/**
 * @file categories.ts
 * @description 상품 카테고리 상수 정의 (스키마 `products.category` 기준)
 */

export interface CategoryDefinition {
  value: string;
  label: string;
}

export const CATEGORIES: readonly CategoryDefinition[] = [
  { value: "electronics", label: "전자제품" },
  { value: "clothing", label: "의류" },
  { value: "books", label: "도서" },
  { value: "food", label: "식품" },
  { value: "sports", label: "스포츠" },
  { value: "beauty", label: "뷰티" },
  { value: "home", label: "생활/가정" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];


