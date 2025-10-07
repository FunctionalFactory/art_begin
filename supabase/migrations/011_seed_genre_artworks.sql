-- 장르별 테스트 데이터 추가

-- 먼저 테스트용 작가가 있는지 확인하고, 없으면 첫 번째 작가 사용
DO $$
DECLARE
  test_artist_id UUID;
BEGIN
  -- 첫 번째 작가 ID 가져오기
  SELECT id INTO test_artist_id FROM artists LIMIT 1;

  IF test_artist_id IS NULL THEN
    RAISE EXCEPTION 'No artists found. Please create at least one artist first.';
  END IF;

  -- Painting (회화) 작품들
  INSERT INTO artworks (artist_id, title, description, image_url, category, fixed_price, sale_type, status, views, likes)
  VALUES
    (test_artist_id, '추상적 풍경', '현대적 감각의 추상 회화 작품', 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800', 'Painting', 1500000, 'fixed', 'active', 245, 18),
    (test_artist_id, '도시의 밤', '도심의 야경을 표현한 유화 작품', 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800', 'Painting', 2200000, 'fixed', 'active', 189, 32),
    (test_artist_id, '자연의 조화', '자연을 주제로 한 수채화', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800', 'Painting', 980000, 'fixed', 'active', 312, 41),
    (test_artist_id, '빛과 그림자', '명암 대비가 돋보이는 아크릴화', 'https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=800', 'Painting', 1750000, 'fixed', 'active', 167, 25);

  -- Sculpture (조각) 작품들
  INSERT INTO artworks (artist_id, title, description, image_url, category, fixed_price, sale_type, status, views, likes)
  VALUES
    (test_artist_id, '인간의 형상', '현대 조각의 새로운 시도', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', 'Sculpture', 3500000, 'fixed', 'active', 421, 56),
    (test_artist_id, '공간의 해석', '추상적 형태의 금속 조각', 'https://images.unsplash.com/photo-1554188248-986adbb73be4?w=800', 'Sculpture', 4200000, 'fixed', 'active', 378, 48),
    (test_artist_id, '시간의 흐름', '설치미술 작품', 'https://images.unsplash.com/photo-1545898679-1d7a7701548f?w=800', 'Sculpture', 2800000, 'fixed', 'active', 289, 37);

  -- Photography (사진) 작품들
  INSERT INTO artworks (artist_id, title, description, image_url, category, fixed_price, sale_type, status, views, likes)
  VALUES
    (test_artist_id, '도시 풍경 시리즈 #1', '도시의 다양한 모습을 담은 사진', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800', 'Photography', 650000, 'fixed', 'active', 534, 72),
    (test_artist_id, '자연 속 인물', '자연과 인간의 조화', 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800', 'Photography', 780000, 'fixed', 'active', 456, 61),
    (test_artist_id, '흑백의 미학', '흑백 사진의 깊이', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', 'Photography', 720000, 'fixed', 'active', 398, 54),
    (test_artist_id, '추상적 순간', '추상 사진 작품', 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800', 'Photography', 890000, 'fixed', 'active', 287, 43);

  -- Digital Art (디지털 아트) 작품들
  INSERT INTO artworks (artist_id, title, description, image_url, category, fixed_price, sale_type, status, views, likes)
  VALUES
    (test_artist_id, '사이버 시티', '미래 도시를 그린 디지털 페인팅', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', 'Digital Art', 1200000, 'fixed', 'active', 678, 89),
    (test_artist_id, '네온 드림', '네온 빛의 환상적 세계', 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=800', 'Digital Art', 1450000, 'fixed', 'active', 523, 76),
    (test_artist_id, '디지털 자연', '자연을 디지털로 재해석', 'https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=800', 'Digital Art', 1100000, 'fixed', 'active', 412, 58),
    (test_artist_id, '3D 추상', '3D 렌더링 추상 작품', 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800', 'Digital Art', 1350000, 'fixed', 'active', 491, 67);

  -- Mixed Media (혼합 매체) 작품들
  INSERT INTO artworks (artist_id, title, description, image_url, category, fixed_price, sale_type, status, views, likes)
  VALUES
    (test_artist_id, '콜라주의 세계', '다양한 재료를 혼합한 작품', 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800', 'Mixed Media', 1650000, 'fixed', 'active', 312, 44),
    (test_artist_id, '텍스처의 조화', '질감이 살아있는 혼합 작품', 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800', 'Mixed Media', 1890000, 'fixed', 'active', 267, 39),
    (test_artist_id, '재료의 대화', '페인트와 오브제의 만남', 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800', 'Mixed Media', 1420000, 'fixed', 'active', 198, 28);

  -- Printmaking (판화) 작품들
  INSERT INTO artworks (artist_id, title, description, image_url, category, fixed_price, sale_type, status, views, likes)
  VALUES
    (test_artist_id, '실크스크린 No.5', '대담한 색채의 실크스크린', 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=800', 'Printmaking', 850000, 'fixed', 'active', 234, 31),
    (test_artist_id, '리노컷 시리즈', '손으로 직접 새긴 리노컷', 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800', 'Printmaking', 720000, 'fixed', 'active', 178, 24),
    (test_artist_id, '목판화의 미', '전통 목판화 기법', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800', 'Printmaking', 950000, 'fixed', 'active', 156, 22);

  -- Drawing (드로잉) 작품들
  INSERT INTO artworks (artist_id, title, description, image_url, category, fixed_price, sale_type, status, views, likes)
  VALUES
    (test_artist_id, '인물 드로잉', '섬세한 연필 드로잉', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800', 'Drawing', 580000, 'fixed', 'active', 289, 38),
    (test_artist_id, '풍경 스케치', '펜과 잉크로 그린 풍경', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800', 'Drawing', 620000, 'fixed', 'active', 245, 33),
    (test_artist_id, '추상 드로잉', '자유로운 선의 흐름', 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800', 'Drawing', 690000, 'fixed', 'active', 198, 27),
    (test_artist_id, '정물 소묘', '정밀한 정물 드로잉', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800', 'Drawing', 540000, 'fixed', 'active', 167, 21);

  -- Furniture (가구) 작품들
  INSERT INTO artworks (artist_id, title, description, image_url, category, fixed_price, sale_type, status, views, likes)
  VALUES
    (test_artist_id, '모던 체어', '현대적 감각의 디자인 의자', 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800', 'Furniture', 2800000, 'fixed', 'active', 567, 78),
    (test_artist_id, '우드 테이블', '원목을 살린 수제 테이블', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', 'Furniture', 3200000, 'fixed', 'active', 489, 65),
    (test_artist_id, '아트 선반', '예술성을 더한 벽 선반', 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800', 'Furniture', 1450000, 'fixed', 'active', 378, 51),
    (test_artist_id, '디자인 스툴', '독특한 형태의 스툴', 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800', 'Furniture', 980000, 'fixed', 'active', 312, 42);

  -- Ceramics (도자기) 작품들
  INSERT INTO artworks (artist_id, title, description, image_url, category, fixed_price, sale_type, status, views, likes)
  VALUES
    (test_artist_id, '청자 항아리', '전통 기법의 청자', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800', 'Ceramics', 1650000, 'fixed', 'active', 423, 58),
    (test_artist_id, '현대 도예', '현대적 감각의 도자 작품', 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800', 'Ceramics', 1280000, 'fixed', 'active', 356, 47),
    (test_artist_id, '백자 꽃병', '순백의 아름다움', 'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800', 'Ceramics', 1890000, 'fixed', 'active', 298, 41),
    (test_artist_id, '오브제 세라믹', '예술적 세라믹 오브제', 'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800', 'Ceramics', 1120000, 'fixed', 'active', 234, 33);

  -- Textile (섬유) 작품들
  INSERT INTO artworks (artist_id, title, description, image_url, category, fixed_price, sale_type, status, views, likes)
  VALUES
    (test_artist_id, '태피스트리', '손으로 짠 대형 태피스트리', 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800', 'Textile', 2100000, 'fixed', 'active', 312, 44),
    (test_artist_id, '패브릭 아트', '직물을 이용한 현대 미술', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800', 'Textile', 1750000, 'fixed', 'active', 267, 38),
    (test_artist_id, '자수 작품', '섬세한 손자수 작품', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800', 'Textile', 1480000, 'fixed', 'active', 223, 31);

  RAISE NOTICE 'Successfully inserted genre seed data for % artworks',
    (SELECT COUNT(*) FROM artworks WHERE category IN ('Painting', 'Sculpture', 'Photography', 'Digital Art', 'Mixed Media', 'Printmaking', 'Drawing', 'Furniture', 'Ceramics', 'Textile'));
END $$;
