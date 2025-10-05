// Transform database types to legacy application types for backwards compatibility

import type { Database, ArtworkWithArtist, ArtistWithStats } from '@/lib/types';
import type { Artwork, Artist } from '@/lib/data';

export function transformArtworkToLegacy(
  dbArtwork: ArtworkWithArtist,
  isLiked?: boolean,
  userBidAmount?: number,
  userBidStatus?: 'highest' | 'outbid'
): Artwork {
  return {
    id: dbArtwork.id,
    title: dbArtwork.title,
    artistId: dbArtwork.artist_id,
    artistName: dbArtwork.artist.name,
    artistUsername: dbArtwork.artist.username,
    imageUrl: dbArtwork.image_url,
    description: dbArtwork.description || '',
    category: dbArtwork.category,
    currentPrice: dbArtwork.current_price ?? undefined,
    fixedPrice: dbArtwork.fixed_price ?? undefined,
    saleType: dbArtwork.sale_type,
    auctionEndTime: dbArtwork.auction_end_time ? new Date(dbArtwork.auction_end_time) : undefined,
    highestBidder: dbArtwork.highest_bidder ?? undefined,
    bidCount: dbArtwork.bid_count,
    views: dbArtwork.views,
    likes: dbArtwork.likes,
    isLiked,
    status: dbArtwork.status,
    createdAt: new Date(dbArtwork.created_at),
    userBidAmount,
    userBidStatus,
  };
}

export function transformArtistToLegacy(dbArtist: Database.Artist, totalArtworks: number = 0, soldArtworks: number = 0): Artist {
  return {
    id: dbArtist.id,
    name: dbArtist.name,
    username: dbArtist.username,
    bio: dbArtist.bio || '',
    profileImage: dbArtist.profile_image || '',
    totalArtworks,
    soldArtworks,
  };
}
