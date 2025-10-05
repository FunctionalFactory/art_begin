-- Create order_type and order_status enums
CREATE TYPE order_type AS ENUM ('purchase', 'auction');
CREATE TYPE order_status AS ENUM ('pending', 'preparing', 'shipping', 'delivered', 'completed');

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  order_type order_type NOT NULL,
  price NUMERIC NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_artwork_id ON public.orders(artwork_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Artists can view orders for their artworks
CREATE POLICY "Artists can view orders for their artworks"
  ON public.orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.artworks a
      JOIN public.artists ar ON a.artist_id = ar.id
      WHERE a.id = orders.artwork_id
      AND ar.user_id = auth.uid()
    )
  );

-- Users can create orders for themselves
CREATE POLICY "Users can create their own orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Artists can update order status for their artworks
CREATE POLICY "Artists can update order status for their artworks"
  ON public.orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.artworks a
      JOIN public.artists ar ON a.artist_id = ar.id
      WHERE a.id = orders.artwork_id
      AND ar.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_orders_updated_at_trigger
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- Function to process expired auctions
CREATE OR REPLACE FUNCTION process_expired_auctions()
RETURNS TABLE(processed_count INT) AS $$
DECLARE
  auction_record RECORD;
  highest_bid RECORD;
  count INT := 0;
BEGIN
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

  RETURN QUERY SELECT count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION process_expired_auctions() TO authenticated;
