import { transformArtworkToLegacy, transformArtistToLegacy } from '../transform';
import type { ArtworkWithArtist, Database } from '@/lib/types';

describe('transformArtworkToLegacy', () => {
  it('should transform basic artwork data correctly', () => {
    const mockDbArtwork: ArtworkWithArtist = {
      id: 'artwork-1',
      artist_id: 'artist-1',
      title: 'Sunset Painting',
      description: 'A beautiful sunset',
      image_url: 'https://example.com/sunset.jpg',
      images: null,
      category: 'Painting',
      current_price: null,
      fixed_price: 50000,
      sale_type: 'fixed',
      auction_end_time: null,
      highest_bidder: null,
      bid_count: 0,
      views: 100,
      likes: 25,
      status: 'active',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      artist: {
        id: 'artist-1',
        user_id: 'user-1',
        name: 'John Doe',
        username: 'johndoe',
        bio: 'Artist bio',
        profile_image: 'https://example.com/profile.jpg',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    };

    const result = transformArtworkToLegacy(mockDbArtwork);

    expect(result).toEqual({
      id: 'artwork-1',
      title: 'Sunset Painting',
      artistId: 'artist-1',
      artistName: 'John Doe',
      artistUsername: 'johndoe',
      imageUrl: 'https://example.com/sunset.jpg',
      images: undefined,
      description: 'A beautiful sunset',
      category: 'Painting',
      currentPrice: undefined,
      fixedPrice: 50000,
      saleType: 'fixed',
      auctionEndTime: undefined,
      highestBidder: undefined,
      bidCount: 0,
      views: 100,
      likes: 25,
      isLiked: undefined,
      status: 'active',
      createdAt: new Date('2024-01-15T10:00:00Z'),
      userBidAmount: undefined,
      userBidStatus: undefined,
    });
  });

  it('should transform auction type artwork with auction_end_time and current_price', () => {
    const mockDbArtwork: ArtworkWithArtist = {
      id: 'artwork-2',
      artist_id: 'artist-1',
      title: 'Abstract Art',
      description: 'Modern abstract',
      image_url: 'https://example.com/abstract.jpg',
      images: null,
      category: 'Abstract',
      current_price: 100000,
      fixed_price: null,
      sale_type: 'auction',
      auction_end_time: '2024-02-01T23:59:59Z',
      highest_bidder: 'user-123',
      bid_count: 5,
      views: 200,
      likes: 50,
      status: 'active',
      created_at: '2024-01-20T10:00:00Z',
      updated_at: '2024-01-20T10:00:00Z',
      artist: {
        id: 'artist-1',
        user_id: 'user-1',
        name: 'Jane Smith',
        username: 'janesmith',
        bio: null,
        profile_image: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    };

    const result = transformArtworkToLegacy(mockDbArtwork);

    expect(result.saleType).toBe('auction');
    expect(result.currentPrice).toBe(100000);
    expect(result.fixedPrice).toBeUndefined();
    expect(result.auctionEndTime).toEqual(new Date('2024-02-01T23:59:59Z'));
    expect(result.highestBidder).toBe('user-123');
    expect(result.bidCount).toBe(5);
  });

  it('should transform fixed type artwork with fixed_price', () => {
    const mockDbArtwork: ArtworkWithArtist = {
      id: 'artwork-3',
      artist_id: 'artist-2',
      title: 'Portrait',
      description: 'Classic portrait',
      image_url: 'https://example.com/portrait.jpg',
      images: null,
      category: 'Portrait',
      current_price: null,
      fixed_price: 75000,
      sale_type: 'fixed',
      auction_end_time: null,
      highest_bidder: null,
      bid_count: 0,
      views: 150,
      likes: 30,
      status: 'active',
      created_at: '2024-01-18T10:00:00Z',
      updated_at: '2024-01-18T10:00:00Z',
      artist: {
        id: 'artist-2',
        user_id: 'user-2',
        name: 'Bob Artist',
        username: 'bobartist',
        bio: 'Bio text',
        profile_image: 'https://example.com/bob.jpg',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    };

    const result = transformArtworkToLegacy(mockDbArtwork);

    expect(result.saleType).toBe('fixed');
    expect(result.fixedPrice).toBe(75000);
    expect(result.currentPrice).toBeUndefined();
    expect(result.auctionEndTime).toBeUndefined();
    expect(result.highestBidder).toBeUndefined();
  });

  it('should include isLiked flag when provided', () => {
    const mockDbArtwork: ArtworkWithArtist = {
      id: 'artwork-4',
      artist_id: 'artist-1',
      title: 'Liked Artwork',
      description: 'Description',
      image_url: 'https://example.com/liked.jpg',
      images: null,
      category: 'Modern',
      current_price: null,
      fixed_price: 60000,
      sale_type: 'fixed',
      auction_end_time: null,
      highest_bidder: null,
      bid_count: 0,
      views: 80,
      likes: 15,
      status: 'active',
      created_at: '2024-01-10T10:00:00Z',
      updated_at: '2024-01-10T10:00:00Z',
      artist: {
        id: 'artist-1',
        user_id: 'user-1',
        name: 'John Doe',
        username: 'johndoe',
        bio: 'Artist bio',
        profile_image: 'https://example.com/profile.jpg',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    };

    const result = transformArtworkToLegacy(mockDbArtwork, true);

    expect(result.isLiked).toBe(true);
  });

  it('should include userBidAmount and userBidStatus when provided', () => {
    const mockDbArtwork: ArtworkWithArtist = {
      id: 'artwork-5',
      artist_id: 'artist-1',
      title: 'Bid Artwork',
      description: 'User bid on this',
      image_url: 'https://example.com/bid.jpg',
      images: null,
      category: 'Contemporary',
      current_price: 120000,
      fixed_price: null,
      sale_type: 'auction',
      auction_end_time: '2024-02-15T23:59:59Z',
      highest_bidder: 'user-456',
      bid_count: 8,
      views: 300,
      likes: 60,
      status: 'active',
      created_at: '2024-01-25T10:00:00Z',
      updated_at: '2024-01-25T10:00:00Z',
      artist: {
        id: 'artist-1',
        user_id: 'user-1',
        name: 'Alice Artist',
        username: 'aliceartist',
        bio: 'Bio',
        profile_image: 'https://example.com/alice.jpg',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    };

    const result = transformArtworkToLegacy(mockDbArtwork, false, 110000, 'outbid');

    expect(result.userBidAmount).toBe(110000);
    expect(result.userBidStatus).toBe('outbid');
    expect(result.isLiked).toBe(false);
  });

  it('should handle null/undefined fields correctly (images, description)', () => {
    const mockDbArtwork: ArtworkWithArtist = {
      id: 'artwork-6',
      artist_id: 'artist-3',
      title: 'Minimal Info Artwork',
      description: null,
      image_url: 'https://example.com/minimal.jpg',
      images: null,
      category: 'Minimal',
      current_price: null,
      fixed_price: 40000,
      sale_type: 'fixed',
      auction_end_time: null,
      highest_bidder: null,
      bid_count: 0,
      views: 50,
      likes: 10,
      status: 'active',
      created_at: '2024-01-12T10:00:00Z',
      updated_at: '2024-01-12T10:00:00Z',
      artist: {
        id: 'artist-3',
        user_id: 'user-3',
        name: 'Charlie Creator',
        username: 'charliecreator',
        bio: null,
        profile_image: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    };

    const result = transformArtworkToLegacy(mockDbArtwork);

    expect(result.description).toBe('');
    expect(result.images).toBeUndefined();
  });

  it('should convert Date objects correctly (ISO string to Date)', () => {
    const mockDbArtwork: ArtworkWithArtist = {
      id: 'artwork-7',
      artist_id: 'artist-1',
      title: 'Date Test Artwork',
      description: 'Testing dates',
      image_url: 'https://example.com/date.jpg',
      images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
      category: 'Test',
      current_price: 90000,
      fixed_price: null,
      sale_type: 'auction',
      auction_end_time: '2024-03-01T12:30:00Z',
      highest_bidder: null,
      bid_count: 2,
      views: 120,
      likes: 20,
      status: 'active',
      created_at: '2024-01-30T08:15:30Z',
      updated_at: '2024-01-30T08:15:30Z',
      artist: {
        id: 'artist-1',
        user_id: 'user-1',
        name: 'Test Artist',
        username: 'testartist',
        bio: 'Test bio',
        profile_image: 'https://example.com/test.jpg',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    };

    const result = transformArtworkToLegacy(mockDbArtwork);

    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.createdAt.toISOString()).toBe('2024-01-30T08:15:30.000Z');
    expect(result.auctionEndTime).toBeInstanceOf(Date);
    expect(result.auctionEndTime?.toISOString()).toBe('2024-03-01T12:30:00.000Z');
    expect(result.images).toEqual(['https://example.com/img1.jpg', 'https://example.com/img2.jpg']);
  });
});

describe('transformArtistToLegacy', () => {
  it('should transform basic artist data correctly', () => {
    const mockDbArtist: Database.Artist = {
      id: 'artist-1',
      user_id: 'user-1',
      name: 'John Artist',
      username: 'johnartist',
      bio: 'Experienced painter with 10 years of expertise',
      profile_image: 'https://example.com/john-profile.jpg',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const result = transformArtistToLegacy(mockDbArtist, 15, 8);

    expect(result).toEqual({
      id: 'artist-1',
      name: 'John Artist',
      username: 'johnartist',
      bio: 'Experienced painter with 10 years of expertise',
      profileImage: 'https://example.com/john-profile.jpg',
      totalArtworks: 15,
      soldArtworks: 8,
    });
  });

  it('should include totalArtworks and soldArtworks correctly', () => {
    const mockDbArtist: Database.Artist = {
      id: 'artist-2',
      user_id: 'user-2',
      name: 'Jane Creator',
      username: 'janecreator',
      bio: 'Modern artist',
      profile_image: 'https://example.com/jane-profile.jpg',
      created_at: '2024-01-05T00:00:00Z',
      updated_at: '2024-01-05T00:00:00Z',
    };

    const result = transformArtistToLegacy(mockDbArtist, 25, 12);

    expect(result.totalArtworks).toBe(25);
    expect(result.soldArtworks).toBe(12);
  });

  it('should handle null fields correctly (bio, profile_image)', () => {
    const mockDbArtist: Database.Artist = {
      id: 'artist-3',
      user_id: 'user-3',
      name: 'New Artist',
      username: 'newartist',
      bio: null,
      profile_image: null,
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-02-01T00:00:00Z',
    };

    const result = transformArtistToLegacy(mockDbArtist);

    expect(result.bio).toBe('');
    expect(result.profileImage).toBe('');
    expect(result.totalArtworks).toBe(0);
    expect(result.soldArtworks).toBe(0);
  });
});
