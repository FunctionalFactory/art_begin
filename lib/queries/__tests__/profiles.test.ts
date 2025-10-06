import {
  getProfileByUserId,
  getProfileByUsername,
  updateProfile,
} from '../profiles';
import { createClient } from '@/utils/supabase/server';
import type { Database } from '@/lib/types';

// Mock Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('profiles queries', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
      single: jest.fn(),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    jest.clearAllMocks();
  });

  describe('getProfileByUserId()', () => {
    it('should retrieve profile by user_id', async () => {
      const mockProfile: Database.Profile = {
        id: 'user-1',
        role: 'buyer',
        username: 'johndoe',
        display_name: 'John Doe',
        bio: 'User bio',
        profile_image: 'profile.jpg',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.maybeSingle.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await getProfileByUserId('user-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'user-1');
      expect(mockSupabase.maybeSingle).toHaveBeenCalled();
      expect(result).toEqual(mockProfile);
    });

    it('should return null when user_id does not exist', async () => {
      mockSupabase.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await getProfileByUserId('non-existent-user');

      expect(result).toBeNull();
    });
  });

  describe('getProfileByUsername()', () => {
    it('should retrieve profile by username', async () => {
      const mockProfile: Database.Profile = {
        id: 'user-1',
        role: 'artist',
        username: 'johndoe',
        display_name: 'John Doe',
        bio: 'Artist bio',
        profile_image: 'profile.jpg',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.maybeSingle.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await getProfileByUsername('johndoe');

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('username', 'johndoe');
      expect(mockSupabase.maybeSingle).toHaveBeenCalled();
      expect(result).toEqual(mockProfile);
    });

    it('should return null when username does not exist', async () => {
      mockSupabase.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await getProfileByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateProfile()', () => {
    it('should successfully update profile', async () => {
      const updateData = {
        display_name: 'Updated Name',
        bio: 'Updated bio',
      };

      const mockUpdatedProfile: Database.Profile = {
        id: 'user-1',
        role: 'buyer',
        username: 'johndoe',
        display_name: 'Updated Name',
        bio: 'Updated bio',
        profile_image: 'profile.jpg',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUpdatedProfile,
        error: null,
      });

      const result = await updateProfile('user-1', updateData);

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabase.update).toHaveBeenCalledWith(updateData);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'user-1');
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedProfile);
    });

    it('should validate username uniqueness when updating', async () => {
      const updateData = {
        username: 'newusername',
      };

      // Mock getProfileByUsername to return null (username available)
      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const mockUpdatedProfile: Database.Profile = {
        id: 'user-1',
        role: 'buyer',
        username: 'newusername',
        display_name: 'John Doe',
        bio: null,
        profile_image: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockUpdatedProfile,
        error: null,
      });

      const result = await updateProfile('user-1', updateData);

      expect(result.success).toBe(true);
      expect(result.data?.username).toBe('newusername');
    });

    it('should change role from buyer to artist', async () => {
      const updateData = {
        role: 'artist' as const,
      };

      const mockUpdatedProfile: Database.Profile = {
        id: 'user-1',
        role: 'artist',
        username: 'johndoe',
        display_name: 'John Doe',
        bio: null,
        profile_image: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUpdatedProfile,
        error: null,
      });

      const result = await updateProfile('user-1', updateData);

      expect(result.success).toBe(true);
      expect(result.data?.role).toBe('artist');
    });

    it('should support partial updates', async () => {
      const updateData = {
        bio: 'New bio only',
      };

      const mockUpdatedProfile: Database.Profile = {
        id: 'user-1',
        role: 'buyer',
        username: 'johndoe',
        display_name: 'John Doe',
        bio: 'New bio only',
        profile_image: 'profile.jpg',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUpdatedProfile,
        error: null,
      });

      const result = await updateProfile('user-1', updateData);

      expect(result.success).toBe(true);
      expect(result.data?.bio).toBe('New bio only');
      expect(result.data?.username).toBe('johndoe');
      expect(result.data?.display_name).toBe('John Doe');
    });

    it('should handle optional fields with null values', async () => {
      const updateData = {
        bio: undefined,
        profile_image: undefined,
      };

      const mockUpdatedProfile: Database.Profile = {
        id: 'user-1',
        role: 'buyer',
        username: 'johndoe',
        display_name: 'John Doe',
        bio: null,
        profile_image: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUpdatedProfile,
        error: null,
      });

      const result = await updateProfile('user-1', updateData);

      expect(result.success).toBe(true);
      expect(result.data?.bio).toBeNull();
      expect(result.data?.profile_image).toBeNull();
    });

    it('should fail when username is already taken by another user', async () => {
      const updateData = {
        username: 'existingusername',
      };

      const existingProfile: Database.Profile = {
        id: 'user-2',
        role: 'buyer',
        username: 'existingusername',
        display_name: 'Other User',
        bio: null,
        profile_image: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.maybeSingle.mockResolvedValue({
        data: existingProfile,
        error: null,
      });

      const result = await updateProfile('user-1', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('이 사용자명은 이미 사용 중입니다.');
    });

    it('should allow user to keep their own username', async () => {
      const updateData = {
        username: 'johndoe',
        display_name: 'Updated Name',
      };

      const existingProfile: Database.Profile = {
        id: 'user-1',
        role: 'buyer',
        username: 'johndoe',
        display_name: 'John Doe',
        bio: null,
        profile_image: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: existingProfile,
        error: null,
      });

      const mockUpdatedProfile: Database.Profile = {
        ...existingProfile,
        display_name: 'Updated Name',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockUpdatedProfile,
        error: null,
      });

      const result = await updateProfile('user-1', updateData);

      expect(result.success).toBe(true);
      expect(result.data?.username).toBe('johndoe');
      expect(result.data?.display_name).toBe('Updated Name');
    });

    it('should change role from artist to buyer', async () => {
      const updateData = {
        role: 'buyer' as const,
      };

      const mockUpdatedProfile: Database.Profile = {
        id: 'user-1',
        role: 'buyer',
        username: 'johndoe',
        display_name: 'John Doe',
        bio: null,
        profile_image: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUpdatedProfile,
        error: null,
      });

      const result = await updateProfile('user-1', updateData);

      expect(result.success).toBe(true);
      expect(result.data?.role).toBe('buyer');
    });

    it('should update all fields simultaneously', async () => {
      const updateData = {
        username: 'newyahoo',
        display_name: 'New Display Name',
        bio: 'New bio',
        profile_image: 'new-profile.jpg',
        role: 'artist' as const,
      };

      // Mock getProfileByUsername to return null (username available)
      mockSupabase.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const mockUpdatedProfile: Database.Profile = {
        id: 'user-1',
        role: 'artist',
        username: 'newyahoo',
        display_name: 'New Display Name',
        bio: 'New bio',
        profile_image: 'new-profile.jpg',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockUpdatedProfile,
        error: null,
      });

      const result = await updateProfile('user-1', updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedProfile);
    });
  });
});
