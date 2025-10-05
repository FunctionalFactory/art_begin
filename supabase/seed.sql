-- Seed data for ART-XHIBIT
-- This file contains sample data from lib/data.ts converted to SQL

-- Insert artists
INSERT INTO public.artists (id, user_id, name, username, bio, profile_image, created_at, updated_at) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  NULL,
  '김아제',
  'aze-kim',
  '빛과 어둠의 경계를 탐구하는 추상화가입니다. 일상 속에서 발견하는 작은 감정들을 캔버스에 담습니다.',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  NOW(),
  NOW()
),
(
  '22222222-2222-2222-2222-222222222222',
  NULL,
  '박도시',
  'Urbanist',
  '도시의 기하학적 구조와 인간의 삶이 만나는 지점을 그립니다. 건축과 미술의 경계를 넘나드는 작업을 합니다.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  NOW(),
  NOW()
),
(
  '33333333-3333-3333-3333-333333333333',
  NULL,
  '이모지',
  'emoji_lee',
  '따뜻한 색감과 미니멀한 구성으로 일상의 평온함을 표현합니다. 작은 것들의 소중함을 그립니다.',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
  NOW(),
  NOW()
),
(
  '44444444-4444-4444-4444-444444444444',
  NULL,
  '최자연',
  'nature_choi',
  '자연의 순환과 생명력을 주제로 작업합니다. 유기적인 형태와 자연스러운 색채를 추구합니다.',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  NOW(),
  NOW()
),
(
  '55555555-5555-5555-5555-555555555555',
  NULL,
  '정감성',
  'emotion_jung',
  '인간의 복잡한 감정을 색과 형태로 표현하는 것에 관심이 많습니다. 추상과 구상의 경계에서 작업합니다.',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Insert artworks
INSERT INTO public.artworks (
  id, artist_id, title, description, image_url, category,
  current_price, fixed_price, sale_type, auction_end_time,
  bid_count, views, likes, status, created_at, updated_at
) VALUES
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  '새벽의 눈동자',
  '새벽의 첫 빛이 눈동자에 반사되는 순간을 포착한 작품입니다. 빛과 어둠의 경계에서 피어나는 희망을 표현했습니다.',
  'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800',
  '추상화',
  150000,
  NULL,
  'auction',
  NOW() + INTERVAL '2 days',
  12,
  342,
  89,
  'active',
  '2025-09-15'::timestamptz,
  NOW()
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '22222222-2222-2222-2222-222222222222',
  '도시의 격자',
  '현대 도시의 건축적 구조를 기하학적으로 재해석한 작품입니다. 차가운 콘크리트 속에서도 살아 숨쉬는 인간의 온기를 담았습니다.',
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
  '기하학',
  225000,
  NULL,
  'auction',
  NOW() + INTERVAL '5 days',
  8,
  521,
  134,
  'active',
  '2025-09-20'::timestamptz,
  NOW()
),
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '33333333-3333-3333-3333-333333333333',
  '나의 작은 집',
  '마음속 안식처를 상징하는 작은 집. 미니멀한 선과 따뜻한 색감으로 평온함을 표현했습니다.',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
  '미니멀',
  NULL,
  90000,
  'fixed',
  NULL,
  0,
  198,
  56,
  'active',
  '2025-09-25'::timestamptz,
  NOW()
),
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '44444444-4444-4444-4444-444444444444',
  '봄의 숨결',
  '봄이 오는 소리를 시각화한 작품입니다. 생명이 깨어나는 순간의 에너지와 설렘을 담았습니다.',
  'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=800',
  '자연',
  180000,
  NULL,
  'auction',
  NOW() + INTERVAL '1 day',
  15,
  687,
  201,
  'active',
  '2025-09-10'::timestamptz,
  NOW()
),
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  '55555555-5555-5555-5555-555555555555',
  '감정의 파편',
  '복잡하게 얽힌 감정들을 색의 파편으로 표현했습니다. 각자만의 방식으로 해석할 수 있는 여지를 남겼습니다.',
  'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800',
  '추상화',
  NULL,
  120000,
  'fixed',
  NULL,
  0,
  234,
  78,
  'active',
  '2025-09-28'::timestamptz,
  NOW()
),
(
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  '11111111-1111-1111-1111-111111111111',
  '고요한 밤',
  '밤의 정적 속에서 느끼는 고요함과 평화를 표현한 작품입니다.',
  'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=800',
  '추상화',
  195000,
  NULL,
  'auction',
  NOW() + INTERVAL '3 days',
  10,
  412,
  112,
  'active',
  '2025-09-18'::timestamptz,
  NOW()
),
(
  '99999999-9999-9999-9999-999999999999',  -- g 대신 9 사용
  '22222222-2222-2222-2222-222222222222',
  '메트로폴리스',
  '대도시의 복잡함과 역동성을 기하학적 패턴으로 재구성했습니다.',
  'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800',
  '기하학',
  NULL,
  260000,
  'fixed',
  NULL,
  0,
  589,
  167,
  'active',
  '2025-09-22'::timestamptz,
  NOW()
),
(
  'aaaaaaab-aaaa-aaaa-aaaa-aaaaaaaaaaaa',  -- h 대신 유효한 UUID 사용
  '33333333-3333-3333-3333-333333333333',
  '오후의 차',
  '조용한 오후, 차 한 잔의 여유를 그림으로 담았습니다.',
  'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800',
  '미니멀',
  105000,
  NULL,
  'auction',
  NOW() + INTERVAL '4 days',
  6,
  276,
  92,
  'active',
  '2025-09-26'::timestamptz,
  NOW()
),
(
  'aaaaaaac-aaaa-aaaa-aaaa-aaaaaaaaaaaa',  -- i 대신 유효한 UUID 사용
  '44444444-4444-4444-4444-444444444444',
  '숲의 교향곡',
  '숲 속에서 들리는 자연의 소리를 시각적으로 표현한 작품입니다.',
  'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800',
  '자연',
  NULL,
  210000,
  'fixed',
  NULL,
  0,
  445,
  156,
  'active',
  '2025-09-12'::timestamptz,
  NOW()
),
(
  'aaaaaaad-aaaa-aaaa-aaaa-aaaaaaaaaaaa',  -- j 대신 유효한 UUID 사용
  '55555555-5555-5555-5555-555555555555',
  '내면의 여정',
  '자기 자신을 찾아가는 여정을 추상적으로 표현했습니다.',
  'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800',
  '추상화',
  175000,
  NULL,
  'auction',
  NOW() + INTERVAL '6 days',
  9,
  321,
  98,
  'active',
  '2025-09-30'::timestamptz,
  NOW()
)
ON CONFLICT (id) DO NOTHING;
