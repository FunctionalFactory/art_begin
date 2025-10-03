import { createClient } from '@/utils/supabase/server';
import type { Database, ArtworkWithArtist } from '@/lib/types';

export async function getArtworkById(id: string): Promise<ArtworkWithArtist | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('artworks')
    .select(`
      *,
      artist:artists (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching artwork:', error);
    return null;
  }

  // Transform the data to match ArtworkWithArtist type
  if (data && data.artist) {
    return {
      ...data,
      artist: Array.isArray(data.artist) ? data.artist[0] : data.artist,
    } as ArtworkWithArtist;
  }

  return null;
}

export async function getArtworksByArtist(artistId: string): Promise<Database.Artwork[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching artworks by artist:', error);
    return [];
  }

  return data || [];
}

export async function getFeaturedArtworks(): Promise<ArtworkWithArtist[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('artworks')
    .select(`
      *,
      artist:artists (*)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Error fetching featured artworks:', error);
    return [];
  }

  // Transform the data to match ArtworkWithArtist type
  return (data || []).map((artwork) => ({
    ...artwork,
    artist: Array.isArray(artwork.artist) ? artwork.artist[0] : artwork.artist,
  })) as ArtworkWithArtist[];
}

export async function getEndingSoonArtworks(): Promise<ArtworkWithArtist[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('artworks')
    .select(`
      *,
      artist:artists (*)
    `)
    .eq('sale_type', 'auction')
    .eq('status', 'active')
    .not('auction_end_time', 'is', null)
    .order('auction_end_time', { ascending: true })
    .limit(4);

  if (error) {
    console.error('Error fetching ending soon artworks:', error);
    return [];
  }

  // Transform the data to match ArtworkWithArtist type
  return (data || []).map((artwork) => ({
    ...artwork,
    artist: Array.isArray(artwork.artist) ? artwork.artist[0] : artwork.artist,
  })) as ArtworkWithArtist[];
}

export async function getAllArtworks(): Promise<ArtworkWithArtist[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('artworks')
    .select(`
      *,
      artist:artists (*)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all artworks:', error);
    return [];
  }

  // Transform the data to match ArtworkWithArtist type
  return (data || []).map((artwork) => ({
    ...artwork,
    artist: Array.isArray(artwork.artist) ? artwork.artist[0] : artwork.artist,
  })) as ArtworkWithArtist[];
}
