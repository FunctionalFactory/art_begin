-- ============================================
-- Migration 016: Enable Realtime for Artworks and Bids
-- Description: Enables Realtime publication for artworks and bids tables
-- ============================================

-- Enable Realtime for artworks table
-- This allows clients to subscribe to real-time changes (INSERT, UPDATE, DELETE)
ALTER PUBLICATION supabase_realtime ADD TABLE public.artworks;

-- Enable Realtime for bids table
-- This allows clients to subscribe to new bids in real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;

-- ============================================
-- End of Migration 016
-- ============================================
