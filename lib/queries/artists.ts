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
