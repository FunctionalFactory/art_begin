import { createClient } from "@/utils/supabase/server";
import type { BidWithArtwork, BidStatus, Database } from "@/lib/types";

/**
 * Get all bids for a user with artwork and artist information
 */
export async function getBidsByUser(userId: string): Promise<BidWithArtwork[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bids")
    .select(
      `
      id,
      artwork_id,
      user_id,
      bid_amount,
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
    console.error("Error fetching user bids:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return [];
  }

  if (!data || data.length === 0) {
    // No bids found - this is normal for users who haven't bid yet
    return [];
  }

  // Transform nested arrays to objects
  return data.map((bid) => {
    const artwork = Array.isArray(bid.artwork) ? bid.artwork[0] : bid.artwork;
    const artist = artwork
      ? Array.isArray(artwork.artist)
        ? artwork.artist[0]
        : artwork.artist
      : null;

    return {
      id: bid.id,
      artwork_id: bid.artwork_id,
      user_id: bid.user_id,
      bid_amount: bid.bid_amount,
      created_at: bid.created_at,
      artwork: {
        ...artwork,
        artist: artist,
      },
    };
  }) as BidWithArtwork[];
}

/**
 * Get the highest bid for a specific artwork
 */
export async function getHighestBidForArtwork(
  artworkId: string
): Promise<Database.Bid | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bids")
    .select("*")
    .eq("artwork_id", artworkId)
    .order("bid_amount", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching highest bid:", error);
    return null;
  }

  return data;
}

/**
 * Get user's highest bid for a specific artwork
 */
export async function getUserBidForArtwork(
  userId: string | undefined,
  artworkId: string
): Promise<Database.Bid | null> {
  if (!userId) {
    return null;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bids")
    .select("*")
    .eq("user_id", userId)
    .eq("artwork_id", artworkId)
    .order("bid_amount", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user bid:", error);
    return null;
  }

  return data;
}

/**
 * Get user's bids with status (highest or outbid)
 * Returns bids with artwork info and whether user is highest bidder
 */
export async function getUserBidsWithStatus(
  userId: string
): Promise<
  Array<BidWithArtwork & { status: BidStatus; isHighestBidder: boolean }>
> {
  const bidsWithArtwork = await getBidsByUser(userId);

  // For each bid, check if it's the highest bid for that artwork
  const bidsWithStatus = await Promise.all(
    bidsWithArtwork.map(async (bid) => {
      const highestBid = await getHighestBidForArtwork(bid.artwork_id);

      const isHighestBidder =
        highestBid?.user_id === userId &&
        highestBid?.bid_amount === bid.bid_amount;

      const status: BidStatus = isHighestBidder ? "highest" : "outbid";

      return {
        ...bid,
        status,
        isHighestBidder,
      };
    })
  );

  return bidsWithStatus;
}

/**
 * Get unique artworks that user has bid on (one per artwork, showing user's highest bid)
 */
export async function getUserBidArtworks(
  userId: string
): Promise<
  Array<BidWithArtwork & { status: BidStatus; isHighestBidder: boolean }>
> {
  const allBidsWithStatus = await getUserBidsWithStatus(userId);

  // Group by artwork_id and keep only the highest bid per artwork
  const artworkMap = new Map<
    string,
    BidWithArtwork & { status: BidStatus; isHighestBidder: boolean }
  >();

  allBidsWithStatus.forEach((bid) => {
    const existingBid = artworkMap.get(bid.artwork_id);
    if (
      !existingBid ||
      bid.bid_amount > existingBid.bid_amount ||
      (bid.bid_amount === existingBid.bid_amount &&
        new Date(bid.created_at) > new Date(existingBid.created_at))
    ) {
      artworkMap.set(bid.artwork_id, bid);
    }
  });

  return Array.from(artworkMap.values()).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
