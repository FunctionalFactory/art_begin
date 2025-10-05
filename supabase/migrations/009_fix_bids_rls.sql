-- Fix infinite recursion in bids RLS policy
-- The previous policy "Anyone can view highest bids" caused infinite recursion
-- because it had a subquery that selected from the same table

-- Drop the problematic policy
DROP POLICY IF EXISTS "Anyone can view highest bids" ON public.bids;

-- Create a simple policy that allows anyone to view all bids
-- This is safe because:
-- 1. Bid amounts and timestamps are public information in auctions
-- 2. We anonymize user_id in the application layer (BidHistory component)
-- 3. Only the current user's own bids show their actual identity
CREATE POLICY "Anyone can view all bids for artworks"
  ON public.bids
  FOR SELECT
  USING (true);

-- Final RLS policies for bids table:
-- 1. "Users can view their own bids" - allows users to see their own bids
-- 2. "Anyone can view all bids for artworks" - allows viewing bid history (anonymized in app)
-- 3. "Authenticated users can insert their own bids" - allows placing bids
