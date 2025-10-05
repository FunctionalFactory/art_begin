import { createClient } from "@/utils/supabase/server";
import type { FavoriteWithArtwork } from "@/lib/types";

/**
 * Get all favorites for a user with artwork and artist information
 */
export async function getFavoritesByUser(
  userId: string
): Promise<FavoriteWithArtwork[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("favorites")
    .select(
      `
      user_id,
      artwork_id,
      created_at,
      artwork:artworks (
        *,
        artist:artists (*)
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user favorites:", error);
    return [];
  }

  if (!data) {
    return [];
  }

  // Transform nested arrays to objects
  return data.map((fav) => {
    const artwork = Array.isArray(fav.artwork) ? fav.artwork[0] : fav.artwork;
    const artist = artwork ? (Array.isArray(artwork.artist) ? artwork.artist[0] : artwork.artist) : null;

    return {
      user_id: fav.user_id,
      artwork_id: fav.artwork_id,
      created_at: fav.created_at,
      artwork: {
        ...artwork,
        artist: artist,
      },
    };
  }) as FavoriteWithArtwork[];
}

/**
 * Check if a user has favorited a specific artwork
 */
export async function checkIsFavorited(
  userId: string | undefined,
  artworkId: string
): Promise<boolean> {
  if (!userId) {
    return false;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("favorites")
    .select("user_id")
    .eq("user_id", userId)
    .eq("artwork_id", artworkId)
    .maybeSingle();

  if (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }

  return !!data;
}

/**
 * Get a map of artwork IDs to favorite status for a user
 * Useful for batch checking multiple artworks
 */
export async function getUserFavoritesMap(
  userId: string | undefined,
  artworkIds: string[]
): Promise<Map<string, boolean>> {
  const favMap = new Map<string, boolean>();

  if (!userId || artworkIds.length === 0) {
    return favMap;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("favorites")
    .select("artwork_id")
    .eq("user_id", userId)
    .in("artwork_id", artworkIds);

  if (error) {
    console.error("Error fetching favorites map:", error);
    return favMap;
  }

  if (!data) {
    return favMap;
  }

  // Mark favorited artworks
  data.forEach((fav) => {
    favMap.set(fav.artwork_id, true);
  });

  // Set false for non-favorited artworks
  artworkIds.forEach((id) => {
    if (!favMap.has(id)) {
      favMap.set(id, false);
    }
  });

  return favMap;
}
