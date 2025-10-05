-- Add images JSONB column to artworks table
-- This allows storing multiple images per artwork while maintaining backward compatibility

-- Add images column (nullable for backward compatibility)
ALTER TABLE public.artworks
ADD COLUMN IF NOT EXISTS images JSONB;

-- Create a function to migrate existing image_url to images array
CREATE OR REPLACE FUNCTION migrate_image_url_to_images()
RETURNS void AS $$
BEGIN
  -- Update all artworks that have image_url but no images
  UPDATE public.artworks
  SET images = jsonb_build_array(image_url)
  WHERE image_url IS NOT NULL
    AND (images IS NULL OR images = '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Execute the migration function
SELECT migrate_image_url_to_images();

-- Create index for better query performance on images
CREATE INDEX IF NOT EXISTS idx_artworks_images ON public.artworks USING GIN (images);

-- Add comment for documentation
COMMENT ON COLUMN public.artworks.images IS 'Array of image URLs for the artwork. First image is typically the main/featured image.';
