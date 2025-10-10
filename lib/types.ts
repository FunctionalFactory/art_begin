// Database types that match the Supabase schema

export namespace Database {
  export interface Artist {
    id: string;
    user_id: string | null;
    name: string;
    username: string;
    bio: string | null;
    profile_image: string | null;
    created_at: string;
    updated_at: string;
  }

  export interface Artwork {
    id: string;
    artist_id: string;
    title: string;
    description: string | null;
    image_url: string;
    images?: string[] | null;
    category: string;
    current_price: number | null;
    fixed_price: number | null;
    sale_type: 'auction' | 'fixed';
    auction_end_time: string | null;
    highest_bidder: string | null;
    bid_count: number;
    views: number;
    likes: number;
    status: 'active' | 'sold' | 'upcoming';
    created_at: string;
    updated_at: string;
  }

  export interface Profile {
    id: string;
    role: 'buyer' | 'artist';
    username: string | null;
    display_name: string | null;
    bio: string | null;
    profile_image: string | null;
    balance?: number;
    created_at: string;
    updated_at: string;
  }

  export interface Favorite {
    user_id: string;
    artwork_id: string;
    created_at: string;
  }

  export interface Bid {
    id: string;
    artwork_id: string;
    user_id: string;
    bid_amount: number;
    buyer_premium_rate?: number; // Buyer's premium rate (e.g., 0.10 = 10%)
    created_at: string;
  }

  export interface Order {
    id: string;
    user_id: string;
    artwork_id: string;
    order_type: 'purchase' | 'auction';
    price: number;
    status: 'pending' | 'preparing' | 'shipping' | 'delivered' | 'completed';
    created_at: string;
    updated_at: string;
  }

  export interface BalanceTransaction {
    id: string;
    user_id: string;
    amount: number;  // Positive for deposit, negative for deduction
    balance_after: number;  // Balance after transaction (audit trail)
    transaction_type: 'deposit' | 'bid' | 'refund';
    reference_id: string | null;  // Reference to bid_id, order_id, etc.
    description: string | null;
    created_at: string;
  }
}

// Extended types for application use

export interface ArtworkWithArtist extends Database.Artwork {
  artist: Database.Artist;
}

export interface FavoriteWithArtwork extends Database.Favorite {
  artwork: ArtworkWithArtist;
}

export interface ArtworkWithLikeStatus extends ArtworkWithArtist {
  is_liked: boolean;
}

export interface BidWithArtwork extends Database.Bid {
  artwork: ArtworkWithArtist;
}

export type BidStatus = 'highest' | 'outbid';

export interface OrderWithArtwork extends Database.Order {
  artwork: ArtworkWithArtist;
}

export interface OrderWithDetails extends Database.Order {
  artwork: ArtworkWithArtist;
  buyer_email?: string;
}

// Helper types for computed fields
export interface ArtistWithStats extends Database.Artist {
  total_artworks: number;
  sold_artworks: number;
}

// Legacy type aliases for backwards compatibility with existing code
export interface Artist {
  id: string;
  name: string;
  username: string;
  bio: string;
  profileImage: string;
  totalArtworks: number;
  soldArtworks: number;
}

export interface Artwork {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  artistUsername: string;
  imageUrl: string;
  images?: string[];
  description: string;
  category: string;
  currentPrice?: number;
  fixedPrice?: number;
  saleType: "auction" | "fixed";
  auctionEndTime?: Date;
  highestBidder?: string;
  bidCount?: number;
  views: number;
  likes: number;
  isLiked?: boolean;
  status: "active" | "sold" | "upcoming";
  createdAt: Date;
  // Bid info (for my-page bid history display)
  userBidAmount?: number;
  userBidStatus?: 'highest' | 'outbid';
}

// Re-export auction utility types for centralized type management
export type { BidBreakdown } from './utils/auction';
