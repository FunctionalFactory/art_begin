-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, artwork_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_artwork_id ON public.favorites(artwork_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON public.favorites(created_at DESC);

-- RLS Policies for favorites table
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Users can view all favorites (needed for like counts)
CREATE POLICY "Favorites are viewable by everyone"
  ON public.favorites
  FOR SELECT
  USING (true);

-- Users can only insert their own favorites
CREATE POLICY "Users can insert their own favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own favorites
CREATE POLICY "Users can delete their own favorites"
  ON public.favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update artwork likes count
CREATE OR REPLACE FUNCTION update_artwork_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.artworks
    SET likes = likes + 1
    WHERE id = NEW.artwork_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.artworks
    SET likes = GREATEST(0, likes - 1)
    WHERE id = OLD.artwork_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update likes count
CREATE TRIGGER update_artwork_likes_on_favorite
  AFTER INSERT OR DELETE ON public.favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_artwork_likes_count();
