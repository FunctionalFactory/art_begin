import { toggleLike } from '../actions';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Mock dependencies
jest.mock('@/utils/supabase/server');
jest.mock('next/cache');

describe('toggleLike', () => {
  let mockSupabase: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock Supabase client
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  describe('Authentication', () => {
    it('should return error when user is not authenticated', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      // Act
      const result = await toggleLike('artwork-123');

      // Assert
      expect(result).toEqual({
        success: false,
        error: '로그인이 필요합니다.',
        isLiked: false,
        likesCount: 0,
      });
    });

    it('should return error when auth error occurs', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' },
      });

      // Act
      const result = await toggleLike('artwork-123');

      // Assert
      expect(result).toEqual({
        success: false,
        error: '로그인이 필요합니다.',
        isLiked: false,
        likesCount: 0,
      });
    });
  });

  describe('Adding like (favorite)', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
    });

    it('should add like successfully when not already liked', async () => {
      // Arrange
      const artworkId = 'artwork-123';

      // No existing favorite
      const mockFavoriteSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      // Insert favorite
      const mockFavoriteInsert = {
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      // Get artwork likes count
      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { likes: 5 },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockFavoriteSelect)
        .mockReturnValueOnce(mockFavoriteInsert)
        .mockReturnValueOnce(mockArtworkSelect);

      // Act
      const result = await toggleLike(artworkId);

      // Assert
      expect(result).toEqual({
        success: true,
        isLiked: true,
        likesCount: 5,
      });
    });

    it('should insert favorite with correct user and artwork ids', async () => {
      // Arrange
      const artworkId = 'artwork-123';
      const userId = 'user-123';

      const mockFavoriteSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      const mockFavoriteInsert = {
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { likes: 1 },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockFavoriteSelect)
        .mockReturnValueOnce(mockFavoriteInsert)
        .mockReturnValueOnce(mockArtworkSelect);

      // Act
      await toggleLike(artworkId);

      // Assert
      expect(mockFavoriteInsert.insert).toHaveBeenCalledWith({
        user_id: userId,
        artwork_id: artworkId,
      });
    });

    it('should update artwork likes count after adding like', async () => {
      // Arrange
      const artworkId = 'artwork-123';
      const newLikesCount = 10;

      const mockFavoriteSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      const mockFavoriteInsert = {
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { likes: newLikesCount },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockFavoriteSelect)
        .mockReturnValueOnce(mockFavoriteInsert)
        .mockReturnValueOnce(mockArtworkSelect);

      // Act
      const result = await toggleLike(artworkId);

      // Assert
      expect(result.likesCount).toBe(newLikesCount);
    });
  });

  describe('Removing like (unfavorite)', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
    });

    it('should remove like successfully when already liked', async () => {
      // Arrange
      const artworkId = 'artwork-123';

      // Existing favorite
      const mockFavoriteSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { user_id: 'user-123' },
          error: null,
        }),
      };

      // Delete favorite
      const mockFavoriteDelete = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      // Chain eq() calls: first returns this, second returns promise
      mockFavoriteDelete.eq
        .mockReturnValueOnce(mockFavoriteDelete)
        .mockResolvedValueOnce({ error: null });

      // Get artwork likes count
      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { likes: 3 },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockFavoriteSelect)
        .mockReturnValueOnce(mockFavoriteDelete)
        .mockReturnValueOnce(mockArtworkSelect);

      // Act
      const result = await toggleLike(artworkId);

      // Assert
      expect(result).toEqual({
        success: true,
        isLiked: false,
        likesCount: 3,
      });
    });

    it('should delete favorite with correct user and artwork ids', async () => {
      // Arrange
      const artworkId = 'artwork-123';
      const userId = 'user-123';

      const mockFavoriteSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { user_id: userId },
          error: null,
        }),
      };

      const mockFavoriteDelete = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      // Chain eq() calls: first returns this, second returns promise
      mockFavoriteDelete.eq
        .mockReturnValueOnce(mockFavoriteDelete)
        .mockResolvedValueOnce({ error: null });

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { likes: 2 },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockFavoriteSelect)
        .mockReturnValueOnce(mockFavoriteDelete)
        .mockReturnValueOnce(mockArtworkSelect);

      // Act
      await toggleLike(artworkId);

      // Assert
      const eqCalls = mockFavoriteDelete.eq.mock.calls;
      expect(eqCalls).toContainEqual(['user_id', userId]);
      expect(eqCalls).toContainEqual(['artwork_id', artworkId]);
    });

    it('should update artwork likes count after removing like', async () => {
      // Arrange
      const artworkId = 'artwork-123';
      const newLikesCount = 4;

      const mockFavoriteSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { user_id: 'user-123' },
          error: null,
        }),
      };

      const mockFavoriteDelete = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      // Chain eq() calls: first returns this, second returns promise
      mockFavoriteDelete.eq
        .mockReturnValueOnce(mockFavoriteDelete)
        .mockResolvedValueOnce({ error: null });

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { likes: newLikesCount },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockFavoriteSelect)
        .mockReturnValueOnce(mockFavoriteDelete)
        .mockReturnValueOnce(mockArtworkSelect);

      // Act
      const result = await toggleLike(artworkId);

      // Assert
      expect(result.likesCount).toBe(newLikesCount);
    });
  });

  describe('Toggle functionality', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
    });

    it('should toggle from unliked to liked', async () => {
      // Arrange - Not liked
      const mockFavoriteSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null, // Not liked
          error: null,
        }),
      };

      const mockFavoriteInsert = {
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { likes: 1 },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockFavoriteSelect)
        .mockReturnValueOnce(mockFavoriteInsert)
        .mockReturnValueOnce(mockArtworkSelect);

      // Act
      const result = await toggleLike('artwork-123');

      // Assert
      expect(result.isLiked).toBe(true);
    });

    it('should toggle from liked to unliked', async () => {
      // Arrange - Already liked
      const mockFavoriteSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { user_id: 'user-123' }, // Already liked
          error: null,
        }),
      };

      const mockFavoriteDelete = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      // Chain eq() calls: first returns this, second returns promise
      mockFavoriteDelete.eq
        .mockReturnValueOnce(mockFavoriteDelete)
        .mockResolvedValueOnce({ error: null });

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { likes: 0 },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockFavoriteSelect)
        .mockReturnValueOnce(mockFavoriteDelete)
        .mockReturnValueOnce(mockArtworkSelect);

      // Act
      const result = await toggleLike('artwork-123');

      // Assert
      expect(result.isLiked).toBe(false);
    });
  });

  describe('revalidatePath calls', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
    });

    it('should call revalidatePath after toggling like', async () => {
      // Arrange
      const artworkId = 'artwork-123';

      const mockFavoriteSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      const mockFavoriteInsert = {
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { likes: 1 },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockFavoriteSelect)
        .mockReturnValueOnce(mockFavoriteInsert)
        .mockReturnValueOnce(mockArtworkSelect);

      // Act
      await toggleLike(artworkId);

      // Assert
      expect(revalidatePath).toHaveBeenCalledWith('/');
      expect(revalidatePath).toHaveBeenCalledWith('/explore');
      expect(revalidatePath).toHaveBeenCalledWith(`/artwork/${artworkId}`);
      expect(revalidatePath).toHaveBeenCalledWith('/my-page');
      expect(revalidatePath).toHaveBeenCalledTimes(4);
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
    });

    it('should handle favorite check error', async () => {
      // Arrange
      const mockFavoriteSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      };

      mockSupabase.from.mockReturnValue(mockFavoriteSelect);

      // Act
      const result = await toggleLike('artwork-123');

      // Assert
      expect(result).toEqual({
        success: false,
        error: '오류가 발생했습니다.',
        isLiked: false,
        likesCount: 0,
      });
    });

    it('should handle add favorite error', async () => {
      // Arrange
      const mockFavoriteSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      const mockFavoriteInsert = {
        insert: jest.fn().mockResolvedValue({
          error: { message: 'Insert failed' },
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockFavoriteSelect)
        .mockReturnValueOnce(mockFavoriteInsert);

      // Act
      const result = await toggleLike('artwork-123');

      // Assert
      expect(result).toEqual({
        success: false,
        error: '좋아요 추가 중 오류가 발생했습니다.',
        isLiked: false,
        likesCount: 0,
      });
    });

    it('should handle remove favorite error', async () => {
      // Arrange
      const mockFavoriteSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { user_id: 'user-123' },
          error: null,
        }),
      };

      const mockFavoriteDelete = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      // Chain eq() calls: first returns this, second returns error
      mockFavoriteDelete.eq
        .mockReturnValueOnce(mockFavoriteDelete)
        .mockResolvedValueOnce({ error: { message: 'Delete failed' } });

      mockSupabase.from
        .mockReturnValueOnce(mockFavoriteSelect)
        .mockReturnValueOnce(mockFavoriteDelete);

      // Act
      const result = await toggleLike('artwork-123');

      // Assert
      expect(result).toEqual({
        success: false,
        error: '좋아요 취소 중 오류가 발생했습니다.',
        isLiked: true,
        likesCount: 0,
      });
    });

    it('should handle non-existent artwork gracefully', async () => {
      // Arrange
      const mockFavoriteSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      const mockFavoriteInsert = {
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Artwork not found' },
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockFavoriteSelect)
        .mockReturnValueOnce(mockFavoriteInsert)
        .mockReturnValueOnce(mockArtworkSelect);

      // Act
      const result = await toggleLike('non-existent');

      // Assert
      expect(result.success).toBe(true);
      expect(result.likesCount).toBe(0);
    });
  });
});
