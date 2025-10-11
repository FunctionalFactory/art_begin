-- ============================================
-- Migration 014: Add Escrow System
-- Description: Implements escrow functionality to lock bid amounts
-- ============================================

-- ============================================
-- 1. Add escrow columns to bids table
-- ============================================
ALTER TABLE public.bids
ADD COLUMN escrow_status TEXT DEFAULT 'released' CHECK (escrow_status IN ('active', 'released', 'settled')),
ADD COLUMN escrow_amount BIGINT DEFAULT 0 CHECK (escrow_amount >= 0),
ADD COLUMN escrow_released_at TIMESTAMPTZ;

COMMENT ON COLUMN bids.escrow_status IS '에스크로 상태: active(활성), released(해제), settled(정산완료)';
COMMENT ON COLUMN bids.escrow_amount IS '에스크로로 묶인 금액 (입찰 시 설정)';
COMMENT ON COLUMN bids.escrow_released_at IS '에스크로 해제 시간';

-- Create index for efficient escrow queries
CREATE INDEX IF NOT EXISTS idx_bids_user_escrow ON public.bids(user_id, escrow_status);
CREATE INDEX IF NOT EXISTS idx_bids_artwork_escrow ON public.bids(artwork_id, escrow_status);

-- ============================================
-- 2. Function: get_user_escrow_total
-- Description: Calculate total active escrow amount for a user
-- ============================================
CREATE OR REPLACE FUNCTION get_user_escrow_total(
  p_user_id UUID
) RETURNS BIGINT AS $$
DECLARE
  v_escrow_total BIGINT;
BEGIN
  SELECT COALESCE(SUM(escrow_amount), 0) INTO v_escrow_total
  FROM public.bids
  WHERE user_id = p_user_id
    AND escrow_status = 'active';

  RETURN v_escrow_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_escrow_total IS '사용자의 활성 에스크로 총액 계산';

-- ============================================
-- 3. Function: get_user_available_balance
-- Description: Calculate available balance (total - escrow)
-- ============================================
CREATE OR REPLACE FUNCTION get_user_available_balance(
  p_user_id UUID
) RETURNS BIGINT AS $$
DECLARE
  v_total_balance BIGINT;
  v_escrow_total BIGINT;
BEGIN
  -- Get total balance
  SELECT balance INTO v_total_balance
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_total_balance IS NULL THEN
    RETURN 0;
  END IF;

  -- Get active escrow total
  v_escrow_total := get_user_escrow_total(p_user_id);

  -- Return available balance
  RETURN v_total_balance - v_escrow_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_available_balance IS '사용자의 사용 가능 잔고 계산 (전체 잔고 - 에스크로)';

-- ============================================
-- 4. Update place_bid_with_balance function
-- Description: Modify to use escrow instead of deducting balance
-- ============================================
CREATE OR REPLACE FUNCTION place_bid_with_balance(
  p_artwork_id UUID,
  p_bid_amount BIGINT,
  p_buyer_premium_rate NUMERIC
) RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_user_balance BIGINT;
  v_escrow_total BIGINT;
  v_available_balance BIGINT;
  v_artwork RECORD;
  v_min_bid BIGINT;
  v_bid_id UUID;
  v_previous_bid_id UUID;
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

  -- 3. Lock user profile and get balance
  SELECT balance INTO v_user_balance
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  -- 4. Calculate available balance (total - active escrow)
  v_escrow_total := get_user_escrow_total(v_user_id);
  v_available_balance := v_user_balance - v_escrow_total;

  -- 5. Check available balance
  IF v_available_balance < p_bid_amount THEN
    RETURN json_build_object(
      'success', false,
      'error', '사용 가능한 잔고가 부족합니다.',
      'requiredBalance', p_bid_amount,
      'currentBalance', v_user_balance,
      'escrowTotal', v_escrow_total,
      'availableBalance', v_available_balance
    );
  END IF;

  -- 6. Get and lock artwork
  SELECT * INTO v_artwork
  FROM public.artworks
  WHERE id = p_artwork_id
  FOR UPDATE;

  -- 7. Validate artwork exists
  IF v_artwork IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', '작품을 찾을 수 없습니다.'
    );
  END IF;

  -- 8. Check if artwork is auction type
  IF v_artwork.sale_type != 'auction' THEN
    RETURN json_build_object(
      'success', false,
      'error', '경매 작품이 아닙니다.'
    );
  END IF;

  -- 9. Check auction not ended
  IF v_artwork.auction_end_time IS NOT NULL AND NOW() > v_artwork.auction_end_time THEN
    RETURN json_build_object(
      'success', false,
      'error', '경매가 종료되었습니다.'
    );
  END IF;

  -- 10. Validate bid amount (minimum increment: 10,000)
  v_min_bid := COALESCE(v_artwork.current_price, 0) + 10000;
  IF p_bid_amount < v_min_bid THEN
    RETURN json_build_object(
      'success', false,
      'error', '입찰 금액이 최소 입찰가보다 낮습니다.',
      'minBidAmount', v_min_bid,
      'currentPrice', v_artwork.current_price
    );
  END IF;

  -- 11. Check if user has previous active bid for this artwork
  SELECT id INTO v_previous_bid_id
  FROM public.bids
  WHERE artwork_id = p_artwork_id
    AND user_id = v_user_id
    AND escrow_status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  -- 12. Release previous escrow if exists
  IF v_previous_bid_id IS NOT NULL THEN
    UPDATE public.bids
    SET escrow_status = 'released',
        escrow_released_at = NOW()
    WHERE id = v_previous_bid_id;
  END IF;

  -- 13. Insert new bid with active escrow
  INSERT INTO public.bids (
    artwork_id,
    user_id,
    bid_amount,
    buyer_premium_rate,
    escrow_status,
    escrow_amount
  ) VALUES (
    p_artwork_id,
    v_user_id,
    p_bid_amount,
    p_buyer_premium_rate,
    'active',
    p_bid_amount
  ) RETURNING id INTO v_bid_id;

  -- 14. Record transaction (no balance deduction, just for audit)
  INSERT INTO public.balance_transactions (
    user_id,
    amount,
    balance_after,
    transaction_type,
    reference_id,
    description
  ) VALUES (
    v_user_id,
    0,  -- No actual balance change, just escrow hold
    v_user_balance,
    'bid',
    v_bid_id,
    '입찰 (에스크로): ' || v_artwork.title
  );

  -- 15. Return success
  RETURN json_build_object(
    'success', true,
    'balance', v_user_balance,
    'escrowTotal', v_escrow_total + p_bid_amount,
    'availableBalance', v_available_balance - p_bid_amount,
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

COMMENT ON FUNCTION place_bid_with_balance IS '에스크로 방식으로 입찰 처리 (잔고는 차감하지 않고 에스크로로 묶음)';

-- ============================================
-- 5. Function: settle_auction
-- Description: Settle auction - winner's escrow becomes payment, others released
-- ============================================
CREATE OR REPLACE FUNCTION settle_auction(
  p_artwork_id UUID
) RETURNS JSON AS $$
DECLARE
  v_artwork RECORD;
  v_winning_bid RECORD;
  v_released_count INT := 0;
BEGIN
  -- 1. Get and lock artwork
  SELECT * INTO v_artwork
  FROM public.artworks
  WHERE id = p_artwork_id
  FOR UPDATE;

  -- 2. Validate artwork exists
  IF v_artwork IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', '작품을 찾을 수 없습니다.'
    );
  END IF;

  -- 3. Check if artwork is auction type
  IF v_artwork.sale_type != 'auction' THEN
    RETURN json_build_object(
      'success', false,
      'error', '경매 작품이 아닙니다.'
    );
  END IF;

  -- 4. Get winning bid (highest bid)
  SELECT * INTO v_winning_bid
  FROM public.bids
  WHERE artwork_id = p_artwork_id
    AND escrow_status = 'active'
  ORDER BY bid_amount DESC, created_at ASC
  LIMIT 1;

  -- 5. If no winning bid, release all escrows
  IF v_winning_bid IS NULL THEN
    UPDATE public.bids
    SET escrow_status = 'released',
        escrow_released_at = NOW()
    WHERE artwork_id = p_artwork_id
      AND escrow_status = 'active';

    GET DIAGNOSTICS v_released_count = ROW_COUNT;

    RETURN json_build_object(
      'success', true,
      'message', '입찰이 없어 모든 에스크로를 해제했습니다.',
      'releasedCount', v_released_count
    );
  END IF;

  -- 6. Settle winning bid (deduct balance and mark as settled)
  UPDATE public.profiles
  SET balance = balance - v_winning_bid.bid_amount
  WHERE id = v_winning_bid.user_id;

  UPDATE public.bids
  SET escrow_status = 'settled',
      escrow_released_at = NOW()
  WHERE id = v_winning_bid.id;

  -- 7. Record payment transaction
  INSERT INTO public.balance_transactions (
    user_id,
    amount,
    balance_after,
    transaction_type,
    reference_id,
    description
  ) VALUES (
    v_winning_bid.user_id,
    -v_winning_bid.bid_amount,
    (SELECT balance FROM profiles WHERE id = v_winning_bid.user_id),
    'bid',
    v_winning_bid.id,
    '낙찰 결제: ' || v_artwork.title
  );

  -- 8. Release all other active escrows for this artwork
  UPDATE public.bids
  SET escrow_status = 'released',
      escrow_released_at = NOW()
  WHERE artwork_id = p_artwork_id
    AND escrow_status = 'active'
    AND id != v_winning_bid.id;

  GET DIAGNOSTICS v_released_count = ROW_COUNT;

  -- 9. Return success
  RETURN json_build_object(
    'success', true,
    'message', '경매가 정산되었습니다.',
    'winningBidId', v_winning_bid.id,
    'winningUserId', v_winning_bid.user_id,
    'winningAmount', v_winning_bid.bid_amount,
    'releasedCount', v_released_count
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

COMMENT ON FUNCTION settle_auction IS '경매 종료 시 낙찰자 결제 처리 및 나머지 입찰자 에스크로 해제';

-- ============================================
-- 6. Grant execute permissions
-- ============================================
GRANT EXECUTE ON FUNCTION get_user_escrow_total TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_available_balance TO authenticated;
GRANT EXECUTE ON FUNCTION settle_auction TO authenticated;

-- Note: place_bid_with_balance already has GRANT from previous migration

-- ============================================
-- End of Migration 014
-- ============================================
