import {
  getFavoritesByUser,
  checkIsFavorited,
  getUserFavoritesMap,
} from '../favorites';
import { createClient } from '@/utils/supabase/server';
import type { FavoriteWithArtwork } from '@/lib/types';

// Mock Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('favorites queries', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    jest.clearAllMocks();
  });

  describe('getFavoritesByUser()', () => {
    it('should return user favorites with artwork and artist information', async () => {
      const mockData = [
        {
          user_id: 'user-1',
          artwork_id: 'artwork-1',
          created_at: '2024-01-15T10:00:00Z',
          artwork: {
            id: 'artwork-1',
            title: 'Sunset',
            image_url: 'sunset.jpg',
            artist_id: 'artist-1',
            artist: {
              id: 'artist-1',
              name: 'John Doe',
              username: 'johndoe',
            },
          },
        },
        {
          user_id: 'user-1',
          artwork_id: 'artwork-2',
          created_at: '2024-01-10T10:00:00Z',
          artwork: {
            id: 'artwork-2',
            title: 'Mountains',
            image_url: 'mountains.jpg',
            artist_id: 'artist-2',
            artist: {
              id: 'artist-2',
              name: 'Jane Smith',
              username: 'janesmith',
            },
          },
        },
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await getFavoritesByUser('user-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('favorites');
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'user-1');
      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      });
      expect(result).toHaveLength(2);
      expect(result[0].artwork_id).toBe('artwork-1');
      expect(result[0].artwork.artist.name).toBe('John Doe');
    });

    it('should include artwork and artist information', async () => {
      const mockData = [
        {
          user_id: 'user-1',
          artwork_id: 'artwork-1',
          created_at: '2024-01-15T10:00:00Z',
          artwork: {
            id: 'artwork-1',
            title: 'Sunset',
            description: 'Beautiful sunset',
            image_url: 'sunset.jpg',
            artist_id: 'artist-1',
            category: 'painting',
            sale_type: 'fixed' as const,
            fixed_price: 1000000,
            status: 'active' as const,
            artist: {
              id: 'artist-1',
              name: 'John Doe',
              username: 'johndoe',
              bio: 'Artist bio',
              profile_image: 'profile.jpg',
            },
          },
        },
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await getFavoritesByUser('user-1');

      expect(result[0].artwork.title).toBe('Sunset');
      expect(result[0].artwork.description).toBe('Beautiful sunset');
      expect(result[0].artwork.artist.name).toBe('John Doe');
      expect(result[0].artwork.artist.bio).toBe('Artist bio');
    });

    it('should return favorites in created_at descending order', async () => {
      const mockData = [
        {
          user_id: 'user-1',
          artwork_id: 'artwork-3',
          created_at: '2024-01-20T10:00:00Z',
          artwork: { id: 'artwork-3', title: 'Newest', artist: {} },
        },
        {
          user_id: 'user-1',
          artwork_id: 'artwork-2',
          created_at: '2024-01-15T10:00:00Z',
          artwork: { id: 'artwork-2', title: 'Middle', artist: {} },
        },
        {
          user_id: 'user-1',
          artwork_id: 'artwork-1',
          created_at: '2024-01-10T10:00:00Z',
          artwork: { id: 'artwork-1', title: 'Oldest', artist: {} },
        },
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await getFavoritesByUser('user-1');

      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      });
      expect(result[0].created_at).toBe('2024-01-20T10:00:00Z');
      expect(result[2].created_at).toBe('2024-01-10T10:00:00Z');
    });
  });

  describe('checkIsFavorited()', () => {
    it('should return true when artwork is favorited', async () => {
      mockSupabase.maybeSingle.mockResolvedValue({
        data: { user_id: 'user-1', artwork_id: 'artwork-1' },
        error: null,
      });

      const result = await checkIsFavorited('user-1', 'artwork-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('favorites');
      expect(mockSupabase.select).toHaveBeenCalledWith('user_id');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'user-1');
      expect(mockSupabase.eq).toHaveBeenCalledWith('artwork_id', 'artwork-1');
      expect(mockSupabase.maybeSingle).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when artwork is not favorited', async () => {
      mockSupabase.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await checkIsFavorited('user-1', 'artwork-1');

      expect(result).toBe(false);
    });

    it('should return false when userId is undefined', async () => {
      const result = await checkIsFavorited(undefined, 'artwork-1');

      expect(mockSupabase.from).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('getUserFavoritesMap()', () => {
    it('should return a Map with favorited status for multiple artworks', async () => {
      const artworkIds = ['artwork-1', 'artwork-2', 'artwork-3'];
      const mockData = [
        { artwork_id: 'artwork-1' },
        { artwork_id: 'artwork-3' },
      ];

      mockSupabase.in.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await getUserFavoritesMap('user-1', artworkIds);

      expect(mockSupabase.from).toHaveBeenCalledWith('favorites');
      expect(mockSupabase.select).toHaveBeenCalledWith('artwork_id');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'user-1');
      expect(mockSupabase.in).toHaveBeenCalledWith('artwork_id', artworkIds);
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(3);
      expect(result.get('artwork-1')).toBe(true);
      expect(result.get('artwork-2')).toBe(false);
      expect(result.get('artwork-3')).toBe(true);
    });

    it('should mark favorited artworks as true and non-favorited as false', async () => {
      const artworkIds = ['artwork-1', 'artwork-2', 'artwork-3', 'artwork-4'];
      const mockData = [{ artwork_id: 'artwork-2' }];

      mockSupabase.in.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await getUserFavoritesMap('user-1', artworkIds);

      expect(result.get('artwork-1')).toBe(false);
      expect(result.get('artwork-2')).toBe(true);
      expect(result.get('artwork-3')).toBe(false);
      expect(result.get('artwork-4')).toBe(false);
    });

    it('should return empty Map when userId is undefined', async () => {
      const artworkIds = ['artwork-1', 'artwork-2'];

      const result = await getUserFavoritesMap(undefined, artworkIds);

      expect(mockSupabase.from).not.toHaveBeenCalled();
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should return empty Map when artworkIds is empty array', async () => {
      const result = await getUserFavoritesMap('user-1', []);

      expect(mockSupabase.from).not.toHaveBeenCalled();
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should handle case when some artworks are favorited', async () => {
      const artworkIds = ['artwork-1', 'artwork-2', 'artwork-3'];
      const mockData = [
        { artwork_id: 'artwork-1' },
        { artwork_id: 'artwork-2' },
      ];

      mockSupabase.in.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await getUserFavoritesMap('user-1', artworkIds);

      expect(result.get('artwork-1')).toBe(true);
      expect(result.get('artwork-2')).toBe(true);
      expect(result.get('artwork-3')).toBe(false);
    });
  });
});
