# 장르 시드 데이터 가이드

장르 페이지를 테스트하기 위한 가짜 데이터 추가 방법입니다.

## 📊 시드 데이터 구성

총 **37개의 작품**이 **10개 장르**에 걸쳐 추가됩니다:

| 장르 | 작품 수 | 예시 작품 |
|------|---------|----------|
| 🎨 Painting (회화) | 4개 | 추상적 풍경, 도시의 밤, 자연의 조화 |
| 🗿 Sculpture (조각) | 3개 | 인간의 형상, 공간의 해석, 시간의 흐름 |
| 📷 Photography (사진) | 4개 | 도시 풍경 시리즈, 자연 속 인물, 흑백의 미학 |
| 💻 Digital Art (디지털 아트) | 4개 | 사이버 시티, 네온 드림, 3D 추상 |
| 🎭 Mixed Media (혼합 매체) | 3개 | 콜라주의 세계, 텍스처의 조화 |
| 🖨️ Printmaking (판화) | 3개 | 실크스크린 No.5, 리노컷 시리즈 |
| ✏️ Drawing (드로잉) | 4개 | 인물 드로잉, 풍경 스케치, 추상 드로잉 |
| 🪑 Furniture (가구) | 4개 | 모던 체어, 우드 테이블, 아트 선반 |
| 🏺 Ceramics (도자기) | 4개 | 청자 항아리, 현대 도예, 백자 꽃병 |
| 🧵 Textile (섬유) | 3개 | 태피스트리, 패브릭 아트, 자수 작품 |

## 🚀 방법 1: Supabase CLI 사용 (권장)

### 1. 인덱스 추가
```bash
npx supabase db push
```

### 2. 시드 데이터 추가
Migration 파일이 자동으로 감지되어 적용됩니다.

## 🔧 방법 2: Supabase Dashboard 사용

1. Supabase Dashboard → SQL Editor 접속
2. `supabase/migrations/010_add_genre_indexes.sql` 내용을 복사하여 실행
3. `supabase/migrations/011_seed_genre_artworks.sql` 내용을 복사하여 실행

## 📝 방법 3: SQL 직접 실행

```sql
-- 1. 인덱스 추가
\i supabase/migrations/010_add_genre_indexes.sql

-- 2. 시드 데이터 추가
\i supabase/migrations/011_seed_genre_artworks.sql
```

## ✅ 데이터 확인

### Supabase Dashboard에서 확인
```sql
-- scripts/check-genres.sql 파일 내용 실행
SELECT
  category AS "장르",
  COUNT(*) AS "작품 수",
  COUNT(DISTINCT artist_id) AS "작가 수",
  AVG(views)::INTEGER AS "평균 조회수"
FROM artworks
WHERE status = 'active'
GROUP BY category
ORDER BY COUNT(*) DESC;
```

### 웹사이트에서 확인
```bash
npm run dev
```

다음 페이지를 방문하여 확인:
- http://localhost:3000/genres - 모든 장르 목록
- http://localhost:3000/genres/painting - 회화 작품들
- http://localhost:3000/genres/digital-art - 디지털 아트
- http://localhost:3000/genres/furniture - 가구 작품들
- http://localhost:3000/genres/ceramics - 도자기 작품들

## 🎯 각 장르별 URL

- `/genres/painting` - 회화
- `/genres/sculpture` - 조각
- `/genres/photography` - 사진
- `/genres/digital-art` - 디지털 아트
- `/genres/mixed-media` - 혼합 매체
- `/genres/printmaking` - 판화
- `/genres/drawing` - 드로잉
- `/genres/furniture` - 가구
- `/genres/ceramics` - 도자기
- `/genres/textile` - 섬유

## 🖼️ 이미지 출처

모든 이미지는 Unsplash에서 가져온 무료 이미지입니다.
실제 서비스에서는 작가가 직접 업로드한 이미지로 교체해야 합니다.

## 🗑️ 시드 데이터 삭제

테스트 후 시드 데이터를 삭제하려면:

```sql
DELETE FROM artworks
WHERE category IN (
  'Painting', 'Sculpture', 'Photography', 'Digital Art',
  'Mixed Media', 'Printmaking', 'Drawing', 'Furniture',
  'Ceramics', 'Textile'
);
```

## 📌 주의사항

1. **작가 필요**: 시드 데이터를 추가하기 전에 최소 1명의 작가가 등록되어 있어야 합니다.
2. **중복 실행**: migration을 여러 번 실행하면 데이터가 중복됩니다.
3. **이미지 로딩**: Unsplash 이미지는 외부 URL이므로 인터넷 연결이 필요합니다.

## 🎨 테스트 시나리오

1. **장르 목록 확인**: `/genres` 페이지에서 10개 장르 카드 확인
2. **장르별 작품 확인**: 각 장르 카드를 클릭하여 작품 목록 확인
3. **정렬 기능**: 최신순, 인기순, 가격순으로 정렬 테스트
4. **페이지네이션**: 작품이 24개 이상일 경우 페이지 전환 테스트
5. **반응형**: 모바일/태블릿/데스크톱 레이아웃 확인
6. **작품 상세**: 작품 카드 클릭 시 상세 페이지 이동 확인

## 🔍 트러블슈팅

### "No artists found" 에러
- 먼저 작가를 최소 1명 등록해야 합니다.
- `/register` 페이지에서 작가 계정을 생성하세요.

### 이미지가 표시되지 않음
- `next.config.js`에 Unsplash 도메인이 추가되어 있는지 확인:
  ```js
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  }
  ```

### 장르가 표시되지 않음
- 인덱스 migration이 먼저 적용되었는지 확인
- 브라우저 캐시를 지우고 새로고침
