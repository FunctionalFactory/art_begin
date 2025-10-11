-- E2E Test Seed Data for ART-XHIBIT
-- This file contains test data for E2E testing, including test users, balances, and escrow bids

-- ============================================================
-- TEST USERS
-- ============================================================
-- Note: These users need to be created via Supabase Auth first
-- The following profiles will be linked to auth.users

-- Test User 1: Has balance with active escrow
-- Auth email: test1@example.com / password: TestUser123!
INSERT INTO public.profiles (id, username, display_name, bio, balance, created_at, updated_at) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'test_user_1',
  '테스트 사용자 1',
  'E2E 테스트용 사용자 계정 (에스크로 활성)',
  500000, -- 50만원 전체 잔고
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  balance = EXCLUDED.balance,
  updated_at = NOW();

-- Test User 2: Has balance without escrow
-- Auth email: test2@example.com / password: TestUser123!
INSERT INTO public.profiles (id, username, display_name, bio, balance, created_at, updated_at) VALUES
(
  '22222222-2222-2222-2222-222222222222',
  'test_user_2',
  '테스트 사용자 2',
  'E2E 테스트용 사용자 계정 (에스크로 없음)',
  1000000, -- 100만원 전체 잔고
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  balance = EXCLUDED.balance,
  updated_at = NOW();

-- Test User 3: Has no balance
-- Auth email: test3@example.com / password: TestUser123!
INSERT INTO public.profiles (id, username, display_name, bio, balance, created_at, updated_at) VALUES
(
  '33333333-3333-3333-3333-333333333333',
  'test_user_3',
  '테스트 사용자 3',
  'E2E 테스트용 사용자 계정 (잔고 없음)',
  0,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  balance = EXCLUDED.balance,
  updated_at = NOW();

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
-- TEST BIDS with ESCROW
-- ============================================================

-- Active escrow bid for Test User 1 on Artwork 1
-- Bid amount: 150,000 (현재가)
-- Buyer premium (15%): 22,500
-- Total escrow: 172,500
INSERT INTO public.bids (
  id, artwork_id, user_id, bid_amount, buyer_premium_rate,
  escrow_status, escrow_amount, escrow_released_at, created_at
) VALUES
(
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  150000,
  0.15, -- 15% 구매자 수수료
  'active', -- 활성 에스크로
  172500, -- 150000 * 1.15 = 172,500
  NULL,
  NOW() - INTERVAL '30 minutes'
)
ON CONFLICT (id) DO UPDATE SET
  escrow_status = EXCLUDED.escrow_status,
  escrow_amount = EXCLUDED.escrow_amount,
  updated_at = NOW();

-- Active escrow bid for Test User 1 on Artwork 2
-- Bid amount: 300,000 (현재가)
-- Buyer premium (15%): 45,000
-- Total escrow: 345,000
INSERT INTO public.bids (
  id, artwork_id, user_id, bid_amount, buyer_premium_rate,
  escrow_status, escrow_amount, escrow_released_at, created_at
) VALUES
(
  'gggggggg-gggg-gggg-gggg-gggggggggggg',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '11111111-1111-1111-1111-111111111111',
  300000,
  0.15,
  'active', -- 활성 에스크로
  345000, -- 300000 * 1.15 = 345,000
  NULL,
  NOW() - INTERVAL '1 hour'
)
ON CONFLICT (id) DO UPDATE SET
  escrow_status = EXCLUDED.escrow_status,
  escrow_amount = EXCLUDED.escrow_amount,
  updated_at = NOW();

-- Old bid that was outbid (escrow released)
INSERT INTO public.bids (
  id, artwork_id, user_id, bid_amount, buyer_premium_rate,
  escrow_status, escrow_amount, escrow_released_at, created_at
) VALUES
(
  'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  140000,
  0.15,
  'released', -- 에스크로 해제됨 (다른 사람이 더 높은 입찰)
  161000, -- 140000 * 1.15 = 161,000
  NOW() - INTERVAL '25 minutes', -- 5분 전에 해제
  NOW() - INTERVAL '2 hours'
)
ON CONFLICT (id) DO UPDATE SET
  escrow_status = EXCLUDED.escrow_status,
  escrow_amount = EXCLUDED.escrow_amount,
  escrow_released_at = EXCLUDED.escrow_released_at,
  updated_at = NOW();

-- ============================================================
-- SUMMARY FOR TEST USER 1
-- ============================================================
-- Total Balance: 500,000원
-- Active Escrow: 517,500원 (172,500 + 345,000)
-- Available Balance: 500,000 - 517,500 = -17,500원 (over-committed, but RPC should handle this)
--
-- Note: 이 상태는 비정상적이지만, 테스트를 위해 의도적으로 설정했습니다.
-- 실제 시스템에서는 사용 가능 잔고가 부족하면 입찰이 차단되어야 합니다.

-- ============================================================
-- BALANCE ADJUSTMENT FOR REALISTIC TEST
-- ============================================================
-- Test User 1의 잔고를 충분히 증가시켜서 현실적인 테스트 가능하도록 조정
UPDATE public.profiles
SET balance = 600000, updated_at = NOW()
WHERE id = '11111111-1111-1111-1111-111111111111';

-- ============================================================
-- EXPECTED RESULTS FOR E2E TESTS
-- ============================================================
-- Test User 1:
--   Total Balance: 600,000원
--   Escrow Total: 517,500원 (172,500 + 345,000)
--   Available Balance: 82,500원
--
-- Test User 2:
--   Total Balance: 1,000,000원
--   Escrow Total: 0원
--   Available Balance: 1,000,000원
--
-- Test User 3:
--   Total Balance: 0원
--   Escrow Total: 0원
--   Available Balance: 0원

-- ============================================================
-- TRANSACTION HISTORY (for balance history page)
-- ============================================================
INSERT INTO public.transactions (
  id, user_id, type, amount, description, balance_after, created_at
) VALUES
(
  'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii',
  '11111111-1111-1111-1111-111111111111',
  'deposit',
  500000,
  '초기 잔고 충전',
  500000,
  NOW() - INTERVAL '3 days'
),
(
  'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj',
  '11111111-1111-1111-1111-111111111111',
  'deposit',
  100000,
  '추가 잔고 충전',
  600000,
  NOW() - INTERVAL '2 days'
),
(
  'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk',
  '22222222-2222-2222-2222-222222222222',
  'deposit',
  1000000,
  '초기 잔고 충전',
  1000000,
  NOW() - INTERVAL '5 days'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- VERIFICATION QUERIES (for debugging)
-- ============================================================
-- Run these queries to verify the test data:

-- Check test users
-- SELECT id, username, full_name, balance FROM profiles WHERE username LIKE 'test_user_%';

-- Check test artworks
-- SELECT id, title, sale_type, current_price, fixed_price, auction_end_time FROM artworks WHERE title LIKE '[테스트]%';

-- Check test bids with escrow
-- SELECT b.id, b.artwork_id, b.user_id, b.bid_amount, b.escrow_status, b.escrow_amount, a.title
-- FROM bids b
-- JOIN artworks a ON b.artwork_id = a.id
-- WHERE b.user_id LIKE 'test%'
-- ORDER BY b.created_at DESC;

-- Check escrow totals for test users
-- SELECT
--   p.username,
--   p.balance as total_balance,
--   COALESCE(SUM(b.escrow_amount) FILTER (WHERE b.escrow_status = 'active'), 0) as escrow_total,
--   p.balance - COALESCE(SUM(b.escrow_amount) FILTER (WHERE b.escrow_status = 'active'), 0) as available_balance
-- FROM profiles p
-- LEFT JOIN bids b ON p.id = b.user_id
-- WHERE p.username LIKE 'test_user_%'
-- GROUP BY p.id, p.username, p.balance;
