-- 장르별 작품 수 확인 쿼리

SELECT
  category AS "장르",
  COUNT(*) AS "작품 수",
  COUNT(DISTINCT artist_id) AS "작가 수",
  AVG(views)::INTEGER AS "평균 조회수",
  AVG(likes)::INTEGER AS "평균 좋아요",
  MAX(image_url) AS "대표 이미지 URL"
FROM artworks
WHERE status = 'active'
GROUP BY category
ORDER BY COUNT(*) DESC;

-- 총 작품 수
SELECT
  '전체' AS "장르",
  COUNT(*) AS "작품 수",
  COUNT(DISTINCT artist_id) AS "작가 수"
FROM artworks
WHERE status = 'active';
