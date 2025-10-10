-- ============================================
-- Migration 013: Add Balance System
-- Description: Implements user balance management for auction bidding
-- ============================================

-- ============================================
-- 1. Add balance column to profiles table
-- ============================================
ALTER TABLE public.profiles
ADD COLUMN balance BIGINT DEFAULT 1000000 CHECK (balance >= 0);

COMMENT ON COLUMN profiles.balance IS '사용자 잔고 (단위: 원, 초기값: 1,000,000원)';

CREATE INDEX IF NOT EXISTS idx_profiles_balance ON public.profiles(balance);

-- ============================================
-- 2. Create balance_transactions table
-- ============================================
CREATE TABLE IF NOT EXISTS public.balance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,  -- Positive: deposit, Negative: deduction
  balance_after BIGINT NOT NULL,  -- Balance after transaction (audit trail)
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'bid', 'refund')),
  reference_id UUID,  -- Reference to bid_id, order_id, etc.
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE balance_transactions IS '잔고 거래 내역 (충전, 입찰, 환불)';
COMMENT ON COLUMN balance_transactions.amount IS '거래 금액 (양수: 충전, 음수: 차감)';
COMMENT ON COLUMN balance_transactions.balance_after IS '거래 후 잔고 (감사 목적)';
COMMENT ON COLUMN balance_transactions.transaction_type IS '거래 유형: deposit(충전), bid(입찰), refund(환불)';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_balance_transactions_user_id ON balance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_created_at ON balance_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_type ON balance_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_reference ON balance_transactions(reference_id) WHERE reference_id IS NOT NULL;

-- ============================================
-- 3. RLS Policies for balance_transactions
-- ============================================
ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own transactions
CREATE POLICY "Users can view their own balance transactions"
  ON public.balance_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only system (via RPC) can insert transactions
CREATE POLICY "System can insert balance transactions"
  ON public.balance_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. Function: deposit_balance
-- Description: Deposits money into user's balance
-- ============================================
CREATE OR REPLACE FUNCTION deposit_balance(
  p_amount BIGINT,
  p_description TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_new_balance BIGINT;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();

  -- Check authentication
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  IF p_amount > 100000000 THEN
    RAISE EXCEPTION 'Maximum deposit amount is 100,000,000';
  END IF;

  -- Update balance with row lock (prevents concurrent deposits)
  UPDATE public.profiles
  SET balance = balance + p_amount
  WHERE id = v_user_id
  RETURNING balance INTO v_new_balance;

  -- Check if profile exists
  IF v_new_balance IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  -- Record transaction
  INSERT INTO public.balance_transactions (
    user_id,
    amount,
    balance_after,
    transaction_type,
    description
  ) VALUES (
    v_user_id,
    p_amount,
    v_new_balance,
    'deposit',
    COALESCE(p_description, '잔고 충전')
  );

  -- Return success
  RETURN json_build_object(
    'success', true,
    'balance', v_new_balance,
    'amount', p_amount
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Return error
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION deposit_balance IS '사용자 잔고 충전 함수 (원자적 트랜잭션)';

-- ============================================
-- 5. Function: place_bid_with_balance
-- Description: Places bid with balance check and deduction
-- ============================================
CREATE OR REPLACE FUNCTION place_bid_with_balance(
  p_artwork_id UUID,
  p_bid_amount BIGINT,
  p_buyer_premium_rate NUMERIC
) RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_user_balance BIGINT;
  v_artwork RECORD;
  v_min_bid BIGINT;
  v_new_balance BIGINT;
  v_bid_id UUID;
BEGIN
  -- 1. Get authenticated user
  v_user_id := auth.uid();

  -- 2. Check authentication
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', '로그인이 필요합니다.'
    );
  END IF;

  -- 3. Lock user profile and get balance (prevents concurrent bids)
  SELECT balance INTO v_user_balance
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  -- 4. Check balance
  IF v_user_balance < p_bid_amount THEN
    RETURN json_build_object(
      'success', false,
      'error', '잔고가 부족합니다.',
      'requiredBalance', p_bid_amount,
      'currentBalance', v_user_balance
    );
  END IF;

  -- 5. Get and lock artwork
  SELECT * INTO v_artwork
  FROM public.artworks
  WHERE id = p_artwork_id
  FOR UPDATE;

  -- 6. Validate artwork exists
  IF v_artwork IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', '작품을 찾을 수 없습니다.'
    );
  END IF;

  -- 7. Check if artwork is auction type
  IF v_artwork.sale_type != 'auction' THEN
    RETURN json_build_object(
      'success', false,
      'error', '경매 작품이 아닙니다.'
    );
  END IF;

  -- 8. Check auction not ended
  IF v_artwork.auction_end_time IS NOT NULL AND NOW() > v_artwork.auction_end_time THEN
    RETURN json_build_object(
      'success', false,
      'error', '경매가 종료되었습니다.'
    );
  END IF;

  -- 9. Validate bid amount (minimum increment: 10,000)
  v_min_bid := COALESCE(v_artwork.current_price, 0) + 10000;
  IF p_bid_amount < v_min_bid THEN
    RETURN json_build_object(
      'success', false,
      'error', '입찰 금액이 최소 입찰가보다 낮습니다.',
      'minBidAmount', v_min_bid,
      'currentPrice', v_artwork.current_price
    );
  END IF;

  -- 10. Deduct balance
  UPDATE public.profiles
  SET balance = balance - p_bid_amount
  WHERE id = v_user_id
  RETURNING balance INTO v_new_balance;

  -- 11. Insert bid record
  INSERT INTO public.bids (
    artwork_id,
    user_id,
    bid_amount,
    buyer_premium_rate
  ) VALUES (
    p_artwork_id,
    v_user_id,
    p_bid_amount,
    p_buyer_premium_rate
  ) RETURNING id INTO v_bid_id;

  -- 12. Record transaction
  INSERT INTO public.balance_transactions (
    user_id,
    amount,
    balance_after,
    transaction_type,
    reference_id,
    description
  ) VALUES (
    v_user_id,
    -p_bid_amount,  -- Negative for deduction
    v_new_balance,
    'bid',
    v_bid_id,
    '입찰: ' || v_artwork.title
  );

  -- 13. Return success (artwork update handled by existing trigger)
  RETURN json_build_object(
    'success', true,
    'balance', v_new_balance,
    'bid_id', v_bid_id,
    'message', '입찰이 완료되었습니다!'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Return error (transaction will be rolled back)
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION place_bid_with_balance IS '잔고 확인 및 차감을 포함한 입찰 함수 (원자적 트랜잭션)';

-- ============================================
-- 6. Grant execute permissions
-- ============================================
GRANT EXECUTE ON FUNCTION deposit_balance TO authenticated;
GRANT EXECUTE ON FUNCTION place_bid_with_balance TO authenticated;

-- ============================================
-- End of Migration 013
-- ============================================
