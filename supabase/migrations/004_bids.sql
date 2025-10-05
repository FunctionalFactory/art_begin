-- Create bids table
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bid_amount INTEGER NOT NULL CHECK (bid_amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bids_artwork_id ON public.bids(artwork_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON public.bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_bid_amount_desc ON public.bids(artwork_id, bid_amount DESC);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON public.bids(created_at DESC);

-- RLS Policies for bids table
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Users can view their own bids
CREATE POLICY "Users can view their own bids"
  ON public.bids
  FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can view the highest bid per artwork (for display purposes)
CREATE POLICY "Anyone can view highest bids"
  ON public.bids
  FOR SELECT
  USING (
    id IN (
      SELECT DISTINCT ON (artwork_id) id
      FROM public.bids
      ORDER BY artwork_id, bid_amount DESC, created_at DESC
    )
  );

-- Only authenticated users can insert their own bids
CREATE POLICY "Authenticated users can insert their own bids"
  ON public.bids
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update artwork after bid
CREATE OR REPLACE FUNCTION update_artwork_on_bid()
RETURNS TRIGGER AS $$
DECLARE
  highest_bid RECORD;
BEGIN
  -- Get the highest bid for this artwork
  SELECT user_id, bid_amount INTO highest_bid
  FROM public.bids
  WHERE artwork_id = NEW.artwork_id
  ORDER BY bid_amount DESC, created_at ASC
  LIMIT 1;

  -- Update artwork with new highest bid info
  UPDATE public.artworks
  SET
    current_price = highest_bid.bid_amount,
    highest_bidder = highest_bid.user_id,
    bid_count = (
      SELECT COUNT(DISTINCT user_id)
      FROM public.bids
      WHERE artwork_id = NEW.artwork_id
    )
  WHERE id = NEW.artwork_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update artwork on new bid
CREATE TRIGGER update_artwork_on_new_bid
  AFTER INSERT ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION update_artwork_on_bid();
