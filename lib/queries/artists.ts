import { createClient } from '@/utils/supabase/server';
import type { Database } from '@/lib/types';

export async function getArtistById(id: string): Promise<Database.Artist | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching artist:', error);
    return null;
  }

  return data;
}

export async function getArtistByUsername(username: string): Promise<Database.Artist | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    console.error('Error fetching artist by username:', error);
    return null;
  }

  return data;
}

export async function getAllArtists(): Promise<Database.Artist[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching all artists:', error);
    return [];
  }

  return data || [];
}

export async function getArtistByUserId(userId: string): Promise<Database.Artist | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching artist by user ID:', error);
    return null;
  }

  return data;
}

export async function createArtist(artistData: {
  user_id: string;
  name: string;
  username: string;
  bio?: string;
  profile_image?: string;
}): Promise<{ success: boolean; data?: Database.Artist; error?: string }> {
  const supabase = await createClient();

  // Check if artist with this user_id already exists
  const existing = await getArtistByUserId(artistData.user_id);
  if (existing) {
    return {
      success: false,
      error: '이미 작가 프로필이 존재합니다.',
    };
  }

  // Check if username is already taken
  const existingUsername = await getArtistByUsername(artistData.username);
  if (existingUsername) {
    return {
      success: false,
      error: '이 사용자명은 이미 사용 중입니다.',
    };
  }

  const { data, error } = await supabase
    .from('artists')
    .insert(artistData)
    .select()
    .single();

  if (error) {
    console.error('Error creating artist:', error);
    return {
      success: false,
      error: '작가 프로필 생성 중 오류가 발생했습니다.',
    };
  }

  return {
    success: true,
    data,
  };
}

export async function updateArtist(
  artistId: string,
  artistData: Partial<{
    name: string;
    username: string;
    bio: string;
    profile_image: string;
  }>
): Promise<{ success: boolean; data?: Database.Artist; error?: string }> {
  const supabase = await createClient();

  // Check if username is already taken (if username is being updated)
  if (artistData.username) {
    const existingArtist = await getArtistByUsername(artistData.username);
    if (existingArtist && existingArtist.id !== artistId) {
      return {
        success: false,
        error: '이 사용자명은 이미 사용 중입니다.',
      };
    }
  }

  const { data, error } = await supabase
    .from('artists')
    .update(artistData)
    .eq('id', artistId)
    .select()
    .single();

  if (error) {
    console.error('Error updating artist:', error);
    return {
      success: false,
      error: '작가 프로필 수정 중 오류가 발생했습니다.',
    };
  }

  return {
    success: true,
    data,
  };
}

/**
 * Get artist's earnings summary
 * @param artistId - Artist's ID
 * @returns Total earnings, withdrawable amount, and total sales count
 */
export async function getArtistEarnings(artistId: string): Promise<{
  totalEarnings: number;
  withdrawableAmount: number;
  totalSales: number;
}> {
  const supabase = await createClient();

  // Get all artworks by this artist
  const { data: artworks, error: artworksError } = await supabase
    .from('artworks')
    .select('id')
    .eq('artist_id', artistId);

  if (artworksError || !artworks) {
    console.error('Error fetching artist artworks:', artworksError);
    return { totalEarnings: 0, withdrawableAmount: 0, totalSales: 0 };
  }

  const artworkIds = artworks.map((a) => a.id);

  if (artworkIds.length === 0) {
    return { totalEarnings: 0, withdrawableAmount: 0, totalSales: 0 };
  }

  // Get all completed orders for these artworks
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('price')
    .in('artwork_id', artworkIds)
    .eq('status', 'completed');

  if (ordersError) {
    console.error('Error fetching artist sales:', ordersError);
    return { totalEarnings: 0, withdrawableAmount: 0, totalSales: 0 };
  }

  const totalEarnings = orders?.reduce((sum, order) => sum + order.price, 0) || 0;

  return {
    totalEarnings,
    withdrawableAmount: totalEarnings, // For now, all earnings are withdrawable
    totalSales: orders?.length || 0,
  };
}
