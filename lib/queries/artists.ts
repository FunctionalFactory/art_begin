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
