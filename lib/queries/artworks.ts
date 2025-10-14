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

/**
 * Get related artworks by the same artist (excluding current artwork)
 */
export async function getRelatedArtworksByArtist(
  artistId: string,
  currentArtworkId: string,
  limit: number = 4
): Promise<ArtworkWithArtist[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('artworks')
    .select(`
      *,
      artist:artists (*)
    `)
    .eq('artist_id', artistId)
    .eq('status', 'active')
    .neq('id', currentArtworkId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related artworks by artist:', error);
    return [];
  }

  // Transform the data to match ArtworkWithArtist type
  return (data || []).map((artwork) => ({
    ...artwork,
    artist: Array.isArray(artwork.artist) ? artwork.artist[0] : artwork.artist,
  })) as ArtworkWithArtist[];
}

/**
 * Get related artworks by the same category (excluding current artwork)
 */
export async function getRelatedArtworksByCategory(
  category: string,
  currentArtworkId: string,
  limit: number = 4
): Promise<ArtworkWithArtist[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('artworks')
    .select(`
      *,
      artist:artists (*)
    `)
    .eq('category', category)
    .eq('status', 'active')
    .neq('id', currentArtworkId)
    .order('likes', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related artworks by category:', error);
    return [];
  }

  // Transform the data to match ArtworkWithArtist type
  return (data || []).map((artwork) => ({
    ...artwork,
    artist: Array.isArray(artwork.artist) ? artwork.artist[0] : artwork.artist,
  })) as ArtworkWithArtist[];
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

/**
 * Get artworks by artist user ID (not artist_id from artists table)
 * First gets the artist record, then fetches artworks
 */
export async function getArtworksByArtistUserId(userId: string): Promise<ArtworkWithArtist[]> {
  const supabase = await createClient();

  // First, find the artist record for this user
  const { data: artist, error: artistError } = await supabase
    .from('artists')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (artistError || !artist) {
    console.error('Error fetching artist for user:', artistError);
    return [];
  }

  // Then fetch artworks for this artist
  const { data, error } = await supabase
    .from('artworks')
    .select(`
      *,
      artist:artists (*)
    `)
    .eq('artist_id', artist.id)
    .order('created_at', { ascending: false});

  if (error) {
    console.error('Error fetching artworks by user ID:', error);
    return [];
  }

  return (data || []).map((artwork) => ({
    ...artwork,
    artist: Array.isArray(artwork.artist) ? artwork.artist[0] : artwork.artist,
  })) as ArtworkWithArtist[];
}

/**
 * Create new artwork
 */
export async function createArtwork(artworkData: {
  artist_id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  sale_type: 'auction' | 'fixed';
  fixed_price?: number;
  current_price?: number;
  auction_end_time?: string;
}): Promise<{ success: boolean; data?: Database.Artwork; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('artworks')
    .insert(artworkData)
    .select()
    .single();

  if (error) {
    console.error('Error creating artwork:', error);
    return {
      success: false,
      error: '작품 등록 중 오류가 발생했습니다.',
    };
  }

  return {
    success: true,
    data,
  };
}

/**
 * Update artwork
 */
export async function updateArtwork(
  artworkId: string,
  artworkData: Partial<{
    title: string;
    description: string;
    image_url: string;
    category: string;
    sale_type: 'auction' | 'fixed';
    fixed_price: number;
    current_price: number;
    auction_end_time: string;
    status: 'active' | 'sold' | 'upcoming';
  }>
): Promise<{ success: boolean; data?: Database.Artwork; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('artworks')
    .update(artworkData)
    .eq('id', artworkId)
    .select()
    .single();

  if (error) {
    console.error('Error updating artwork:', error);
    return {
      success: false,
      error: '작품 수정 중 오류가 발생했습니다.',
    };
  }

  return {
    success: true,
    data,
  };
}

/**
 * Check if artwork can be deleted
 */
export async function canDeleteArtwork(
  artworkId: string
): Promise<{ canDelete: boolean; reason?: string }> {
  const supabase = await createClient();

  // 1. Get artwork information
  const artwork = await getArtworkById(artworkId);
  if (!artwork) {
    return { canDelete: false, reason: '작품을 찾을 수 없습니다.' };
  }

  // 2. Check if artwork is sold
  if (artwork.status === 'sold') {
    return { canDelete: false, reason: '이미 판매 완료된 작품은 삭제할 수 없습니다.' };
  }

  // 3. Check if auction has bids
  if (artwork.sale_type === 'auction' && artwork.bid_count > 0) {
    return { canDelete: false, reason: '경매 진행 중인 작품은 삭제할 수 없습니다. 입찰자가 있습니다.' };
  }

  // 4. Check if orders exist for this artwork
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id')
    .eq('artwork_id', artworkId)
    .limit(1);

  if (ordersError) {
    console.error('Error checking orders:', ordersError);
    return { canDelete: false, reason: '작품 삭제 가능 여부를 확인하는 중 오류가 발생했습니다.' };
  }

  if (orders && orders.length > 0) {
    return { canDelete: false, reason: '주문이 존재하는 작품은 삭제할 수 없습니다.' };
  }

  return { canDelete: true };
}

/**
 * Delete artwork
 */
export async function deleteArtwork(
  artworkId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Check if artwork can be deleted
  const { canDelete, reason } = await canDeleteArtwork(artworkId);
  if (!canDelete) {
    return {
      success: false,
      error: reason || '작품을 삭제할 수 없습니다.',
    };
  }

  const { error } = await supabase
    .from('artworks')
    .delete()
    .eq('id', artworkId);

  if (error) {
    console.error('Error deleting artwork:', error);
    return {
      success: false,
      error: '작품 삭제 중 오류가 발생했습니다.',
    };
  }

  return {
    success: true,
  };
}

/**
 * Search artworks with advanced filters
 */
export async function searchArtworks(params: {
  searchQuery?: string;
  category?: string;
  saleType?: string;
  priceMin?: number;
  priceMax?: number;
  artistId?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}): Promise<{ artworks: ArtworkWithArtist[]; totalCount: number }> {
  const supabase = await createClient();

  const {
    searchQuery,
    category,
    saleType,
    priceMin,
    priceMax,
    artistId,
    sortBy = 'latest',
    page = 1,
    limit = 12,
  } = params;

  // Build query
  let query = supabase
    .from('artworks')
    .select(`
      *,
      artist:artists (*)
    `, { count: 'exact' })
    .eq('status', 'active');

  // Full-text search
  if (searchQuery && searchQuery.trim()) {
    query = query.textSearch('search_vector', searchQuery.trim(), {
      type: 'websearch',
      config: 'english',
    });
  }

  // Category filter
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  // Sale type filter
  if (saleType && saleType !== 'all') {
    query = query.eq('sale_type', saleType);
  }

  // Price range filter
  if (priceMin !== undefined || priceMax !== undefined) {
    // For auction items, filter by current_price
    // For fixed items, filter by fixed_price
    if (saleType === 'auction') {
      if (priceMin !== undefined) {
        query = query.gte('current_price', priceMin);
      }
      if (priceMax !== undefined) {
        query = query.lte('current_price', priceMax);
      }
    } else if (saleType === 'fixed') {
      if (priceMin !== undefined) {
        query = query.gte('fixed_price', priceMin);
      }
      if (priceMax !== undefined) {
        query = query.lte('fixed_price', priceMax);
      }
    } else {
      // Filter both types
      if (priceMin !== undefined) {
        query = query.or(`current_price.gte.${priceMin},fixed_price.gte.${priceMin}`);
      }
      if (priceMax !== undefined) {
        query = query.or(`current_price.lte.${priceMax},fixed_price.lte.${priceMax}`);
      }
    }
  }

  // Artist filter
  if (artistId) {
    query = query.eq('artist_id', artistId);
  }

  // Sorting
  switch (sortBy) {
    case 'latest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'popular':
      query = query.order('likes', { ascending: false });
      break;
    case 'price-low':
      query = query.order('current_price', { ascending: true, nullsFirst: false })
        .order('fixed_price', { ascending: true, nullsFirst: false });
      break;
    case 'price-high':
      query = query.order('current_price', { ascending: false, nullsFirst: false })
        .order('fixed_price', { ascending: false, nullsFirst: false });
      break;
    case 'ending-soon':
      query = query.eq('sale_type', 'auction')
        .not('auction_end_time', 'is', null)
        .order('auction_end_time', { ascending: true });
      break;
    case 'most-bids':
      query = query.order('bid_count', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  // Pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error searching artworks:', error);
    return { artworks: [], totalCount: 0 };
  }

  // Transform the data to match ArtworkWithArtist type
  const artworks = (data || []).map((artwork) => ({
    ...artwork,
    artist: Array.isArray(artwork.artist) ? artwork.artist[0] : artwork.artist,
  })) as ArtworkWithArtist[];

  return {
    artworks,
    totalCount: count || 0,
  };
}
