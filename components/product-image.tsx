/**
 * @file product-image.tsx
 * @description 상품 이미지 컴포넌트 (클라이언트 컴포넌트)
 *
 * 상품 이미지를 표시하고, 로드 실패 시 placeholder 이미지로 자동 전환합니다.
 *
 * @dependencies
 * - next/image: 최적화된 이미지 표시
 */

"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImageProps {
  imageUrl: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export default function ProductImage({
  imageUrl,
  alt,
  width,
  height,
  fill = false,
  className = "",
  sizes,
  priority = false,
}: ProductImageProps) {
  // 이미지 URL 결정: 없거나 빈 문자열이면 placeholder 사용
  const initialImageUrl =
    imageUrl && imageUrl.trim() !== "" ? imageUrl : "/product-placeholder.svg";

  const [currentImageUrl, setCurrentImageUrl] = useState(initialImageUrl);

  // 이미지 로드 실패 시 placeholder로 전환
  const handleImageError = () => {
    console.log("ProductImage: Image load failed, using placeholder", {
      alt,
      attemptedUrl: currentImageUrl,
    });
    if (currentImageUrl !== "/product-placeholder.svg") {
      setCurrentImageUrl("/product-placeholder.svg");
    }
  };

  // 이미지 로드 성공 로그
  const handleImageLoad = () => {
    console.log("ProductImage: Image loaded successfully", {
      alt,
      imageUrl: currentImageUrl,
    });
  };

  const imageProps = fill
    ? {
        fill: true,
        sizes: sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
      }
    : {
        width: width || 800,
        height: height || 600,
      };

  return (
    <Image
      src={currentImageUrl}
      alt={alt}
      {...imageProps}
      className={className}
      onError={handleImageError}
      onLoad={handleImageLoad}
      priority={priority}
    />
  );
}

