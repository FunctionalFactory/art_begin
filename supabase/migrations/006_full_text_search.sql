-- Add Full-Text Search support for artworks

-- Add search_vector column for full-text search
ALTER TABLE public.artworks
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_artwork_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
DROP TRIGGER IF EXISTS artwork_search_vector_update ON public.artworks;
CREATE TRIGGER artwork_search_vector_update
  BEFORE INSERT OR UPDATE ON public.artworks
  FOR EACH ROW
  EXECUTE FUNCTION update_artwork_search_vector();

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_artworks_search_vector
  ON public.artworks USING GIN (search_vector);

-- Update existing rows with search vector
UPDATE public.artworks
SET search_vector =
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B');
