-- Enable Row Level Security
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Artists table policies
-- Allow everyone to read artists
CREATE POLICY "Artists are viewable by everyone"
  ON public.artists
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert artists
CREATE POLICY "Authenticated users can create artists"
  ON public.artists
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update their own artist profile
CREATE POLICY "Users can update their own artist profile"
  ON public.artists
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own artist profile
CREATE POLICY "Users can delete their own artist profile"
  ON public.artists
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Artworks table policies
-- Allow everyone to read artworks
CREATE POLICY "Artworks are viewable by everyone"
  ON public.artworks
  FOR SELECT
  USING (true);

-- Allow artists to insert artworks
CREATE POLICY "Artists can create artworks"
  ON public.artworks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.artists
      WHERE artists.id = artworks.artist_id
      AND artists.user_id = auth.uid()
    )
  );

-- Allow artists to update their own artworks
CREATE POLICY "Artists can update their own artworks"
  ON public.artworks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.artists
      WHERE artists.id = artworks.artist_id
      AND artists.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.artists
      WHERE artists.id = artworks.artist_id
      AND artists.user_id = auth.uid()
    )
  );

-- Allow artists to delete their own artworks
CREATE POLICY "Artists can delete their own artworks"
  ON public.artworks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.artists
      WHERE artists.id = artworks.artist_id
      AND artists.user_id = auth.uid()
    )
  );

-- Profiles table policies
-- Allow everyone to read profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can create their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);
