-- Add buyer_premium_rate column to bids table
-- This column stores the buyer's premium rate (e.g., 0.10 = 10%)
-- that was applied to the bid at the time of bidding

ALTER TABLE public.bids
ADD COLUMN buyer_premium_rate NUMERIC(5,4) DEFAULT 0.00;

-- Add comment for documentation
COMMENT ON COLUMN public.bids.buyer_premium_rate IS
'Buyer''s premium rate applied to this bid (e.g., 0.10 = 10%). Defaults to 0.00 for backwards compatibility with existing bids.';

-- Create index for potential queries filtering by premium rate
CREATE INDEX IF NOT EXISTS idx_bids_buyer_premium_rate
ON public.bids(buyer_premium_rate)
WHERE buyer_premium_rate > 0;
