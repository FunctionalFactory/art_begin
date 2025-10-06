import {
  getArtistById,
  getArtistByUsername,
  getAllArtists,
  getArtistByUserId,
  createArtist,
  updateArtist,
} from '../artists';
import { createClient } from '@/utils/supabase/server';
import type { Database } from '@/lib/types';

// Mock Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('artists queries', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
      maybeSingle: jest.fn(),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    jest.clearAllMocks();
  });

  describe('getArtistById()', () => {
    it('should retrieve artist by valid ID', async () => {
      const mockArtist: Database.Artist = {
        id: 'artist-1',
        user_id: 'user-1',
        name: 'John Doe',
        username: 'johndoe',
        bio: 'Artist bio',
        profile_image: 'profile.jpg',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockArtist,
        error: null,
      });

      const result = await getArtistById('artist-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('artists');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'artist-1');
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(result).toEqual(mockArtist);
    });

    it('should return null for non-existent ID', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await getArtistById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getArtistByUsername()', () => {
    it('should retrieve artist by username', async () => {
      const mockArtist: Database.Artist = {
        id: 'artist-1',
        user_id: 'user-1',
        name: 'John Doe',
        username: 'johndoe',
        bio: 'Artist bio',
        profile_image: 'profile.jpg',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockArtist,
        error: null,
      });

      const result = await getArtistByUsername('johndoe');

      expect(mockSupabase.from).toHaveBeenCalledWith('artists');
      expect(mockSupabase.eq).toHaveBeenCalledWith('username', 'johndoe');
      expect(result).toEqual(mockArtist);
    });

    it('should return null when username does not exist', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await getArtistByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getAllArtists()', () => {
    it('should retrieve all artists', async () => {
      const mockArtists: Database.Artist[] = [
        {
          id: 'artist-1',
          user_id: 'user-1',
          name: 'Alice',
          username: 'alice',
          bio: null,
          profile_image: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'artist-2',
          user_id: 'user-2',
          name: 'Bob',
          username: 'bob',
          bio: null,
          profile_image: null,
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockArtists,
        error: null,
      });

      const result = await getAllArtists();

      expect(mockSupabase.from).toHaveBeenCalledWith('artists');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.order).toHaveBeenCalledWith('name', {
        ascending: true,
      });
      expect(result).toHaveLength(2);
      expect(result).toEqual(mockArtists);
    });

    it('should return artists sorted by name in ascending order', async () => {
      const mockArtists: Database.Artist[] = [
        {
          id: 'artist-1',
          user_id: 'user-1',
          name: 'Alice',
          username: 'alice',
          bio: null,
          profile_image: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'artist-2',
          user_id: 'user-2',
          name: 'Bob',
          username: 'bob',
          bio: null,
          profile_image: null,
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
        {
          id: 'artist-3',
          user_id: 'user-3',
          name: 'Charlie',
          username: 'charlie',
          bio: null,
          profile_image: null,
          created_at: '2024-01-03T00:00:00Z',
          updated_at: '2024-01-03T00:00:00Z',
        },
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockArtists,
        error: null,
      });

      const result = await getAllArtists();

      expect(result[0].name).toBe('Alice');
      expect(result[1].name).toBe('Bob');
      expect(result[2].name).toBe('Charlie');
    });
  });

  describe('getArtistByUserId()', () => {
    it('should retrieve artist by user_id', async () => {
      const mockArtist: Database.Artist = {
        id: 'artist-1',
        user_id: 'user-1',
        name: 'John Doe',
        username: 'johndoe',
        bio: 'Artist bio',
        profile_image: 'profile.jpg',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.maybeSingle.mockResolvedValue({
        data: mockArtist,
        error: null,
      });

      const result = await getArtistByUserId('user-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('artists');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'user-1');
      expect(mockSupabase.maybeSingle).toHaveBeenCalled();
      expect(result).toEqual(mockArtist);
    });

    it('should return null when user_id does not exist', async () => {
      mockSupabase.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await getArtistByUserId('non-existent-user');

      expect(result).toBeNull();
    });
  });

  describe('createArtist()', () => {
    it('should successfully create artist profile', async () => {
      const artistData = {
        user_id: 'user-1',
        name: 'John Doe',
        username: 'johndoe',
        bio: 'Artist bio',
        profile_image: 'profile.jpg',
      };

      const mockCreatedArtist: Database.Artist = {
        id: 'artist-1',
        ...artistData,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // Mock getArtistByUserId to return null (no existing artist)
      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Mock getArtistByUsername to return null (username available)
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      // Mock insert
      mockSupabase.single.mockResolvedValueOnce({
        data: mockCreatedArtist,
        error: null,
      });

      const result = await createArtist(artistData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedArtist);
      expect(result.error).toBeUndefined();
    });

    it('should fail when artist with user_id already exists', async () => {
      const artistData = {
        user_id: 'user-1',
        name: 'John Doe',
        username: 'johndoe',
      };

      const existingArtist: Database.Artist = {
        id: 'artist-1',
        user_id: 'user-1',
        name: 'Existing Artist',
        username: 'existing',
        bio: null,
        profile_image: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.maybeSingle.mockResolvedValue({
        data: existingArtist,
        error: null,
      });

      const result = await createArtist(artistData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('이미 작가 프로필이 존재합니다.');
      expect(result.data).toBeUndefined();
    });

    it('should fail when username is already taken', async () => {
      const artistData = {
        user_id: 'user-1',
        name: 'John Doe',
        username: 'johndoe',
      };

      const existingUsernameArtist: Database.Artist = {
        id: 'artist-2',
        user_id: 'user-2',
        name: 'Other Artist',
        username: 'johndoe',
        bio: null,
        profile_image: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // No existing artist with this user_id
      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Username is taken
      mockSupabase.single.mockResolvedValueOnce({
        data: existingUsernameArtist,
        error: null,
      });

      const result = await createArtist(artistData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('이 사용자명은 이미 사용 중입니다.');
    });

    it('should handle optional fields (bio, profile_image)', async () => {
      const artistData = {
        user_id: 'user-1',
        name: 'John Doe',
        username: 'johndoe',
      };

      const mockCreatedArtist: Database.Artist = {
        id: 'artist-1',
        ...artistData,
        bio: null,
        profile_image: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: mockCreatedArtist,
        error: null,
      });

      const result = await createArtist(artistData);

      expect(result.success).toBe(true);
      expect(result.data?.bio).toBeNull();
      expect(result.data?.profile_image).toBeNull();
    });
  });

  describe('updateArtist()', () => {
    it('should successfully update artist information', async () => {
      const updateData = {
        name: 'Updated Name',
        bio: 'Updated bio',
      };

      const mockUpdatedArtist: Database.Artist = {
        id: 'artist-1',
        user_id: 'user-1',
        name: 'Updated Name',
        username: 'johndoe',
        bio: 'Updated bio',
        profile_image: 'profile.jpg',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUpdatedArtist,
        error: null,
      });

      const result = await updateArtist('artist-1', updateData);

      expect(mockSupabase.from).toHaveBeenCalledWith('artists');
      expect(mockSupabase.update).toHaveBeenCalledWith(updateData);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'artist-1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedArtist);
    });

    it('should validate username uniqueness when updating', async () => {
      const updateData = {
        username: 'newusername',
      };

      // Mock getArtistByUsername to return null (username available)
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      const mockUpdatedArtist: Database.Artist = {
        id: 'artist-1',
        user_id: 'user-1',
        name: 'John Doe',
        username: 'newusername',
        bio: null,
        profile_image: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockUpdatedArtist,
        error: null,
      });

      const result = await updateArtist('artist-1', updateData);

      expect(result.success).toBe(true);
    });

    it('should fail when attempting to change to existing username', async () => {
      const updateData = {
        username: 'existingusername',
      };

      const existingArtist: Database.Artist = {
        id: 'artist-2',
        user_id: 'user-2',
        name: 'Other Artist',
        username: 'existingusername',
        bio: null,
        profile_image: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: existingArtist,
        error: null,
      });

      const result = await updateArtist('artist-1', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('이 사용자명은 이미 사용 중입니다.');
    });

    it('should allow artist to keep their own username', async () => {
      const updateData = {
        username: 'johndoe',
        bio: 'Updated bio',
      };

      const existingArtist: Database.Artist = {
        id: 'artist-1',
        user_id: 'user-1',
        name: 'John Doe',
        username: 'johndoe',
        bio: 'Old bio',
        profile_image: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: existingArtist,
        error: null,
      });

      const mockUpdatedArtist: Database.Artist = {
        ...existingArtist,
        bio: 'Updated bio',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockUpdatedArtist,
        error: null,
      });

      const result = await updateArtist('artist-1', updateData);

      expect(result.success).toBe(true);
      expect(result.data?.username).toBe('johndoe');
      expect(result.data?.bio).toBe('Updated bio');
    });
  });
});
