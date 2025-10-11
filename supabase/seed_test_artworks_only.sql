-- E2E Test Seed Data for ART-XHIBIT (Artworks Only)
-- This file contains only test artworks and bids for E2E testing
-- Assumes test users already exist in the system

-- ============================================================
-- TEST ARTISTS
-- ============================================================
INSERT INTO public.artists (id, user_id, name, username, bio, profile_image, created_at, updated_at) VALUES
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  NULL,
  '테스트 작가',
  'test_artist',
  'E2E 테스트용 작가 계정입니다.',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TEST ARTWORKS (경매 작품)
-- ============================================================

-- Auction artwork 1: Active auction ending soon (1 hour)
INSERT INTO public.artworks (
  id, artist_id, title, description, image_url, category,
  current_price, fixed_price, sale_type, auction_end_time,
  bid_count, views, likes, status, created_at, updated_at
) VALUES
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '[테스트] 마감 임박 경매 작품',
  'E2E 테스트용 경매 작품입니다. 1시간 후 마감됩니다.',
  'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800',
  '추상화',
  150000, -- 15만원 현재가
  NULL,
  'auction',
  NOW() + INTERVAL '1 hour', -- 1시간 후 마감
  5,
  100,
  20,
  'active',
  NOW() - INTERVAL '2 days',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  auction_end_time = EXCLUDED.auction_end_time,
  bid_count = EXCLUDED.bid_count,
  updated_at = NOW();

-- Auction artwork 2: Active auction ending in 3 days
INSERT INTO public.artworks (
  id, artist_id, title, description, image_url, category,
  current_price, fixed_price, sale_type, auction_end_time,
  bid_count, views, likes, status, created_at, updated_at
) VALUES
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '[테스트] 일반 경매 작품',
  'E2E 테스트용 경매 작품입니다. 3일 후 마감됩니다.',
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
  '기하학',
  300000, -- 30만원 현재가
  NULL,
  'auction',
  NOW() + INTERVAL '3 days',
  3,
  150,
  30,
  'active',
  NOW() - INTERVAL '1 day',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  auction_end_time = EXCLUDED.auction_end_time,
  bid_count = EXCLUDED.bid_count,
  updated_at = NOW();

-- Auction artwork 3: Active auction with no bids yet
INSERT INTO public.artworks (
  id, artist_id, title, description, image_url, category,
  current_price, fixed_price, sale_type, auction_end_time,
  bid_count, views, likes, status, created_at, updated_at
) VALUES
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '[테스트] 입찰 없는 경매 작품',
  'E2E 테스트용 경매 작품입니다. 아직 입찰이 없습니다.',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
  '미니멀',
  100000, -- 10만원 시작가
  NULL,
  'auction',
  NOW() + INTERVAL '5 days',
  0,
  50,
  10,
  'active',
  NOW() - INTERVAL '6 hours',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  auction_end_time = EXCLUDED.auction_end_time,
  bid_count = EXCLUDED.bid_count,
  updated_at = NOW();

-- Fixed price artwork for comparison
INSERT INTO public.artworks (
  id, artist_id, title, description, image_url, category,
  current_price, fixed_price, sale_type, auction_end_time,
  bid_count, views, likes, status, created_at, updated_at
) VALUES
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '[테스트] 즉시 구매 작품',
  'E2E 테스트용 즉시 구매 작품입니다.',
  'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=800',
  '자연',
  NULL,
  200000, -- 20만원 고정가
  'fixed',
  NULL,
  0,
  75,
  15,
  'active',
  NOW() - INTERVAL '3 days',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  fixed_price = EXCLUDED.fixed_price,
  updated_at = NOW();

-- ============================================================
-- VERIFICATION QUERIES (for debugging)
-- ============================================================
-- Run these queries to verify the test data:

-- Check test artworks
-- SELECT id, title, sale_type, current_price, fixed_price, auction_end_time, status
-- FROM artworks
-- WHERE title LIKE '[테스트]%'
-- ORDER BY created_at DESC;

-- Check test artist
-- SELECT id, name, username FROM artists WHERE username = 'test_artist';

-- ============================================
-- Clean up test data (run this after testing)
-- ============================================
-- DELETE FROM artworks WHERE title LIKE '[테스트]%';
-- DELETE FROM artists WHERE username = 'test_artist';
