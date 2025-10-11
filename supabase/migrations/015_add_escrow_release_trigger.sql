-- ============================================
-- Migration 015: Add Escrow Auto-Release Trigger
-- Description: Automatically release escrow when a higher bid is placed
-- ============================================

-- ============================================
-- Function: Release previous escrow when new bid is placed
-- ============================================
CREATE OR REPLACE FUNCTION release_previous_escrow()
RETURNS TRIGGER AS $$
BEGIN
  -- Release escrow for all previous bids on this artwork
  -- Only release bids that have active escrow
  UPDATE public.bids
  SET
    escrow_status = 'released',
    escrow_released_at = NOW()
  WHERE
    artwork_id = NEW.artwork_id
    AND escrow_status = 'active'
    AND id != NEW.id;  -- Don't release the new bid

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION release_previous_escrow IS '새 입찰 시 이전 입찰의 에스크로를 자동으로 해제';

-- ============================================
-- Trigger: Auto-release escrow on new bid
-- ============================================
CREATE TRIGGER trigger_release_previous_escrow
  AFTER INSERT ON public.bids
  FOR EACH ROW
  WHEN (NEW.escrow_status = 'active')
  EXECUTE FUNCTION release_previous_escrow();

COMMENT ON TRIGGER trigger_release_previous_escrow ON public.bids IS '새 입찰 시 이전 에스크로 자동 해제 트리거';

-- ============================================
-- Test the trigger (optional, comment out in production)
-- ============================================
-- Insert a test bid to verify trigger works
-- This should release any existing active escrow for the same artwork
-- Example:
-- INSERT INTO public.bids (artwork_id, user_id, bid_amount, escrow_status, escrow_amount)
-- VALUES ('test-artwork-id', 'test-user-id', 100000, 'active', 115000);
