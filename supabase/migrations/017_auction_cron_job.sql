-- Enable pg_cron extension for scheduled tasks
-- Note: pg_cron may not be available on all Supabase plans
-- Alternative: Use Supabase Dashboard Cron Jobs or Vercel Cron

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule auction processing to run every minute
-- This will automatically:
-- 1. Find expired auctions (auction_end_time < now())
-- 2. Create orders for highest bidders
-- 3. Mark artworks as 'sold'
SELECT cron.schedule(
  'process-expired-auctions',
  '* * * * *', -- Every minute
  $$SELECT process_expired_auctions()$$
);

-- Optional: Create audit log table to track cron job executions
CREATE TABLE IF NOT EXISTS public.auction_processing_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processed_count INTEGER NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  execution_time_ms INTEGER
);

-- Enable RLS on audit log
ALTER TABLE public.auction_processing_log ENABLE ROW LEVEL SECURITY;

-- Only admins/service role can view logs
CREATE POLICY "Service role can view auction processing logs"
  ON public.auction_processing_log
  FOR SELECT
  USING (auth.jwt()->>'role' = 'service_role');

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_auction_processing_log_executed_at
  ON public.auction_processing_log(executed_at DESC);

-- Modified version of process_expired_auctions() that logs execution
CREATE OR REPLACE FUNCTION process_expired_auctions_with_logging()
RETURNS TABLE(processed_count INT) AS $$
DECLARE
  auction_record RECORD;
  highest_bid RECORD;
  count INT := 0;
  start_time TIMESTAMPTZ;
  end_time TIMESTAMPTZ;
  execution_time INT;
BEGIN
  start_time := clock_timestamp();

  -- Find all active auctions that have ended
  FOR auction_record IN
    SELECT id, artist_id
    FROM public.artworks
    WHERE sale_type = 'auction'
    AND status = 'active'
    AND auction_end_time < now()
  LOOP
    -- Find the highest bid for this auction
    SELECT b.user_id, b.bid_amount
    INTO highest_bid
    FROM public.bids b
    WHERE b.artwork_id = auction_record.id
    ORDER BY b.bid_amount DESC
    LIMIT 1;

    -- If there's a highest bidder, create an order and mark as sold
    IF FOUND THEN
      -- Create order for the highest bidder
      INSERT INTO public.orders (user_id, artwork_id, order_type, price, status)
      VALUES (highest_bid.user_id, auction_record.id, 'auction', highest_bid.bid_amount, 'pending');

      -- Mark artwork as sold
      UPDATE public.artworks
      SET status = 'sold'
      WHERE id = auction_record.id;

      count := count + 1;
    END IF;
  END LOOP;

  end_time := clock_timestamp();
  execution_time := EXTRACT(MILLISECONDS FROM (end_time - start_time))::INT;

  -- Log execution
  INSERT INTO public.auction_processing_log (processed_count, execution_time_ms)
  VALUES (count, execution_time);

  RETURN QUERY SELECT count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION process_expired_auctions_with_logging() TO authenticated;
GRANT EXECUTE ON FUNCTION process_expired_auctions_with_logging() TO service_role;

-- Update cron job to use logging version
SELECT cron.unschedule('process-expired-auctions');
SELECT cron.schedule(
  'process-expired-auctions',
  '* * * * *',
  $$SELECT process_expired_auctions_with_logging()$$
);
