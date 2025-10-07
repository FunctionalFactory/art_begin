-- 장르별 조회 성능 최적화를 위한 인덱스 추가

-- 장르별 조회용 인덱스
CREATE INDEX IF NOT EXISTS idx_artworks_category
ON artworks(category)
WHERE status = 'active';

-- 장르 + 상태 + 생성일 복합 인덱스 (최신순 정렬)
CREATE INDEX IF NOT EXISTS idx_artworks_category_status_created
ON artworks(category, status, created_at DESC);

-- 장르 + 조회수 정렬용 인덱스 (인기순 정렬)
CREATE INDEX IF NOT EXISTS idx_artworks_category_views
ON artworks(category, views DESC)
WHERE status = 'active';

-- 장르 + 가격 정렬용 인덱스
CREATE INDEX IF NOT EXISTS idx_artworks_category_price
ON artworks(category, fixed_price)
WHERE status = 'active' AND fixed_price IS NOT NULL;
