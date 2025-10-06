import {
  getArtworkById,
  getArtworksByArtist,
  getRelatedArtworksByArtist,
  getRelatedArtworksByCategory,
  getFeaturedArtworks,
  getEndingSoonArtworks,
  getAllArtworks,
  getArtworksByArtistUserId,
  createArtwork,
  updateArtwork,
  deleteArtwork,
  searchArtworks,
} from '../artworks';
import type { Database, ArtworkWithArtist } from '@/lib/types';

// Mock Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

const { createClient } = require('@/utils/supabase/server');

describe('artworks.ts', () => {
  // Mock data
  const mockArtist: Database.Artist = {
    id: 'artist-1',
    user_id: 'user-1',
    name: 'Test Artist',
    username: 'testartist',
    bio: 'Test bio',
    profile_image: 'https://example.com/artist.jpg',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockArtwork: Database.Artwork = {
    id: 'artwork-1',
    artist_id: 'artist-1',
    title: 'Test Artwork',
    description: 'Test description',
    image_url: 'https://example.com/artwork.jpg',
    images: ['https://example.com/artwork1.jpg', 'https://example.com/artwork2.jpg'],
    category: 'painting',
    current_price: 1000,
    fixed_price: null,
    sale_type: 'auction',
    auction_end_time: '2024-12-31T23:59:59Z',
    highest_bidder: 'bidder-1',
    bid_count: 5,
    views: 100,
    likes: 20,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockArtworkWithArtist: ArtworkWithArtist = {
    ...mockArtwork,
    artist: mockArtist,
  };

  const mockFixedPriceArtwork: Database.Artwork = {
    id: 'artwork-2',
    artist_id: 'artist-1',
    title: 'Fixed Price Artwork',
    description: 'Test description',
    image_url: 'https://example.com/artwork2.jpg',
    images: null,
    category: 'sculpture',
    current_price: null,
    fixed_price: 2000,
    sale_type: 'fixed',
    auction_end_time: null,
    highest_bidder: null,
    bid_count: 0,
    views: 50,
    likes: 10,
    status: 'active',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  };

  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock Supabase client with chainable methods
    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockReturnThis(),
      textSearch: jest.fn().mockReturnThis(),
    };

    createClient.mockResolvedValue(mockSupabaseClient);
  });

  describe('getArtworkById()', () => {
    it('should return artwork with artist info when found', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: { ...mockArtwork, artist: mockArtist },
        error: null,
      });

      const result = await getArtworkById('artwork-1');

      expect(result).toEqual(mockArtworkWithArtist);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('artworks');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'artwork-1');
    });

    it('should handle artist data as array', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: { ...mockArtwork, artist: [mockArtist] },
        error: null,
      });

      const result = await getArtworkById('artwork-1');

      expect(result).toEqual(mockArtworkWithArtist);
    });

    it('should return null when artwork does not exist', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await getArtworkById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return null on Supabase error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await getArtworkById('artwork-1');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching artwork:', { message: 'Database error' });
      consoleErrorSpy.mockRestore();
    });

    it('should return null when artist data is missing', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: { ...mockArtwork, artist: null },
        error: null,
      });

      const result = await getArtworkById('artwork-1');

      expect(result).toBeNull();
    });
  });

  describe('getArtworksByArtist()', () => {
    it('should return all artworks by artist sorted by created_at descending', async () => {
      const artworks = [mockArtwork, mockFixedPriceArtwork];
      mockSupabaseClient.order.mockResolvedValue({
        data: artworks,
        error: null,
      });

      const result = await getArtworksByArtist('artist-1');

      expect(result).toEqual(artworks);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('artworks');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('artist_id', 'artist-1');
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should return empty array when no artworks found', async () => {
      mockSupabaseClient.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await getArtworksByArtist('artist-without-artworks');

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await getArtworksByArtist('artist-1');

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getRelatedArtworksByArtist()', () => {
    it('should return related artworks excluding current artwork', async () => {
      const relatedArtworks = [
        { ...mockFixedPriceArtwork, artist: mockArtist },
      ];
      mockSupabaseClient.limit.mockResolvedValue({
        data: relatedArtworks,
        error: null,
      });

      const result = await getRelatedArtworksByArtist('artist-1', 'artwork-1', 4);

      expect(result).toHaveLength(1);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('artist_id', 'artist-1');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('status', 'active');
      expect(mockSupabaseClient.neq).toHaveBeenCalledWith('id', 'artwork-1');
      expect(mockSupabaseClient.limit).toHaveBeenCalledWith(4);
    });

    it('should only return active artworks', async () => {
      mockSupabaseClient.limit.mockResolvedValue({
        data: [],
        error: null,
      });

      await getRelatedArtworksByArtist('artist-1', 'artwork-1');

      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('status', 'active');
    });

    it('should respect the limit parameter', async () => {
      mockSupabaseClient.limit.mockResolvedValue({
        data: [],
        error: null,
      });

      await getRelatedArtworksByArtist('artist-1', 'artwork-1', 10);

      expect(mockSupabaseClient.limit).toHaveBeenCalledWith(10);
    });

    it('should return as many artworks as available when less than limit', async () => {
      const relatedArtworks = [
        { ...mockFixedPriceArtwork, artist: mockArtist },
      ];
      mockSupabaseClient.limit.mockResolvedValue({
        data: relatedArtworks,
        error: null,
      });

      const result = await getRelatedArtworksByArtist('artist-1', 'artwork-1', 4);

      expect(result).toHaveLength(1);
    });

    it('should return empty array on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.limit.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await getRelatedArtworksByArtist('artist-1', 'artwork-1');

      expect(result).toEqual([]);
      consoleErrorSpy.mockRestore();
    });

    it('should handle artist data as array', async () => {
      const relatedArtworks = [
        { ...mockFixedPriceArtwork, artist: [mockArtist] },
      ];
      mockSupabaseClient.limit.mockResolvedValue({
        data: relatedArtworks,
        error: null,
      });

      const result = await getRelatedArtworksByArtist('artist-1', 'artwork-1');

      expect(result[0].artist).toEqual(mockArtist);
    });
  });

  describe('getRelatedArtworksByCategory()', () => {
    it('should return related artworks by category excluding current artwork', async () => {
      const relatedArtworks = [
        { ...mockFixedPriceArtwork, category: 'painting', artist: mockArtist },
      ];
      mockSupabaseClient.limit.mockResolvedValue({
        data: relatedArtworks,
        error: null,
      });

      const result = await getRelatedArtworksByCategory('painting', 'artwork-1', 4);

      expect(result).toHaveLength(1);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('category', 'painting');
      expect(mockSupabaseClient.neq).toHaveBeenCalledWith('id', 'artwork-1');
    });

    it('should sort by likes in descending order', async () => {
      mockSupabaseClient.limit.mockResolvedValue({
        data: [],
        error: null,
      });

      await getRelatedArtworksByCategory('painting', 'artwork-1');

      expect(mockSupabaseClient.order).toHaveBeenCalledWith('likes', { ascending: false });
    });

    it('should respect the limit parameter', async () => {
      mockSupabaseClient.limit.mockResolvedValue({
        data: [],
        error: null,
      });

      await getRelatedArtworksByCategory('painting', 'artwork-1', 8);

      expect(mockSupabaseClient.limit).toHaveBeenCalledWith(8);
    });

    it('should return empty array on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.limit.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await getRelatedArtworksByCategory('painting', 'artwork-1');

      expect(result).toEqual([]);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getFeaturedArtworks()', () => {
    it('should return active artworks sorted by created_at descending', async () => {
      const artworks = [
        { ...mockArtwork, artist: mockArtist },
        { ...mockFixedPriceArtwork, artist: mockArtist },
      ];
      mockSupabaseClient.limit.mockResolvedValue({
        data: artworks,
        error: null,
      });

      const result = await getFeaturedArtworks();

      expect(result).toHaveLength(2);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('status', 'active');
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should limit results to 6 artworks', async () => {
      mockSupabaseClient.limit.mockResolvedValue({
        data: [],
        error: null,
      });

      await getFeaturedArtworks();

      expect(mockSupabaseClient.limit).toHaveBeenCalledWith(6);
    });

    it('should return empty array on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.limit.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await getFeaturedArtworks();

      expect(result).toEqual([]);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getEndingSoonArtworks()', () => {
    it('should return auction artworks sorted by auction_end_time ascending', async () => {
      const artworks = [
        { ...mockArtwork, artist: mockArtist },
      ];
      mockSupabaseClient.limit.mockResolvedValue({
        data: artworks,
        error: null,
      });

      const result = await getEndingSoonArtworks();

      expect(result).toHaveLength(1);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('sale_type', 'auction');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('status', 'active');
      expect(mockSupabaseClient.not).toHaveBeenCalledWith('auction_end_time', 'is', null);
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('auction_end_time', { ascending: true });
    });

    it('should limit results to 4 artworks', async () => {
      mockSupabaseClient.limit.mockResolvedValue({
        data: [],
        error: null,
      });

      await getEndingSoonArtworks();

      expect(mockSupabaseClient.limit).toHaveBeenCalledWith(4);
    });

    it('should return empty array on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.limit.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await getEndingSoonArtworks();

      expect(result).toEqual([]);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getAllArtworks()', () => {
    it('should return all active artworks sorted by created_at descending', async () => {
      const artworks = [
        { ...mockArtwork, artist: mockArtist },
        { ...mockFixedPriceArtwork, artist: mockArtist },
      ];
      mockSupabaseClient.order.mockResolvedValue({
        data: artworks,
        error: null,
      });

      const result = await getAllArtworks();

      expect(result).toHaveLength(2);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('status', 'active');
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should return empty array on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await getAllArtworks();

      expect(result).toEqual([]);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getArtworksByArtistUserId()', () => {
    it('should find artist by user_id and return their artworks', async () => {
      mockSupabaseClient.maybeSingle.mockResolvedValue({
        data: { id: 'artist-1' },
        error: null,
      });
      mockSupabaseClient.order.mockResolvedValue({
        data: [{ ...mockArtwork, artist: mockArtist }],
        error: null,
      });

      const result = await getArtworksByArtistUserId('user-1');

      expect(result).toHaveLength(1);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('artists');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', 'user-1');
    });

    it('should return empty array when artist not found', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await getArtworksByArtistUserId('non-existent-user');

      expect(result).toEqual([]);
      consoleErrorSpy.mockRestore();
    });

    it('should return empty array on artist query error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.maybeSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await getArtworksByArtistUserId('user-1');

      expect(result).toEqual([]);
      consoleErrorSpy.mockRestore();
    });

    it('should return empty array on artworks query error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.maybeSingle.mockResolvedValue({
        data: { id: 'artist-1' },
        error: null,
      });
      mockSupabaseClient.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await getArtworksByArtistUserId('user-1');

      expect(result).toEqual([]);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('createArtwork()', () => {
    it('should successfully create auction type artwork', async () => {
      const newArtwork = {
        artist_id: 'artist-1',
        title: 'New Auction Artwork',
        description: 'Test description',
        image_url: 'https://example.com/new.jpg',
        category: 'painting',
        sale_type: 'auction' as const,
        current_price: 1000,
        auction_end_time: '2024-12-31T23:59:59Z',
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: { id: 'new-artwork-1', ...newArtwork },
        error: null,
      });

      const result = await createArtwork(newArtwork);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(newArtwork);
    });

    it('should successfully create fixed type artwork', async () => {
      const newArtwork = {
        artist_id: 'artist-1',
        title: 'New Fixed Price Artwork',
        description: 'Test description',
        image_url: 'https://example.com/new.jpg',
        category: 'sculpture',
        sale_type: 'fixed' as const,
        fixed_price: 2000,
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: { id: 'new-artwork-2', ...newArtwork },
        error: null,
      });

      const result = await createArtwork(newArtwork);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should fail when required fields are missing', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Missing required fields' },
      });

      const invalidArtwork = {
        artist_id: 'artist-1',
        title: 'Incomplete Artwork',
        description: '',
        image_url: '',
        category: '',
        sale_type: 'auction' as const,
      };

      const result = await createArtwork(invalidArtwork);

      expect(result.success).toBe(false);
      expect(result.error).toBe('작품 등록 중 오류가 발생했습니다.');
      consoleErrorSpy.mockRestore();
    });

    it('should handle database error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Database constraint violation' },
      });

      const newArtwork = {
        artist_id: 'invalid-artist',
        title: 'New Artwork',
        description: 'Test',
        image_url: 'https://example.com/new.jpg',
        category: 'painting',
        sale_type: 'auction' as const,
      };

      const result = await createArtwork(newArtwork);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('updateArtwork()', () => {
    it('should successfully update artwork information', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: { ...mockArtwork, ...updateData },
        error: null,
      });

      const result = await updateArtwork('artwork-1', updateData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(updateData);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'artwork-1');
    });

    it('should successfully change sale_type', async () => {
      const updateData = {
        sale_type: 'fixed' as const,
        fixed_price: 3000,
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: { ...mockArtwork, ...updateData },
        error: null,
      });

      const result = await updateArtwork('artwork-1', updateData);

      expect(result.success).toBe(true);
      expect(result.data?.sale_type).toBe('fixed');
    });

    it('should successfully update artwork status', async () => {
      const updateData = {
        status: 'sold' as const,
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: { ...mockArtwork, ...updateData },
        error: null,
      });

      const result = await updateArtwork('artwork-1', updateData);

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('sold');
    });

    it('should fail when updating non-existent artwork', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Artwork not found' },
      });

      const result = await updateArtwork('non-existent-id', { title: 'New Title' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('작품 수정 중 오류가 발생했습니다.');
      consoleErrorSpy.mockRestore();
    });

    it('should handle database error during update', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await updateArtwork('artwork-1', { title: 'New Title' });

      expect(result.success).toBe(false);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('deleteArtwork()', () => {
    it('should successfully delete artwork', async () => {
      mockSupabaseClient.eq.mockResolvedValue({
        error: null,
      });

      const result = await deleteArtwork('artwork-1');

      expect(result.success).toBe(true);
      expect(mockSupabaseClient.delete).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'artwork-1');
    });

    it('should fail when deleting non-existent artwork', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.eq.mockResolvedValue({
        error: { message: 'Artwork not found' },
      });

      const result = await deleteArtwork('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('작품 삭제 중 오류가 발생했습니다.');
      consoleErrorSpy.mockRestore();
    });

    it('should handle database error during deletion', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.eq.mockResolvedValue({
        error: { message: 'Foreign key constraint violation' },
      });

      const result = await deleteArtwork('artwork-1');

      expect(result.success).toBe(false);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('searchArtworks()', () => {
    it('should perform full-text search with searchQuery', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [{ ...mockArtwork, artist: mockArtist }],
        error: null,
        count: 1,
      });

      const result = await searchArtworks({ searchQuery: 'abstract painting' });

      expect(result.artworks).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(mockSupabaseClient.textSearch).toHaveBeenCalledWith(
        'search_vector',
        'abstract painting',
        { type: 'websearch', config: 'english' }
      );
    });

    it('should filter by category', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [{ ...mockArtwork, artist: mockArtist }],
        error: null,
        count: 1,
      });

      await searchArtworks({ category: 'painting' });

      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('category', 'painting');
    });

    it('should not filter when category is "all"', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await searchArtworks({ category: 'all' });

      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('status', 'active');
      expect(mockSupabaseClient.eq).not.toHaveBeenCalledWith('category', 'all');
    });

    it('should filter by saleType', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [{ ...mockArtwork, artist: mockArtist }],
        error: null,
        count: 1,
      });

      await searchArtworks({ saleType: 'auction' });

      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('sale_type', 'auction');
    });

    it('should apply priceMin filter for auction items', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await searchArtworks({ saleType: 'auction', priceMin: 1000 });

      expect(mockSupabaseClient.gte).toHaveBeenCalledWith('current_price', 1000);
    });

    it('should apply priceMax filter for auction items', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await searchArtworks({ saleType: 'auction', priceMax: 5000 });

      expect(mockSupabaseClient.lte).toHaveBeenCalledWith('current_price', 5000);
    });

    it('should apply priceMin filter for fixed items', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await searchArtworks({ saleType: 'fixed', priceMin: 2000 });

      expect(mockSupabaseClient.gte).toHaveBeenCalledWith('fixed_price', 2000);
    });

    it('should apply priceMax filter for fixed items', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await searchArtworks({ saleType: 'fixed', priceMax: 8000 });

      expect(mockSupabaseClient.lte).toHaveBeenCalledWith('fixed_price', 8000);
    });

    it('should apply price range filter for all sale types', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await searchArtworks({ priceMin: 1000, priceMax: 5000 });

      expect(mockSupabaseClient.or).toHaveBeenCalledWith('current_price.gte.1000,fixed_price.gte.1000');
      expect(mockSupabaseClient.or).toHaveBeenCalledWith('current_price.lte.5000,fixed_price.lte.5000');
    });

    it('should sort by latest (default)', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await searchArtworks({});

      expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should sort by popular', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await searchArtworks({ sortBy: 'popular' });

      expect(mockSupabaseClient.order).toHaveBeenCalledWith('likes', { ascending: false });
    });

    it('should sort by price-low', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await searchArtworks({ sortBy: 'price-low' });

      expect(mockSupabaseClient.order).toHaveBeenCalledWith('current_price', { ascending: true, nullsFirst: false });
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('fixed_price', { ascending: true, nullsFirst: false });
    });

    it('should sort by price-high', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await searchArtworks({ sortBy: 'price-high' });

      expect(mockSupabaseClient.order).toHaveBeenCalledWith('current_price', { ascending: false, nullsFirst: false });
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('fixed_price', { ascending: false, nullsFirst: false });
    });

    it('should sort by ending-soon', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await searchArtworks({ sortBy: 'ending-soon' });

      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('sale_type', 'auction');
      expect(mockSupabaseClient.not).toHaveBeenCalledWith('auction_end_time', 'is', null);
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('auction_end_time', { ascending: true });
    });

    it('should sort by most-bids', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await searchArtworks({ sortBy: 'most-bids' });

      expect(mockSupabaseClient.order).toHaveBeenCalledWith('bid_count', { ascending: false });
    });

    it('should handle pagination with default values', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await searchArtworks({});

      // Default: page 1, limit 12 -> range(0, 11)
      expect(mockSupabaseClient.range).toHaveBeenCalledWith(0, 11);
    });

    it('should handle pagination with custom page and limit', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await searchArtworks({ page: 3, limit: 20 });

      // Page 3, limit 20 -> range(40, 59)
      expect(mockSupabaseClient.range).toHaveBeenCalledWith(40, 59);
    });

    it('should return accurate totalCount', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [{ ...mockArtwork, artist: mockArtist }],
        error: null,
        count: 150,
      });

      const result = await searchArtworks({ page: 1, limit: 12 });

      expect(result.totalCount).toBe(150);
      expect(result.artworks).toHaveLength(1);
    });

    it('should filter by artistId', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await searchArtworks({ artistId: 'artist-1' });

      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('artist_id', 'artist-1');
    });

    it('should combine multiple filters', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [{ ...mockArtwork, artist: mockArtist }],
        error: null,
        count: 1,
      });

      const result = await searchArtworks({
        searchQuery: 'modern art',
        category: 'painting',
        saleType: 'auction',
        priceMin: 1000,
        priceMax: 5000,
        sortBy: 'popular',
        page: 1,
        limit: 10,
      });

      expect(result.artworks).toHaveLength(1);
      expect(mockSupabaseClient.textSearch).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('category', 'painting');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('sale_type', 'auction');
      expect(mockSupabaseClient.gte).toHaveBeenCalledWith('current_price', 1000);
      expect(mockSupabaseClient.lte).toHaveBeenCalledWith('current_price', 5000);
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('likes', { ascending: false });
    });

    it('should return empty results on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSupabaseClient.range.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
        count: null,
      });

      const result = await searchArtworks({});

      expect(result.artworks).toEqual([]);
      expect(result.totalCount).toBe(0);
      consoleErrorSpy.mockRestore();
    });

    it('should trim searchQuery before searching', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await searchArtworks({ searchQuery: '  modern art  ' });

      expect(mockSupabaseClient.textSearch).toHaveBeenCalledWith(
        'search_vector',
        'modern art',
        { type: 'websearch', config: 'english' }
      );
    });

    it('should not apply text search for empty searchQuery', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await searchArtworks({ searchQuery: '   ' });

      expect(mockSupabaseClient.textSearch).not.toHaveBeenCalled();
    });
  });
});
