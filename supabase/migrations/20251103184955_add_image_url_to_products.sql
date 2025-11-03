-- ==========================================
-- products 테이블에 image_url 컬럼 추가
-- ==========================================

-- image_url 컬럼 추가 (nullable TEXT 타입)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 컬럼 설명 추가
COMMENT ON COLUMN public.products.image_url IS '상품 이미지 URL (없으면 placeholder 이미지 사용)';

